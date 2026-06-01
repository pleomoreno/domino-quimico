#include "routes/game_routes.hpp"
#include "db/database.hpp"
#include "utils/jwt_utils.hpp"
#include "utils/response_utils.hpp"
#include <pqxx/pqxx>
#include <string>

void register_game_routes(crow::App<AuthMiddleware>& app) {

    // ───── GET /api/matches/<int>/board ───── (estado do tabuleiro)
    CROW_ROUTE(app, "/api/matches/<int>/board").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT bt.id, bt.tile_id, bt.posicao, bt.lado, "
                "dva.valor AS valor_a, dva.categoria AS categoria_a, "
                "dvb.valor AS valor_b, dvb.categoria AS categoria_b "
                "FROM board_tiles bt "
                "JOIN domino_tiles dt ON dt.id = bt.tile_id "
                "JOIN domino_values dva ON dva.id = dt.valor_a "
                "JOIN domino_values dvb ON dvb.id = dt.valor_b "
                "WHERE bt.match_id = " + std::to_string(match_id) +
                " ORDER BY bt.posicao"
            );

            std::vector<crow::json::wvalue> board;
            for (const auto& row : result) {
                crow::json::wvalue tile;
                tile["id"]          = row["id"].as<int>();
                tile["tile_id"]     = row["tile_id"].as<int>();
                tile["posicao"]     = row["posicao"].as<int>();
                tile["lado"]        = row["lado"].as<std::string>();
                tile["valor_a"]     = row["valor_a"].as<std::string>();
                tile["categoria_a"] = row["categoria_a"].as<std::string>();
                tile["valor_b"]     = row["valor_b"].as<std::string>();
                tile["categoria_b"] = row["categoria_b"].as<std::string>();
                board.push_back(std::move(tile));
            }

            crow::json::wvalue data;
            data["board"] = std::move(board);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/matches/<int>/hand ───── (mão do jogador autenticado)
    CROW_ROUTE(app, "/api/matches/<int>/hand").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            // Encontra o match_player_id
            auto mp = txn.exec(
                "SELECT id FROM match_players WHERE match_id = " +
                std::to_string(match_id) + " AND user_id = " + std::to_string(ctx.user_id)
            );
            if (mp.empty()) return forbidden("Você não está nesta partida");
            int mp_id = mp[0][0].as<int>();

            auto result = txn.exec(
                "SELECT ph.id, ph.tile_id, "
                "dva.valor AS valor_a, dva.categoria AS categoria_a, "
                "dvb.valor AS valor_b, dvb.categoria AS categoria_b "
                "FROM player_hands ph "
                "JOIN domino_tiles dt ON dt.id = ph.tile_id "
                "JOIN domino_values dva ON dva.id = dt.valor_a "
                "JOIN domino_values dvb ON dvb.id = dt.valor_b "
                "WHERE ph.match_player_id = " + std::to_string(mp_id) +
                " AND ph.jogada_em IS NULL"
            );

            std::vector<crow::json::wvalue> hand;
            for (const auto& row : result) {
                crow::json::wvalue tile;
                tile["hand_id"]     = row["id"].as<int>();
                tile["tile_id"]     = row["tile_id"].as<int>();
                tile["valor_a"]     = row["valor_a"].as<std::string>();
                tile["categoria_a"] = row["categoria_a"].as<std::string>();
                tile["valor_b"]     = row["valor_b"].as<std::string>();
                tile["categoria_b"] = row["categoria_b"].as<std::string>();
                hand.push_back(std::move(tile));
            }

            crow::json::wvalue data;
            data["hand"] = std::move(hand);
            data["total"] = (int)hand.size();
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/matches/<int>/turn ───── (de quem é a vez)
    CROW_ROUTE(app, "/api/matches/<int>/turn").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            // Conta total de jogadas para determinar de quem é a vez
            auto moves_count = txn.exec(
                "SELECT COUNT(*) FROM moves WHERE match_id = " + std::to_string(match_id)
            );
            int total_moves = moves_count[0][0].as<int>();

            auto players = txn.exec(
                "SELECT mp.id, mp.user_id, mp.ordem_jogada, u.nome "
                "FROM match_players mp "
                "JOIN users u ON u.id = mp.user_id "
                "WHERE mp.match_id = " + std::to_string(match_id) +
                " ORDER BY mp.ordem_jogada"
            );

            if (players.empty()) return not_found("Nenhum jogador encontrado");

            int num_players = players.size();
            int current_idx = total_moves % num_players;

            auto current = players[current_idx];
            crow::json::wvalue data;
            data["player_id"]    = current["id"].as<int>();
            data["user_id"]      = current["user_id"].as<int>();
            data["nome"]         = current["nome"].as<std::string>();
            data["ordem_jogada"] = current["ordem_jogada"].as<int>();
            data["eh_sua_vez"]   = (current["user_id"].as<int>() == ctx.user_id);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/matches/<int>/play ───── (realizar jogada)
    CROW_ROUTE(app, "/api/matches/<int>/play").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        auto body = crow::json::load(req.body);
        if (!body || !body.has("tile_id") || !body.has("lado"))
            return bad_request("Campos 'tile_id' e 'lado' são obrigatórios");

        int tile_id = body["tile_id"].i();
        std::string lado = body["lado"].s();

        if (lado != "ESQUERDA" && lado != "DIREITA")
            return bad_request("Lado deve ser 'ESQUERDA' ou 'DIREITA'");

        try {
            auto& db = Database::instance();
            pqxx::nontransaction ntxn(db.conn());

            // Verifica status da partida
            auto match_check = ntxn.exec(
                "SELECT status, level_id FROM matches WHERE id = " + std::to_string(match_id)
            );
            if (match_check.empty()) return not_found("Partida não encontrada");
            if (match_check[0]["status"].as<std::string>() != "EM_ANDAMENTO")
                return bad_request("Partida não está em andamento");

            int level_id = match_check[0]["level_id"].as<int>();

            // Busca dificuldade do nível
            auto level_check = ntxn.exec(
                "SELECT dificuldade FROM game_levels WHERE id = " + std::to_string(level_id)
            );
            std::string dificuldade = level_check[0][0].as<std::string>();

            // Encontra o match_player_id do jogador
            auto mp = ntxn.exec(
                "SELECT id FROM match_players WHERE match_id = " +
                std::to_string(match_id) + " AND user_id = " + std::to_string(ctx.user_id)
            );
            if (mp.empty()) return forbidden("Você não está nesta partida");
            int mp_id = mp[0][0].as<int>();

            // Verifica se é a vez do jogador
            auto moves_count = ntxn.exec(
                "SELECT COUNT(*) FROM moves WHERE match_id = " + std::to_string(match_id)
            );
            int total_moves = moves_count[0][0].as<int>();

            auto players = ntxn.exec(
                "SELECT id FROM match_players WHERE match_id = " +
                std::to_string(match_id) + " ORDER BY ordem_jogada"
            );
            int num_players = players.size();
            int current_idx = total_moves % num_players;
            int current_mp_id = players[current_idx][0].as<int>();

            if (current_mp_id != mp_id)
                return bad_request("Não é a sua vez");

            // Verifica se a peça está na mão do jogador
            auto hand_check = ntxn.exec(
                "SELECT id FROM player_hands WHERE match_player_id = " +
                std::to_string(mp_id) + " AND tile_id = " + std::to_string(tile_id) +
                " AND jogada_em IS NULL"
            );
            if (hand_check.empty())
                return bad_request("Peça não está na sua mão");
            int hand_id = hand_check[0][0].as<int>();

            // Busca dados da peça a ser jogada
            auto tile_data = ntxn.exec(
                "SELECT dt.valor_a, dt.valor_b, "
                "dva.categoria AS cat_a, dvb.categoria AS cat_b, "
                "dva.valor AS val_a, dvb.valor AS val_b "
                "FROM domino_tiles dt "
                "JOIN domino_values dva ON dva.id = dt.valor_a "
                "JOIN domino_values dvb ON dvb.id = dt.valor_b "
                "WHERE dt.id = " + std::to_string(tile_id)
            );
            std::string cat_a = tile_data[0]["cat_a"].as<std::string>();
            std::string cat_b = tile_data[0]["cat_b"].as<std::string>();
            std::string val_a = tile_data[0]["val_a"].as<std::string>();
            std::string val_b = tile_data[0]["val_b"].as<std::string>();

            // Busca a ponta do tabuleiro no lado solicitado
            std::string order = (lado == "ESQUERDA") ? "ASC" : "DESC";
            auto ponta = ntxn.exec(
                "SELECT bt.tile_id, bt.lado, "
                "dva.categoria AS cat_a, dvb.categoria AS cat_b, "
                "dva.valor AS val_a, dvb.valor AS val_b "
                "FROM board_tiles bt "
                "JOIN domino_tiles dt ON dt.id = bt.tile_id "
                "JOIN domino_values dva ON dva.id = dt.valor_a "
                "JOIN domino_values dvb ON dvb.id = dt.valor_b "
                "WHERE bt.match_id = " + std::to_string(match_id) +
                " ORDER BY bt.posicao " + order + " LIMIT 1"
            );

            if (ponta.empty()) return server_error("Tabuleiro vazio");

            std::string ponta_cat_a = ponta[0]["cat_a"].as<std::string>();
            std::string ponta_cat_b = ponta[0]["cat_b"].as<std::string>();
            std::string ponta_val_a = ponta[0]["val_a"].as<std::string>();
            std::string ponta_val_b = ponta[0]["val_b"].as<std::string>();

            // A ponta exposta depende do lado:
            // ESQUERDA → valor_a da peça na ponta esquerda
            // DIREITA  → valor_b da peça na ponta direita
            std::string ponta_cat = (lado == "ESQUERDA") ? ponta_cat_a : ponta_cat_b;
            std::string ponta_val = (lado == "ESQUERDA") ? ponta_val_a : ponta_val_b;

            // Validação de compatibilidade
            bool compativel = false;
            if (dificuldade == "FÁCIL") {
                // Apenas categoria
                compativel = (cat_a == ponta_cat || cat_b == ponta_cat);
            } else if (dificuldade == "MÉDIO") {
                // Categoria deve bater (mesma regra fácil, mais rigoroso se quiser)
                compativel = (cat_a == ponta_cat || cat_b == ponta_cat);
            } else {
                // DIFÍCIL: fórmula exata
                compativel = (val_a == ponta_val || val_b == ponta_val);
            }

            if (!compativel)
                return bad_request("Peça incompatível com a ponta do tabuleiro");

            // Executa a jogada
            pqxx::work txn(db.conn());

            // Remove da mão
            txn.exec(
                "UPDATE player_hands SET jogada_em = NOW() WHERE id = " +
                std::to_string(hand_id)
            );

            // Calcula posição
            auto pos_result = txn.exec(
                "SELECT COALESCE(" +
                std::string(lado == "ESQUERDA" ? "MIN(posicao) - 1" : "MAX(posicao) + 1") +
                ", 0) AS nova_pos FROM board_tiles WHERE match_id = " +
                std::to_string(match_id)
            );
            int nova_pos = pos_result[0][0].as<int>();

            // Insere no tabuleiro
            txn.exec(
                "INSERT INTO board_tiles (match_id, tile_id, posicao, lado) VALUES (" +
                std::to_string(match_id) + ", " +
                std::to_string(tile_id) + ", " +
                std::to_string(nova_pos) + ", " +
                txn.quote(lado) + ")"
            );

            // Registra jogada
            txn.exec(
                "INSERT INTO moves (match_id, player_id, tile_id, lado_jogado) VALUES (" +
                std::to_string(match_id) + ", " +
                std::to_string(mp_id) + ", " +
                std::to_string(tile_id) + ", " +
                txn.quote(lado) + ")"
            );

            // Verifica vitória (mão vazia)
            auto remaining = txn.exec(
                "SELECT COUNT(*) FROM player_hands WHERE match_player_id = " +
                std::to_string(mp_id) + " AND jogada_em IS NULL"
            );
            bool venceu = (remaining[0][0].as<int>() == 0);

            if (venceu) {
                // Marca vencedor
                txn.exec(
                    "UPDATE match_players SET vencedor = TRUE WHERE id = " +
                    std::to_string(mp_id)
                );
                // Finaliza partida
                txn.exec(
                    "UPDATE matches SET status = 'FINALIZADA', finalizado_em = NOW() "
                    "WHERE id = " + std::to_string(match_id)
                );
                // Atualiza stats de todos os jogadores
                auto all_players = txn.exec(
                    "SELECT mp.id, mp.user_id, mp.vencedor, mp.pontuacao "
                    "FROM match_players mp WHERE mp.match_id = " +
                    std::to_string(match_id)
                );
                for (const auto& p : all_players) {
                    txn.exec(
                        "SELECT fn_atualizar_stats(" +
                        std::to_string(p["user_id"].as<int>()) + ", " +
                        std::to_string(level_id) + ", " +
                        std::string(p["vencedor"].as<bool>() ? "TRUE" : "FALSE") + ", " +
                        std::to_string(p["pontuacao"].as<int>()) + ")"
                    );
                }
            }

            txn.commit();

            crow::json::wvalue data;
            data["message"]  = venceu ? "Vitória! Partida finalizada" : "Jogada realizada";
            data["venceu"]   = venceu;
            data["tile_id"]  = tile_id;
            data["lado"]     = lado;
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── POST /api/matches/<int>/pass ───── (passar a vez)
    CROW_ROUTE(app, "/api/matches/<int>/pass").methods(crow::HTTPMethod::POST)
    ([&app](const crow::request& req, int match_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction ntxn(db.conn());

            // Verifica se é a vez do jogador
            auto mp = ntxn.exec(
                "SELECT id FROM match_players WHERE match_id = " +
                std::to_string(match_id) + " AND user_id = " + std::to_string(ctx.user_id)
            );
            if (mp.empty()) return forbidden("Você não está nesta partida");
            int mp_id = mp[0][0].as<int>();

            auto moves_count = ntxn.exec(
                "SELECT COUNT(*) FROM moves WHERE match_id = " + std::to_string(match_id)
            );
            int total_moves = moves_count[0][0].as<int>();

            auto players = ntxn.exec(
                "SELECT id FROM match_players WHERE match_id = " +
                std::to_string(match_id) + " ORDER BY ordem_jogada"
            );
            int current_idx = total_moves % (int)players.size();
            if (players[current_idx][0].as<int>() != mp_id)
                return bad_request("Não é a sua vez");

            // Registra passe (tile_id = 0 dummy, mas usamos tile_id da primeira peça do tabuleiro + passou_vez)
            // Buscar qualquer tile_id válido (da primeira peça no tabuleiro)
            auto first_tile = ntxn.exec(
                "SELECT tile_id FROM board_tiles WHERE match_id = " +
                std::to_string(match_id) + " LIMIT 1"
            );
            int dummy_tile_id = first_tile[0][0].as<int>();

            pqxx::work txn(db.conn());
            txn.exec(
                "INSERT INTO moves (match_id, player_id, tile_id, lado_jogado, passou_vez) VALUES (" +
                std::to_string(match_id) + ", " +
                std::to_string(mp_id) + ", " +
                std::to_string(dummy_tile_id) + ", 'CENTRO', TRUE)"
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Vez passada";
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });
}
