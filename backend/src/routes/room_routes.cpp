#include "routes/room_routes.hpp"
#include "db/database.hpp"
#include "utils/jwt_utils.hpp"
#include "utils/response_utils.hpp"
#include <pqxx/pqxx>
#include <random>
#include <string>

static std::string gerar_codigo_sala()
{
    static const char chars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, sizeof(chars) - 2);
    std::string code;
    for (int i = 0; i < 6; ++i)
        code += chars[dist(gen)];
    return code;
}

void register_room_routes(crow::App<crow::CORSHandler, AuthMiddleware> &app)
{

    // ───── POST /api/rooms ───── (professor cria sala)
    CROW_ROUTE(app, "/api/rooms").methods(crow::HTTPMethod::POST)([&app](const crow::request &req)
                                                                  {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        try {
            auto& db = Database::instance();

            std::string codigo;
            for (int tentativa = 0; tentativa < 10; ++tentativa) {
                codigo = gerar_codigo_sala();
                pqxx::nontransaction ntxn(db.conn());
                auto check = ntxn.exec(
                    "SELECT id FROM salas WHERE codigo = " + ntxn.quote(codigo)
                );
                if (check.empty()) break;
                if (tentativa == 9) return server_error("Não foi possível gerar código único");
            }

            pqxx::work txn(db.conn());
            auto result = txn.exec(
                "INSERT INTO salas (codigo, professor_id) VALUES (" +
                txn.quote(codigo) + ", " + std::to_string(ctx.user_id) +
                ") RETURNING id, codigo, created_at"
            );
            txn.commit();

            crow::json::wvalue data;
            data["sala_id"] = result[0]["id"].as<int>();
            data["codigo"] = result[0]["codigo"].as<std::string>();
            data["created_at"] = result[0]["created_at"].as<std::string>();
            return created(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── GET /api/rooms/<string> ───── (buscar sala por código)
    CROW_ROUTE(app, "/api/rooms/<string>").methods(crow::HTTPMethod::GET)([&app](const crow::request &req, const std::string &codigo)
                                                                          {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            auto result = txn.exec(
                "SELECT s.id, s.codigo, s.status, s.max_jogadores, s.created_at, "
                "u.nome AS professor_nome "
                "FROM salas s "
                "JOIN users u ON u.id = s.professor_id "
                "WHERE s.codigo = " + txn.quote(codigo)
            );

            if (result.empty()) return not_found("Sala não encontrada");

            auto row = result[0];

            auto alunos_count = txn.exec(
                "SELECT COUNT(*) FROM sala_alunos WHERE sala_id = " +
                std::to_string(row["id"].as<int>())
            );

            crow::json::wvalue data;
            data["sala_id"] = row["id"].as<int>();
            data["codigo"] = row["codigo"].as<std::string>();
            data["status"] = row["status"].as<std::string>();
            data["max_jogadores"] = row["max_jogadores"].as<int>();
            data["professor_nome"] = row["professor_nome"].as<std::string>();
            data["alunos_count"] = alunos_count[0][0].as<int>();
            data["created_at"] = row["created_at"].as<std::string>();
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── POST /api/rooms/<string>/join ───── (aluno entra na sala)
    CROW_ROUTE(app, "/api/rooms/<string>/join").methods(crow::HTTPMethod::POST)([&app](const crow::request &req, const std::string &codigo)
                                                                                {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        if (ctx.tipo != "ALUNO")
            return forbidden("Apenas alunos podem entrar em salas");

        try {
            auto& db = Database::instance();
            pqxx::nontransaction ntxn(db.conn());

            auto sala = ntxn.exec(
                "SELECT id, status, max_jogadores FROM salas WHERE codigo = " +
                ntxn.quote(codigo)
            );
            if (sala.empty()) return not_found("Sala não encontrada");

            int sala_id = sala[0]["id"].as<int>();
            std::string status = sala[0]["status"].as<std::string>();
            int max_j = sala[0]["max_jogadores"].as<int>();

            if (status != "aguardando")
                return bad_request("Sala não está aceitando novos jogadores");

            auto already = ntxn.exec(
                "SELECT id FROM sala_alunos WHERE sala_id = " +
                std::to_string(sala_id) + " AND aluno_id = " + std::to_string(ctx.user_id)
            );
            if (!already.empty()) return bad_request("Você já está nesta sala");

            auto count = ntxn.exec(
                "SELECT COUNT(*) FROM sala_alunos WHERE sala_id = " +
                std::to_string(sala_id)
            );
            if (count[0][0].as<int>() >= max_j)
                return bad_request("Sala lotada");

            pqxx::work txn(db.conn());
            txn.exec(
                "INSERT INTO sala_alunos (sala_id, aluno_id) VALUES (" +
                std::to_string(sala_id) + ", " + std::to_string(ctx.user_id) + ")"
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Entrou na sala";
            data["sala_id"] = sala_id;
            data["codigo"] = codigo;
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── GET /api/rooms/<string>/students ───── (listar alunos da sala)
    CROW_ROUTE(app, "/api/rooms/<string>/students").methods(crow::HTTPMethod::GET)([&app](const crow::request &req, const std::string &codigo)
                                                                                   {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            auto sala = txn.exec(
                "SELECT id, status FROM salas WHERE codigo = " + txn.quote(codigo)
            );
            if (sala.empty()) return not_found("Sala não encontrada");

            int sala_id = sala[0]["id"].as<int>();
            std::string status = sala[0]["status"].as<std::string>();

            auto result = txn.exec(
                "SELECT u.id, u.nome, sa.joined_at "
                "FROM sala_alunos sa "
                "JOIN users u ON u.id = sa.aluno_id "
                "WHERE sa.sala_id = " + std::to_string(sala_id) +
                " ORDER BY sa.joined_at"
            );

            std::vector<crow::json::wvalue> alunos;
            for (const auto& row : result) {
                crow::json::wvalue a;
                a["id"] = row["id"].as<int>();
                a["nome"] = row["nome"].as<std::string>();
                a["joined_at"] = row["joined_at"].as<std::string>();
                alunos.push_back(std::move(a));
            }

            crow::json::wvalue data;
            data["alunos"] = std::move(alunos);
            data["total"] = (int)result.size();
            data["status"] = status;
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── POST /api/rooms/<string>/start ───── (professor inicia partida)
    CROW_ROUTE(app, "/api/rooms/<string>/start").methods(crow::HTTPMethod::POST)([&app](const crow::request &req, const std::string &codigo)
                                                                                 {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction ntxn(db.conn());

            auto sala = ntxn.exec(
                "SELECT id, status, professor_id FROM salas WHERE codigo = " +
                ntxn.quote(codigo)
            );
            if (sala.empty()) return not_found("Sala não encontrada");

            if (sala[0]["professor_id"].as<int>() != ctx.user_id)
                return forbidden("Apenas o professor criador pode iniciar a partida");

            if (sala[0]["status"].as<std::string>() != "aguardando")
                return bad_request("Sala não está aguardando");

            int sala_id = sala[0]["id"].as<int>();

            pqxx::work txn(db.conn());
            txn.exec(
                "UPDATE salas SET status = 'em_andamento' WHERE id = " +
                std::to_string(sala_id)
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Partida iniciada";
            data["sala_id"] = sala_id;
            data["status"] = "em_andamento";
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── DELETE /api/rooms/<string>/leave ───── (aluno sai da sala)
    CROW_ROUTE(app, "/api/rooms/<string>/leave").methods(crow::HTTPMethod::DELETE)([&app](const crow::request &req, const std::string &codigo)
                                                                                   {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_AUTH(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction ntxn(db.conn());

            auto sala = ntxn.exec(
                "SELECT id FROM salas WHERE codigo = " + ntxn.quote(codigo)
            );
            if (sala.empty()) return not_found("Sala não encontrada");

            int sala_id = sala[0]["id"].as<int>();

            pqxx::work txn(db.conn());
            txn.exec(
                "DELETE FROM sala_alunos WHERE sala_id = " +
                std::to_string(sala_id) + " AND aluno_id = " + std::to_string(ctx.user_id)
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Saiu da sala";
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── GET /api/rooms/professor/list ───── (listar salas do professor)
    CROW_ROUTE(app, "/api/rooms/professor/list").methods(crow::HTTPMethod::GET)([&app](const crow::request &req)
                                                                                {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        try {
            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());

            auto result = txn.exec(
                "SELECT s.id, s.codigo, s.status, s.max_jogadores, s.created_at, "
                "(SELECT COUNT(*) FROM sala_alunos sa WHERE sa.sala_id = s.id) AS alunos_count "
                "FROM salas s "
                "WHERE s.professor_id = " + std::to_string(ctx.user_id) +
                " AND s.status != 'finalizada' "
                "ORDER BY s.created_at DESC"
            );

            std::vector<crow::json::wvalue> salas;
            for (const auto& row : result) {
                crow::json::wvalue s;
                s["sala_id"] = row["id"].as<int>();
                s["codigo"] = row["codigo"].as<std::string>();
                s["status"] = row["status"].as<std::string>();
                s["max_jogadores"] = row["max_jogadores"].as<int>();
                s["alunos_count"] = row["alunos_count"].as<int>();
                s["created_at"] = row["created_at"].as<std::string>();
                salas.push_back(std::move(s));
            }

            crow::json::wvalue data;
            data["salas"] = std::move(salas);
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── POST /api/rooms/<string>/finish ───── (professor finaliza sala)
    CROW_ROUTE(app, "/api/rooms/<string>/finish").methods(crow::HTTPMethod::POST)([&app](const crow::request &req, const std::string &codigo)
                                                                                  {
        auto& ctx = app.get_context<AuthMiddleware>(req);
        REQUIRE_PROFESSOR(ctx);

        try {
            auto& db = Database::instance();

            pqxx::work txn(db.conn());
            txn.exec(
                "UPDATE salas SET status = 'finalizada' WHERE codigo = " +
                txn.quote(codigo) + " AND professor_id = " + std::to_string(ctx.user_id)
            );
            txn.commit();

            crow::json::wvalue data;
            data["message"] = "Sala finalizada";
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });
}
