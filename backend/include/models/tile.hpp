#pragma once
#include <string>

struct DominoValue {
    int id;
    std::string valor;
    std::string categoria;      // ÁCIDO, BASE, SAL, ÓXIDO
};

struct DominoTile {
    int id;
    int valor_a_id;
    int valor_b_id;
    std::string valor_a;
    std::string valor_b;
    std::string categoria_a;
    std::string categoria_b;
};
