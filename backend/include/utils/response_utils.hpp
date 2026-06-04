#pragma once
#include "crow.h"
#include <cstdlib>
#include <string>

// Helper CORS: injeta headers em todas as respostas
inline void add_cors_headers(crow::response& resp) {
    const char* origin = std::getenv("CORS_ORIGIN");
    resp.set_header("Access-Control-Allow-Origin", origin ? origin : "*");
    resp.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    resp.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

inline crow::response ok(crow::json::wvalue data) {
    crow::json::wvalue res;
    res["success"] = true;
    res["data"] = std::move(data);
    crow::response resp(200);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}

inline crow::response created(crow::json::wvalue data) {
    crow::json::wvalue res;
    res["success"] = true;
    res["data"] = std::move(data);
    crow::response resp(201);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}

inline crow::response bad_request(const std::string& msg) {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    crow::response resp(400);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}

inline crow::response unauthorized(const std::string& msg = "Token inválido ou expirado") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    crow::response resp(401);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}

inline crow::response forbidden(const std::string& msg = "Sem permissão") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    crow::response resp(403);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}

inline crow::response not_found(const std::string& msg = "Recurso não encontrado") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    crow::response resp(404);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}

inline crow::response server_error(const std::string& msg = "Erro interno") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    crow::response resp(500);
    resp.set_header("Content-Type", "application/json");
    resp.body = res.dump();
    add_cors_headers(resp);
    return resp;
}
