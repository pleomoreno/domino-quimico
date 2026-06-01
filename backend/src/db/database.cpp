#include "db/database.hpp"
#include <cstdlib>
#include <sstream>
#include <iostream>

Database& Database::instance() {
    static Database db;
    return db;
}

Database::Database() {
    try {
        conn_ = std::make_unique<pqxx::connection>(build_conn_string());
        std::cout << "[DB] Conectado ao PostgreSQL com sucesso.\n";
    } catch (const std::exception& e) {
        throw std::runtime_error(std::string("[DB] Falha na conexão: ") + e.what());
    }
}

pqxx::connection& Database::conn() {
    if (!conn_ || !conn_->is_open()) {
        conn_ = std::make_unique<pqxx::connection>(build_conn_string());
    }
    return *conn_;
}

pqxx::result Database::query(const std::string& sql) {
    pqxx::nontransaction txn(conn());
    return txn.exec(sql);
}

void Database::execute(const std::string& sql) {
    pqxx::work txn(conn());
    txn.exec(sql);
    txn.commit();
}

std::string Database::build_conn_string() {
    auto env = [](const char* key, const char* def = "") -> std::string {
        const char* val = std::getenv(key);
        return val ? val : def;
    };
    std::ostringstream ss;
    ss << "host="     << env("DB_HOST", "localhost")
       << " port="    << env("DB_PORT", "5432")
       << " dbname="  << env("DB_NAME", "domino_quimico")
       << " user="    << env("DB_USER", "postgres")
       << " password="<< env("DB_PASSWORD", "")
       << " client_encoding=UTF8";
    return ss.str();
}
