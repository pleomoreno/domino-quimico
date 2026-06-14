#include "crow.h"
#include <crow/middlewares/cors.h>
#include "middleware/auth_middleware.hpp"
#include "routes/auth_routes.hpp"
#include "routes/user_routes.hpp"
#include "routes/match_routes.hpp"
#include "routes/game_routes.hpp"
#include "routes/report_routes.hpp"
#include "routes/room_routes.hpp"
#include "db/database.hpp"
#include <cstdlib>
#include <iostream>
#include <fstream>
#include <string>
#ifdef _WIN32
#include <cstdlib>
#endif

void load_env(const std::string &path = ".env")
{
    std::ifstream f(path);
    std::string line;
    while (std::getline(f, line))
    {
        if (line.empty() || line[0] == '#')
            continue;
        auto eq = line.find('=');
        if (eq == std::string::npos)
            continue;
        auto key = line.substr(0, eq);
        auto val = line.substr(eq + 1);
        #ifdef _WIN32
        _putenv_s(key.c_str(), val.c_str());
        #else
        setenv(key.c_str(), val.c_str(), 0);
        #endif
    }
}

int main()
{
    load_env();

    try
    {
        Database::instance();
    }
    catch (const std::exception &e)
    {
        std::cerr << "[FATAL] " << e.what() << "\n";
        return 1;
    }

    crow::App<crow::CORSHandler, AuthMiddleware> app;

    auto& cors = app.get_middleware<crow::CORSHandler>();
    std::string cors_origin = std::getenv("CORS_ORIGIN") ? std::getenv("CORS_ORIGIN") : "http://localhost:5173";

    cors.global()
        .headers("Content-Type", "Authorization")
        .methods("POST"_method, "GET"_method, "OPTIONS"_method, "PUT"_method, "DELETE"_method)
        .origin(cors_origin);

    register_auth_routes(app);
    register_user_routes(app);
    register_match_routes(app);
    register_game_routes(app);
    register_report_routes(app);
    register_room_routes(app);

    CROW_ROUTE(app, "/api/health")([]()
                                   {
        crow::json::wvalue res;
        res["status"] = "ok";
        res["service"] = "domino-quimico-api";
        return res; });

    int port = std::getenv("SERVER_PORT") ? std::stoi(std::getenv("SERVER_PORT")) : 8080;
    std::cout << "[SERVER] Iniciando na porta " << port << "\n";

    app.port(port).run();
    return 0;
}
