#include "routes/match_routes.hpp"
#include "db/database.hpp"
#include "utils/jwt_utils.hpp"
#include "utils/response_utils.hpp"
#include <pqxx/pqxx>
#include <random>
#include <algorithm>
#include <vector>
#include <string>

// Gera código de sala aleatório de 6 caracteres alfanuméricos
static std::string gerar_codigo_sala() {
    static const char chars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, sizeof(chars) - 2);
    std::string code;
    for (int i = 0; i < 6; ++i) code += chars[dist(gen)];
    return code;
}

void register_match_routes(crow::App<AuthMiddleware>& app) {

    // ───── POST /api/matches ───── (criar partida)
    CROW_ROUTE(app, "/api/matches").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        auto body = crow::json::load(req.body);
        if (!body || !body.has("level_id"))
            return bad_request("Campo 'level_id' é obrigatório");

        int level_id = body["level_id"].i();
        int max_jogadores = body.has("max_jogadores") ? (int)body["max_jogadores"].i() : 4;

        if (max_jogadores < 2 || max_jogadores > 4)
            return bad_request("max_jogadores deve ser entre 2 e 4");

        try {
            auto& db = Database::instance();
            std::string codigo = gerar_codigo_sala();

            pqxx::work txn(db.conn());
            auto result = txn.exec(
                "INSERT INTO matches (level_id, codigo_sala, max_jogadores) VALUES (" +
                std::to_string(level_id) + ", " +
                txn.quote(codigo) + ", " +
                std::to_string(max_jogadores) +
                ") RETURNING id"
            );
            int match_id = result[0][0].as<int>();

            // Criador entra automaticamente na partida
            txn.exec(
                "INSERT INTO match_players (match_id, user_id) VALUES (" +
                std::to_string(match_id) + ", " + std::to_string(ctx.user_id) + ")"
            );
            txn.commit();

            crow::json::wvalue data;
            data["match_id"]    = match_id;
            data["codigo_sala"] = codigo;
            data["level_id"]    = level_id;
            data["max_jogadores"] = max_jogadores;
            return created(data);
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/matches/open ───── (lobby: partidas abertas)
    CROW_ROUTE(app, "/api/matches/open").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT id, codigo_sala, max_jogadores, dificuldade, "
                "jogadores_atuais, vagas_restantes, criado_em "
                "FROM vw_partidas_abertas "
                "WHERE vagas_restantes > 0 "
                "ORDER BY criado_em DESC"
            );

            std::vector<crow::json::wvalue> matches;
            for (const auto& row : result) {
                crow::json::wvalue m;
                m["id"]               = row["id"].as<int>();
                m["codigo_sala"]      = row["codigo_sala"].as<std::string>();
                m["max_jogadores"]    = row["max_jogadores"].as<int>();
                m["dificuldade"]      = row["dificuldade"].as<std::string>();
                m["jogadores_atuais"] = row["jogadores_atuais"].as<int>();
                m["vagas_restantes"]  = row["vagas_restantes"].as<int>();
                m["criado_em"]        = row["criado_em"].as<std::string>();
                matches.push_back(std::move(m));
            }

            crow::json::wvalue data;
            data["matches"] = std::move(matches);
            return ok(data);
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/matches/<int>/join ───── (entrar via código)
    CROW_ROUTE(app, "/api/matches/<int>/join").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();

            // Verifica se a partida existe e está aguardando
            pqxx::nontransaction ntxn(db.conn());
            auto match = ntxn.exec(
                "SELECT status, max_jogadores, "
                "(SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id) AS total "
                "FROM matches m WHERE m.id = " + std::to_string(match_id)
            );
            if (match.empty()) return not_found("Partida não encontrada");
            if (match[0]["status"].as<std::string>() != "AGUARDANDO")
                return bad_request("Partida não está aguardando jogadores");

            int max_j = match[0]["max_jogadores"].as<int>();
            int total = match[0]["total"].as<int>();
            if (total >= max_j) return bad_request("Partida lotada");

            // Verifica se já está na partida
            auto already = ntxn.exec(
                "SELECT id FROM match_players WHERE match_id = " +
                std::to_string(match_id) + " AND user_id = " + std::to_string(ctx.user_id)
            );
            if (!already.empty()) return bad_request("Você já está nesta partida");

            pqxx::work txn(db.conn());
            txn.exec(
                "INSERT INTO match_players (match_id, user_id) VALUES (" +
                std::to_string(match_id) + ", " + std::to_string(ctx.user_id) + ")"
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"]  = "Entrou na partida";
            data["match_id"] = match_id;
            return ok(data);
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/matches/<int> ───── (detalhes da partida)
    CROW_ROUTE(app, "/api/matches/<int>").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            auto result = txn.exec(
                "SELECT m.id, m.level_id, gl.dificuldade, m.status, m.codigo_sala, "
                "m.max_jogadores, m.iniciado_em, m.finalizado_em, m.criado_em "
                "FROM matches m "
                "JOIN game_levels gl ON gl.id = m.level_id "
                "WHERE m.id = " + std::to_string(match_id)
            );
            if (result.empty()) return not_found("Partida não encontrada");

            auto row = result[0];
            crow::json::wvalue data;
            data["id"]            = row["id"].as<int>();
            data["level_id"]      = row["level_id"].as<int>();
            data["dificuldade"]   = row["dificuldade"].as<std::string>();
            data["status"]        = row["status"].as<std::string>();
            data["codigo_sala"]   = row["codigo_sala"].as<std::string>();
            data["max_jogadores"] = row["max_jogadores"].as<int>();
            if (!row["iniciado_em"].is_null())
                data["iniciado_em"] = row["iniciado_em"].as<std::string>();
            if (!row["finalizado_em"].is_null())
                data["finalizado_em"] = row["finalizado_em"].as<std::string>();
            data["criado_em"] = row["criado_em"].as<std::string>();

            // Lista jogadores
            auto players = txn.exec(
                "SELECT mp.id, u.nome, mp.ordem_jogada, mp.pontuacao, mp.vencedor "
                "FROM match_players mp "
                "JOIN users u ON u.id = mp.user_id "
                "WHERE mp.match_id = " + std::to_string(match_id) +
                " ORDER BY mp.ordem_jogada NULLS LAST"
            );

            std::vector<crow::json::wvalue> players_list;
            for (const auto& p : players) {
                crow::json::wvalue pl;
                pl["player_id"]    = p["id"].as<int>();
                pl["nome"]         = p["nome"].as<std::string>();
                if (!p["ordem_jogada"].is_null())
                    pl["ordem_jogada"] = p["ordem_jogada"].as<int>();
                pl["pontuacao"]    = p["pontuacao"].as<int>();
                pl["vencedor"]     = p["vencedor"].as<bool>();
                players_list.push_back(std::move(pl));
            }
            data["jogadores"] = std::move(players_list);

            return ok(data);
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/matches/<int>/start ───── (iniciar partida + distribuir peças)
    CROW_ROUTE(app, "/api/matches/<int>/start").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();

            // Verifica se a partida está AGUARDANDO
            pqxx::nontransaction ntxn(db.conn());
            auto match = ntxn.exec(
                "SELECT m.status, m.level_id FROM matches m WHERE m.id = " +
                std::to_string(match_id)
            );
            if (match.empty()) return not_found("Partida não encontrada");
            if (match[0]["status"].as<std::string>() != "AGUARDANDO")
                return bad_request("Partida não pode ser iniciada");

            int level_id = match[0]["level_id"].as<int>();

            // Busca jogadores
            auto players_result = ntxn.exec(
                "SELECT id, user_id FROM match_players WHERE match_id = " +
                std::to_string(match_id)
            );
            int num_players = players_result.size();
            if (num_players < 2) return bad_request("Mínimo 2 jogadores para iniciar");

            // Busca peças do nível
            auto tiles_result = ntxn.exec(
                "SELECT dt.id FROM domino_tiles dt "
                "JOIN tile_levels tl ON tl.tile_id = dt.id "
                "WHERE tl.level_id = " + std::to_string(level_id)
            );

            std::vector<int> tile_ids;
            for (const auto& row : tiles_result)
                tile_ids.push_back(row[0].as<int>());

            if ((int)tile_ids.size() < num_players * 7 + 1)
                return bad_request("Peças insuficientes para este nível e número de jogadores");

            // Embaralha
            std::random_device rd;
            std::mt19937 gen(rd());
            std::shuffle(tile_ids.begin(), tile_ids.end(), gen);

            // Coleta IDs dos jogadores e ordem aleatória
            std::vector<int> player_ids;
            for (const auto& row : players_result)
                player_ids.push_back(row["id"].as<int>());
            std::shuffle(player_ids.begin(), player_ids.end(), gen);

            pqxx::work txn(db.conn());

            int tile_idx = 0;

            // Distribui 7 peças por jogador
            for (int i = 0; i < num_players; ++i) {
                // Define ordem de jogada
                txn.exec(
                    "UPDATE match_players SET ordem_jogada = " + std::to_string(i + 1) +
                    " WHERE id = " + std::to_string(player_ids[i])
                );
                for (int j = 0; j < 7; ++j) {
                    txn.exec(
                        "INSERT INTO player_hands (match_player_id, tile_id) VALUES (" +
                        std::to_string(player_ids[i]) + ", " +
                        std::to_string(tile_ids[tile_idx++]) + ")"
                    );
                }
            }

            // Coloca 1 peça no centro
            txn.exec(
                "INSERT INTO board_tiles (match_id, tile_id, posicao, lado) VALUES (" +
                std::to_string(match_id) + ", " +
                std::to_string(tile_ids[tile_idx]) + ", 0, 'CENTRO')"
            );

            // Atualiza status
            txn.exec(
                "UPDATE matches SET status = 'EM_ANDAMENTO', iniciado_em = NOW() "
                "WHERE id = " + std::to_string(match_id)
            );

            txn.commit();

            crow::json::wvalue data;
            data["message"]  = "Partida iniciada";
            data["match_id"] = match_id;
            data["jogadores"] = num_players;
            data["pecas_distribuidas"] = num_players * 7;
            return ok(data);
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/matches/<int>/cancel ─────
    CROW_ROUTE(app, "/api/matches/<int>/cancel").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::work txn(db.conn());
            txn.exec(
                "UPDATE matches SET status = 'CANCELADA', finalizado_em = NOW() "
                "WHERE id = " + std::to_string(match_id) +
                " AND status IN ('AGUARDANDO', 'EM_ANDAMENTO')"
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Partida cancelada";
            return ok(data);
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });
}
