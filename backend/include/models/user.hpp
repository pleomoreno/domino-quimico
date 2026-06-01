#pragma once
#include <string>
#include <optional>

struct User {
    int id;
    std::string nome;
    std::string email;
    std::string senha_hash;
    std::string tipo;           // "ALUNO" ou "PROFESSOR"
    bool anonimizado = false;
    std::optional<std::string> deletado_em;
    std::string criado_em;
};
