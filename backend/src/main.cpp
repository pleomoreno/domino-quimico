#include "crow.h"
#include "middleware/auth_middleware.hpp"
#include "routes/auth_routes.hpp"
#include "routes/user_routes.hpp"
#include "routes/match_routes.hpp"
#include "routes/game_routes.hpp"
#include "routes/report_routes.hpp"
#include "db/database.hpp"
#include <cstdlib>
#include <iostream>
#include <fstream>
#include <string>

// Carrega .env simples
void load_env(const std::string& path = ".env") {
    std::ifstream f(path);
    std::string line;
    while (std::getline(f, line)) {
        if (line.empty() || line[0] == '#') continue;
        auto eq = line.find('=');
        if (eq == std::string::npos) continue;
        auto key = line.substr(0, eq);
        auto val = line.substr(eq + 1);
        setenv(key.c_str(), val.c_str(), 0);
    }
}

int main() {
    load_env();

    // Inicializa DB na startup (falha rápido se não conectar)
    try {
        Database::instance();
    } catch (const std::exception& e) {
        std::cerr << "[FATAL] " << e.what() << "\n";
        return 1;
    }

    crow::App<AuthMiddleware> app;

    // CORS para o frontend React
    // Nota: Crow não tem CORSHandler built-in por padrão.
    // Vamos adicionar CORS via handler global de OPTIONS e headers.
    std::string cors_origin = std::getenv("CORS_ORIGIN") ? std::getenv("CORS_ORIGIN") : "*";

    // Middleware de CORS via after_handle global não é trivial em Crow.
    // Usamos um catchall OPTIONS e adicionamos headers nas respostas.
    CROW_ROUTE(app, "/api/<path>").methods(crow::HTTPMethod::OPTIONS)
    ([cors_origin](const crow::request&, const std::string&) {
        auto res = crow::response(204);
        res.set_header("Access-Control-Allow-Origin", cors_origin);
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.set_header("Access-Control-Max-Age", "86400");
        return res;
    });

    // CORS headers são injetados via response_utils.hpp em cada resposta.
    // O handler OPTIONS acima cuida dos preflight requests.

    // Registra todos os grupos de rotas
    register_auth_routes(app);
    register_user_routes(app);
    register_match_routes(app);
    register_game_routes(app);
    register_report_routes(app);

    // Health check
    CROW_ROUTE(app, "/api/health")([]() {
        crow::json::wvalue res;
        res["status"] = "ok";
        res["service"] = "domino-quimico-api";
        return res;
    });

    int port = std::getenv("SERVER_PORT") ? std::stoi(std::getenv("SERVER_PORT")) : 8080;
    std::cout << "[SERVER] Iniciando na porta " << port << "\n";

    app.port(port).multithreaded().run();
    return 0;
}
