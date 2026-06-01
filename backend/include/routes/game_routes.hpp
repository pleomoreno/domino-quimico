#pragma once
#include "crow.h"
#include "middleware/auth_middleware.hpp"

void register_game_routes(crow::App<AuthMiddleware>& app);
