#pragma once
#include "crow.h"
#include "middleware/auth_middleware.hpp"

void register_room_routes(crow::App<crow::CORSHandler, AuthMiddleware> &app);
