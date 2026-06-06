#include "routes/auth_routes.hpp"
#include "db/database.hpp"
#include "utils/hash_utils.hpp"
#include "utils/jwt_utils.hpp"
#include "utils/response_utils.hpp"
#include <pqxx/pqxx>
#include <algorithm>

static std::string extrair_dominio(const std::string &email)
{
    auto pos = email.find('@');
    if (pos == std::string::npos)
        return "";
    std::string domain = email.substr(pos + 1);
    std::transform(domain.begin(), domain.end(), domain.begin(), ::tolower);
    return domain;
}

static std::string detectar_tipo_por_email(const std::string &email)
{
    std::string domain = extrair_dominio(email);
    if (domain == "aluno.cps.sp.gov.br")
        return "ALUNO";
    if (domain == "cps.sp.gov.br")
        return "PROFESSOR";
    return "";
}

void register_auth_routes(crow::App<crow::CORSHandler, AuthMiddleware>& app)
{
    // ───── POST /api/auth/register ─────
    CROW_ROUTE(app, "/api/auth/register").methods(crow::HTTPMethod::POST)([](const crow::request &req)
                                                                          {
        auto body = crow::json::load(req.body);
        if (!body) return bad_request("JSON inválido");

        if (!body.has("nome") || !body.has("email") ||
            !body.has("senha") ||
            !body.has("lgpd_consentimento")) {
            return bad_request("Campos obrigatórios: nome, email, senha, lgpd_consentimento");
        }

        std::string nome  = body["nome"].s();
        std::string email = body["email"].s();
        std::string senha = body["senha"].s();
        bool lgpd         = body["lgpd_consentimento"].b();

        std::string tipo = detectar_tipo_por_email(email);
        if (tipo.empty())
            return bad_request("E-mail não autorizado para esta plataforma");

        if (!lgpd)
            return bad_request("Consentimento LGPD é obrigatório");
        if (senha.size() < 8)
            return bad_request("Senha deve ter no mínimo 8 caracteres");

        try {
            auto& db = Database::instance();

            {
                pqxx::nontransaction ntxn(db.conn());
                auto check = ntxn.exec(
                    "SELECT id FROM users WHERE email = " + ntxn.quote(email)
                );
                if (!check.empty())
                    return bad_request("E-mail já cadastrado");
            }

            std::string hash = HashUtils::hash_password(senha);

            pqxx::work txn(db.conn());
            auto result = txn.exec(
                "INSERT INTO users (nome, email, senha_hash, tipo, lgpd_consentimento) "
                "VALUES (" +
                txn.quote(nome)  + ", " +
                txn.quote(email) + ", " +
                txn.quote(hash)  + ", " +
                txn.quote(tipo)  + ", NOW()) "
                "RETURNING id"
            );
            txn.commit();

            int user_id = result[0][0].as<int>();
            std::string token = JwtUtils::generate(user_id, tipo);

            crow::json::wvalue data;
            data["token"]   = token;
            data["user_id"] = user_id;
            data["tipo"]    = tipo;
            data["nome"]    = nome;
            return created(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── POST /api/auth/login ─────
    CROW_ROUTE(app, "/api/auth/login").methods(crow::HTTPMethod::POST)([](const crow::request &req)
                                                                       {
        auto body = crow::json::load(req.body);
        if (!body) return bad_request("JSON inválido");
        if (!body.has("email") || !body.has("senha"))
            return bad_request("email e senha são obrigatórios");

        std::string email = body["email"].s();
        std::string senha = body["senha"].s();

        std::string tipo_esperado = detectar_tipo_por_email(email);
        if (tipo_esperado.empty())
            return bad_request("E-mail não autorizado para esta plataforma");

        try {
            auto& db = Database::instance();
            int user_id;
            std::string tipo;
            std::string nome;
            std::string hash;

            {
                pqxx::nontransaction txn(db.conn());

                auto result = txn.exec(
                    "SELECT id, nome, senha_hash, tipo, anonimizado, deletado_em "
                    "FROM users WHERE email = " + txn.quote(email)
                );

                if (result.empty())
                    return unauthorized("Credenciais inválidas");

                auto row = result[0];

                if (row["anonimizado"].as<bool>())
                    return forbidden("Conta anonimizada");

                if (!row["deletado_em"].is_null())
                    return forbidden("Conta deletada");

                hash = row["senha_hash"].as<std::string>();
                user_id = row["id"].as<int>();
                tipo = row["tipo"].as<std::string>();
                nome = row["nome"].as<std::string>();
            }

            if (!HashUtils::verify_password(senha, hash))
                return unauthorized("Credenciais inválidas");

            std::string token = JwtUtils::generate(user_id, tipo);

            pqxx::work wtxn(db.conn());
            wtxn.exec(
                "INSERT INTO user_sessions (user_id, token_hash, expira_em) "
                "VALUES (" + std::to_string(user_id) + ", " +
                wtxn.quote(token.substr(token.size() - 32)) + ", "
                "NOW() + INTERVAL '24 hours')"
            );
            wtxn.commit();

            crow::json::wvalue data;
            data["token"]   = token;
            data["user_id"] = user_id;
            data["tipo"]    = tipo;
            data["nome"]    = nome;
            return ok(std::move(data));

        } catch (const std::exception& e) {
            return server_error(e.what());
        } });

    // ───── POST /api/auth/logout ─────
    CROW_ROUTE(app, "/api/auth/logout").methods(crow::HTTPMethod::POST)([](const crow::request &req)
                                                                        {
        auto auth = req.get_header_value("Authorization");
        if (auth.size() < 8) return bad_request("Token ausente");
        auto token = auth.substr(7);
        auto claims = JwtUtils::verify(token);
        if (!claims) return unauthorized();

        try {
            auto& db = Database::instance();
            pqxx::work txn(db.conn());
            txn.exec(
                "UPDATE user_sessions SET revogado = TRUE "
                "WHERE user_id = " + std::to_string(claims->user_id) +
                " AND token_hash = " + txn.quote(token.substr(token.size() - 32))
            );
            txn.commit();
            crow::json::wvalue data;
            data["message"] = "Logout realizado";
            return ok(std::move(data));
        } catch (const std::exception& e) {
            return server_error(e.what());
        } });
}
