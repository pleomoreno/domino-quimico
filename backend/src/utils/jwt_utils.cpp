#include "utils/jwt_utils.hpp"
#include "db/database.hpp"
#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/defaults.h>
#include <pqxx/pqxx>
#include <cstdlib>
#include <chrono>
#include <iostream>

namespace JwtUtils {

    using traits = jwt::traits::nlohmann_json;

    static std::string get_secret() {
        const char* s = std::getenv("JWT_SECRET");
        return s ? s : "dev-secret-change-in-production";
    }

    static int get_expiry_hours() {
        const char* h = std::getenv("JWT_EXPIRY_HOURS");
        return h ? std::stoi(h) : 24;
    }

    std::string generate(int user_id, const std::string& tipo) {
        auto now = std::chrono::system_clock::now();
        auto exp = now + std::chrono::hours(get_expiry_hours());

        return jwt::create<traits>()
            .set_issuer("domino-quimico")
            .set_type("JWT")
            .set_subject(std::to_string(user_id))
            .set_payload_claim("tipo", jwt::basic_claim<traits>(tipo))
            .set_issued_at(now)
            .set_expires_at(exp)
            .sign(jwt::algorithm::hs256{get_secret()});
    }

    std::optional<Claims> verify(const std::string& token) {
        try {
            auto verifier = jwt::verify<traits>()
                .allow_algorithm(jwt::algorithm::hs256{get_secret()})
                .with_issuer("domino-quimico");

            auto decoded = jwt::decode<traits>(token);
            verifier.verify(decoded);

            Claims c;
            c.user_id = std::stoi(decoded.get_subject());
            c.tipo    = decoded.get_payload_claim("tipo").as_string();
            return c;
        } catch (const std::exception& e) {
            std::cerr << "[JWT] Erro: " << e.what() << "\n";
            return std::nullopt;
        }
    }

    bool is_session_revoked(int user_id, const std::string& token) {
        try {
            // Usa o mesmo token_hash que o login salva (últimos 32 chars)
            std::string token_hash = token.substr(token.size() - 32);

            auto& db = Database::instance();
            pqxx::nontransaction txn(db.conn());
            auto result = txn.exec(
                "SELECT revogado, expira_em FROM user_sessions "
                "WHERE user_id = " + std::to_string(user_id) +
                " AND token_hash = " + txn.quote(token_hash) +
                " ORDER BY criado_em DESC LIMIT 1"
            );

            if (result.empty()) {
                // Sem sessão registrada — aceita (compatibilidade com register que não cria sessão)
                return false;
            }

            return result[0]["revogado"].as<bool>();
        } catch (const std::exception& e) {
            std::cerr << "[JWT] Erro ao verificar sessão: " << e.what() << "\n";
            return false; // Em caso de erro de DB, não bloqueia (fail-open)
        }
    }
}
