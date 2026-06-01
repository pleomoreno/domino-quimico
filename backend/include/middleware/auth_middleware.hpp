#pragma once
#include "crow.h"
#include "utils/jwt_utils.hpp"

struct AuthContext {
    int  user_id = 0;
    std::string tipo;
    bool authenticated = false;
};

// Extrai token do header Authorization: Bearer <token>
// Injeta AuthContext no contexto
struct AuthMiddleware {
    struct context : public AuthContext {};

    void before_handle(crow::request& req, crow::response& res, context& ctx) {
        auto auth = req.get_header_value("Authorization");
        if (auth.size() > 7 && auth.substr(0, 7) == "Bearer ") {
            auto token = auth.substr(7);
            auto claims = JwtUtils::verify(token);
            if (claims) {
                ctx.user_id       = claims->user_id;
                ctx.tipo          = claims->tipo;
                ctx.authenticated = true;
            }
        }
    }

    void after_handle(crow::request&, crow::response&, context&) {}
};

// Guard: bloqueia se não autenticado
#define REQUIRE_AUTH(ctx) \
    if (!ctx.authenticated) return unauthorized();

// Guard: bloqueia se não for professor
#define REQUIRE_PROFESSOR(ctx) \
    if (!ctx.authenticated || ctx.tipo != "PROFESSOR") return forbidden("Apenas professores");
