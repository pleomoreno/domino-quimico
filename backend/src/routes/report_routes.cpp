#include "routes/report_routes.hpp"
#include "db/database.hpp"
#include "utils/jwt_utils.hpp"
#include "utils/response_utils.hpp"
#include <pqxx/pqxx>
#include <sstream>

void register_report_routes(crow::App<AuthMiddleware>& app) {

    // ───── GET /api/reports/turma/<int> ───── (relatório da turma)
    CROW_ROUTE(app, "/api/reports/turma/<int>").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int turma_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

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

            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT turma, aluno, email, dificuldade, "
                "partidas_jogadas, vitorias, derrotas, pontos_totais, taxa_vitoria_pct "
                "FROM vw_relatorio_professor "
                "WHERE professor_id = " + std::to_string(ctx.user_id) +
                " AND turma = (SELECT nome FROM turmas WHERE id = " + std::to_string(turma_id) + ")"
            );

            std::vector<crow::json::wvalue> report;
            for (const auto& row : result) {
                crow::json::wvalue entry;
                entry["turma"]             = row["turma"].as<std::string>();
                entry["aluno"]             = row["aluno"].as<std::string>();
                entry["email"]             = row["email"].as<std::string>();
                if (!row["dificuldade"].is_null())
                    entry["dificuldade"]    = row["dificuldade"].as<std::string>();
                entry["partidas_jogadas"] = row["partidas_jogadas"].is_null() ? 0 : row["partidas_jogadas"].as<int>();
                entry["vitorias"]         = row["vitorias"].is_null() ? 0 : row["vitorias"].as<int>();
                entry["derrotas"]         = row["derrotas"].is_null() ? 0 : row["derrotas"].as<int>();
                entry["pontos_totais"]    = row["pontos_totais"].is_null() ? 0 : row["pontos_totais"].as<int>();
                if (!row["taxa_vitoria_pct"].is_null())
                    entry["taxa_vitoria_pct"] = row["taxa_vitoria_pct"].as<double>();
                else
                    entry["taxa_vitoria_pct"] = 0.0;
                report.push_back(std::move(entry));
            }

            crow::json::wvalue data;
            data["relatorio"] = std::move(report);
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/reports/turma/<int>/export ───── (CSV LGPD-safe)
    CROW_ROUTE(app, "/api/reports/turma/<int>/export").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int turma_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

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

            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT aluno, email, dificuldade, "
                "partidas_jogadas, vitorias, derrotas, pontos_totais, taxa_vitoria_pct "
                "FROM vw_relatorio_professor "
                "WHERE professor_id = " + std::to_string(ctx.user_id) +
                " AND turma = (SELECT nome FROM turmas WHERE id = " + std::to_string(turma_id) + ")"
            );

            std::ostringstream csv;
            csv << "Aluno,Email,Dificuldade,Partidas,Vitórias,Derrotas,Pontos,Taxa Vitória (%)\n";
            for (const auto& row : result) {
                csv << row["aluno"].as<std::string>() << ","
                    << row["email"].as<std::string>() << ","
                    << (row["dificuldade"].is_null() ? "" : row["dificuldade"].as<std::string>()) << ","
                    << (row["partidas_jogadas"].is_null() ? 0 : row["partidas_jogadas"].as<int>()) << ","
                    << (row["vitorias"].is_null() ? 0 : row["vitorias"].as<int>()) << ","
                    << (row["derrotas"].is_null() ? 0 : row["derrotas"].as<int>()) << ","
                    << (row["pontos_totais"].is_null() ? 0 : row["pontos_totais"].as<int>()) << ","
                    << (row["taxa_vitoria_pct"].is_null() ? 0.0 : row["taxa_vitoria_pct"].as<double>())
                    << "\n";
            }

            auto res = crow::response(200);
            res.set_header("Content-Type", "text/csv; charset=utf-8");
            res.set_header("Content-Disposition", "attachment; filename=relatorio_turma_" + std::to_string(turma_id) + ".csv");
            res.body = csv.str();
            return res;
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });

    // ───── GET /api/reports/aluno/<int> ───── (histórico individual)
    CROW_ROUTE(app, "/api/reports/aluno/<int>").methods(crow::HTTPMethod::GET)
    ([&app](const crow::request& req, int aluno_id) {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            // Verifica se o aluno pertence a uma turma do professor
            auto check = txn.exec(
                "SELECT ta.aluno_id FROM turma_alunos ta "
                "JOIN turmas t ON t.id = ta.turma_id "
                "WHERE t.professor_id = " + std::to_string(ctx.user_id) +
                " AND ta.aluno_id = " + std::to_string(aluno_id) +
                " LIMIT 1"
            );
            if (check.empty()) return forbidden("Aluno não pertence às suas turmas");

            // Dados do aluno
            auto aluno = txn.exec(
                "SELECT id, nome, email FROM users WHERE id = " +
                std::to_string(aluno_id) + " AND anonimizado = FALSE"
            );
            if (aluno.empty()) return not_found("Aluno não encontrado ou anonimizado");

            crow::json::wvalue data;
            data["aluno"]["id"]    = aluno[0]["id"].as<int>();
            data["aluno"]["nome"]  = aluno[0]["nome"].as<std::string>();
            data["aluno"]["email"] = aluno[0]["email"].as<std::string>();

            // Stats por nível
            auto stats = txn.exec(
                "SELECT gl.dificuldade, ps.partidas_jogadas, ps.vitorias, "
                "ps.derrotas, ps.pontos_totais, ps.ultima_partida "
                "FROM player_stats ps "
                "JOIN game_levels gl ON gl.id = ps.level_id "
                "WHERE ps.user_id = " + std::to_string(aluno_id)
            );

            std::vector<crow::json::wvalue> stats_list;
            for (const auto& row : stats) {
                crow::json::wvalue stat;
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

            // Histórico de partidas recentes
            auto history = txn.exec(
                "SELECT m.id AS match_id, gl.dificuldade, m.status, "
                "mp.vencedor, mp.pontuacao, m.finalizado_em "
                "FROM match_players mp "
                "JOIN matches m ON m.id = mp.match_id "
                "JOIN game_levels gl ON gl.id = m.level_id "
                "WHERE mp.user_id = " + std::to_string(aluno_id) +
                " ORDER BY m.criado_em DESC LIMIT 20"
            );

            std::vector<crow::json::wvalue> hist_list;
            for (const auto& row : history) {
                crow::json::wvalue h;
                h["match_id"]    = row["match_id"].as<int>();
                h["dificuldade"] = row["dificuldade"].as<std::string>();
                h["status"]      = row["status"].as<std::string>();
                h["vencedor"]    = row["vencedor"].as<bool>();
                h["pontuacao"]   = row["pontuacao"].as<int>();
                if (!row["finalizado_em"].is_null())
                    h["finalizado_em"] = row["finalizado_em"].as<std::string>();
                hist_list.push_back(std::move(h));
            }
            data["historico"] = std::move(hist_list);

            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        }
    });
}
