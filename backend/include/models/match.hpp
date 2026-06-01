#pragma once
#include <string>
#include <optional>

struct Match {
    int id;
    int level_id;
    std::string status;         // AGUARDANDO, EM_ANDAMENTO, FINALIZADA, CANCELADA
    std::string codigo_sala;
    int max_jogadores;
    std::optional<std::string> iniciado_em;
    std::optional<std::string> finalizado_em;
    std::string criado_em;
};
