#pragma once
#include <string>
#include <optional>

namespace JwtUtils {
    struct Claims {
        int user_id;
        std::string tipo;    // "ALUNO" ou "PROFESSOR"
    };

    // Gera token JWT com user_id e tipo
    std::string generate(int user_id, const std::string& tipo);

    // Valida e decodifica; retorna nullopt se inválido/expirado
    std::optional<Claims> verify(const std::string& token);
}
