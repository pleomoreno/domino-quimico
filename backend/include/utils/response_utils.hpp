#pragma once
#include "crow.h"

inline crow::response ok(const crow::json::wvalue& data) {
    crow::json::wvalue res;
    res["success"] = true;
    res["data"] = data;
    return crow::response(200, res);
}

inline crow::response created(const crow::json::wvalue& data) {
    crow::json::wvalue res;
    res["success"] = true;
    res["data"] = data;
    return crow::response(201, res);
}

inline crow::response bad_request(const std::string& msg) {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    return crow::response(400, res);
}

inline crow::response unauthorized(const std::string& msg = "Token inválido ou expirado") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    return crow::response(401, res);
}

inline crow::response forbidden(const std::string& msg = "Sem permissão") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    return crow::response(403, res);
}

inline crow::response not_found(const std::string& msg = "Recurso não encontrado") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    return crow::response(404, res);
}

inline crow::response server_error(const std::string& msg = "Erro interno") {
    crow::json::wvalue res;
    res["success"] = false;
    res["error"] = msg;
    return crow::response(500, res);
}
