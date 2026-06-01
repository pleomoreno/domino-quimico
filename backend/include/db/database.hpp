#pragma once
#include <pqxx/pqxx>
#include <string>
#include <memory>
#include <stdexcept>

class Database {
public:
    static Database& instance();

    // Retorna a conexão ativa (cria se não existir)
    pqxx::connection& conn();

    // Executa query de leitura e retorna resultado
    pqxx::result query(const std::string& sql);

    // Executa query de escrita (INSERT/UPDATE/DELETE)
    void execute(const std::string& sql);

private:
    Database();
    Database(const Database&) = delete;
    Database& operator=(const Database&) = delete;

    std::unique_ptr<pqxx::connection> conn_;
    std::string build_conn_string();
};
