#pragma once
#include "crow.h"
#include "middleware/auth_middleware.hpp"

void register_user_routes(crow::App<AuthMiddleware>& app);
