#include "utils/jwt_utils.hpp"
#include <jwt-cpp/jwt.h>
#include <cstdlib>
#include <chrono>
#include <iostream>

namespace JwtUtils {

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

        return jwt::create()
            .set_issuer("domino-quimico")
            .set_type("JWT")
            .set_subject(std::to_string(user_id))
            .set_payload_claim("tipo", jwt::claim(tipo))
            .set_issued_at(now)
            .set_expires_at(exp)
            .sign(jwt::algorithm::hs256{get_secret()});
    }

    std::optional<Claims> verify(const std::string& token) {
        try {
            auto verifier = jwt::verify()
                .allow_algorithm(jwt::algorithm::hs256{get_secret()})
                .with_issuer("domino-quimico");

            auto decoded = jwt::decode(token);
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
}
