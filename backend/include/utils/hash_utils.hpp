#pragma once
#include <string>

namespace HashUtils {
    // Gera hash bcrypt-style usando PBKDF2-SHA256
    std::string hash_password(const std::string& password);

    // Verifica senha contra hash armazenado
    bool verify_password(const std::string& password, const std::string& hash);
}
