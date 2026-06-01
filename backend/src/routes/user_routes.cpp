#include "routes/user_routes.hpp"
#include "db/database.hpp"
#include "utils/jwt_utils.hpp"
#include "utils/response_utils.hpp"
#include <pqxx/pqxx>

void register_user_routes(crow::App<AuthMiddleware>& app) {

    // ───── GET /api/users/me ─────
    CROW_ROUTE(app, "/api/users/me").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT id, nome, email, tipo, criado_em "
                "FROM users WHERE id = " + std::to_string(ctx.user_id) +
                " AND anonimizado = FALSE AND deletado_em IS NULL"
            );
            if (result.empty()) return not_found("Usuário não encontrado");

            auto row = result[0];
            crow::json::wvalue data;
            data["id"]        = row["id"].as<int>();
            data["nome"]      = row["nome"].as<std::string>();
            data["email"]     = row["email"].as<std::string>();
            data["tipo"]      = row["tipo"].as<std::string>();
            data["criado_em"] = row["criado_em"].as<std::string>();
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── PUT /api/users/me ─────
    CROW_ROUTE(app, "/api/users/me").methods(crow::HTTPMethod::PUT)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        auto body = crow::json::load(req.body);
        if (!body || !body.has("nome"))
            return bad_request("Campo 'nome' é obrigatório");

        std::string nome = body["nome"].s();

        try {
            auto& db = Database::instance();
            pqxx::work txn(db.conn());
            txn.exec(
                "UPDATE users SET nome = " + txn.quote(nome) +
                " WHERE id = " + std::to_string(ctx.user_id)
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Nome atualizado";
            data["nome"]    = nome;
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── DELETE /api/users/me ───── (LGPD: anonimizar conta)
    CROW_ROUTE(app, "/api/users/me").methods(crow::HTTPMethod::DELETE)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::work txn(db.conn());
            txn.exec(
                "UPDATE users SET "
                "nome = 'Usuário Anonimizado', "
                "email = 'anonimo_" + std::to_string(ctx.user_id) + "@removed.local', "
                "senha_hash = '', "
                "anonimizado = TRUE, "
                "deletado_em = NOW() "
                "WHERE id = " + std::to_string(ctx.user_id)
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Conta anonimizada com sucesso (LGPD)";
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/users/me/stats ─────
    CROW_ROUTE(app, "/api/users/me/stats").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT ps.level_id, gl.dificuldade, ps.partidas_jogadas, "
                "ps.vitorias, ps.derrotas, ps.pontos_totais, ps.ultima_partida "
                "FROM player_stats ps "
                "JOIN game_levels gl ON gl.id = ps.level_id "
                "WHERE ps.user_id = " + std::to_string(ctx.user_id)
            );

            crow::json::wvalue data;
            std::vector<crow::json::wvalue> stats_list;
            for (const auto& row : result) {
                crow::json::wvalue stat;
                stat["level_id"]          = row["level_id"].as<int>();
                stat["dificuldade"]       = row["dificuldade"].as<std::string>();
                stat["partidas_jogadas"] = row["partidas_jogadas"].as<int>();
                stat["vitorias"]         = row["vitorias"].as<int>();
                stat["derrotas"]         = row["derrotas"].as<int>();
                stat["pontos_totais"]    = row["pontos_totais"].as<int>();
                if (!row["ultima_partida"].is_null())
                    stat["ultima_partida"] = row["ultima_partida"].as<std::string>();
                stats_list.push_back(std::move(stat));
            }
            data["stats"] = std::move(stats_list);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/turmas ───── (professor cria turma)
    CROW_ROUTE(app, "/api/turmas").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        auto body = crow::json::load(req.body);
        if (!body || !body.has("nome"))
            return bad_request("Campo 'nome' é obrigatório");

        std::string nome = body["nome"].s();

        try {
            auto& db = Database::instance();
            pqxx::work txn(db.conn());
            auto result = txn.exec(
                "INSERT INTO turmas (nome, professor_id) VALUES (" +
                txn.quote(nome) + ", " + std::to_string(ctx.user_id) +
                ") RETURNING id"
            );
            txn.commit();

            crow::json::wvalue data;
            data["turma_id"] = result[0][0].as<int>();
            data["nome"]     = nome;
            return created(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/turmas ───── (professor lista suas turmas)
    CROW_ROUTE(app, "/api/turmas").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT t.id, t.nome, t.criado_em, "
                "(SELECT COUNT(*) FROM turma_alunos ta WHERE ta.turma_id = t.id) AS total_alunos "
                "FROM turmas t WHERE t.professor_id = " + std::to_string(ctx.user_id) +
                " ORDER BY t.criado_em DESC"
            );

            std::vector<crow::json::wvalue> turmas_list;
            for (const auto& row : result) {
                crow::json::wvalue turma;
                turma["id"]            = row["id"].as<int>();
                turma["nome"]          = row["nome"].as<std::string>();
                turma["criado_em"]     = row["criado_em"].as<std::string>();
                turma["total_alunos"] = row["total_alunos"].as<int>();
                turmas_list.push_back(std::move(turma));
            }

            crow::json::wvalue data;
            data["turmas"] = std::move(turmas_list);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/turmas/<int>/alunos ───── (professor adiciona aluno)
    CROW_ROUTE(app, "/api/turmas/<int>/alunos").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req, int turma_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        auto body = crow::json::load(req.body);
        if (!body || !body.has("email"))
            return bad_request("Campo 'email' do aluno é obrigatório");

        std::string email = body["email"].s();

        try {
            auto& db = Database::instance();

            // Verifica se turma pertence ao professor
            {
                pqxx::nontransaction ntxn(db.conn());
                auto check = ntxn.exec(
                    "SELECT id FROM turmas WHERE id = " + std::to_string(turma_id) +
                    " AND professor_id = " + std::to_string(ctx.user_id)
                );
                if (check.empty()) return forbidden("Turma não pertence a este professor");
            }

            // Busca aluno pelo email
            pqxx::nontransaction ntxn2(db.conn());
            auto aluno = ntxn2.exec(
                "SELECT id FROM users WHERE email = " + ntxn2.quote(email) +
                " AND tipo = 'ALUNO' AND anonimizado = FALSE"
            );
            if (aluno.empty()) return not_found("Aluno não encontrado");

            int aluno_id = aluno[0][0].as<int>();

            pqxx::work txn(db.conn());
            txn.exec(
                "INSERT INTO turma_alunos (turma_id, aluno_id) VALUES (" +
                std::to_string(turma_id) + ", " + std::to_string(aluno_id) +
                ") ON CONFLICT DO NOTHING"
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"]  = "Aluno adicionado à turma";
            data["aluno_id"] = aluno_id;
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/game-levels ─────
    CROW_ROUTE(app, "/api/game-levels").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec("SELECT id, nome, dificuldade FROM game_levels ORDER BY id");

            std::vector<crow::json::wvalue> levels;
            for (const auto& row : result) {
                crow::json::wvalue level;
                level["id"]          = row["id"].as<int>();
                level["nome"]        = row["nome"].as<std::string>();
                level["dificuldade"] = row["dificuldade"].as<std::string>();
                levels.push_back(std::move(level));
            }

            crow::json::wvalue data;
            data["levels"] = std::move(levels);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/tiles ───── (listar peças por nível)
    CROW_ROUTE(app, "/api/tiles").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        auto level_id_str = req.url_params.get("level_id");
        if (!level_id_str) return bad_request("Parâmetro 'level_id' é obrigatório");

        int level_id = std::stoi(level_id_str);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT dt.id, "
                "dva.valor AS valor_a, dva.categoria AS categoria_a, "
                "dvb.valor AS valor_b, dvb.categoria AS categoria_b "
                "FROM domino_tiles dt "
                "JOIN tile_levels tl ON tl.tile_id = dt.id "
                "JOIN domino_values dva ON dva.id = dt.valor_a "
                "JOIN domino_values dvb ON dvb.id = dt.valor_b "
                "WHERE tl.level_id = " + std::to_string(level_id)
            );

            std::vector<crow::json::wvalue> tiles;
            for (const auto& row : result) {
                crow::json::wvalue tile;
                tile["id"]          = row["id"].as<int>();
                tile["valor_a"]     = row["valor_a"].as<std::string>();
                tile["categoria_a"] = row["categoria_a"].as<std::string>();
                tile["valor_b"]     = row["valor_b"].as<std::string>();
                tile["categoria_b"] = row["categoria_b"].as<std::string>();
                tiles.push_back(std::move(tile));
            }

            crow::json::wvalue data;
            data["tiles"] = std::move(tiles);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });
}
