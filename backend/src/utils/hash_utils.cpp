#include "utils/hash_utils.hpp"
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/crypto.h>
#include <sstream>
#include <iomanip>
#include <stdexcept>
#include <vector>

// Usa PBKDF2-SHA256 com salt aleatório: "pbkdf2$<salt_hex>$<hash_hex>"
namespace HashUtils {

    static std::string to_hex(const unsigned char* data, size_t len) {
        std::ostringstream ss;
        for (size_t i = 0; i < len; ++i)
            ss << std::hex << std::setw(2) << std::setfill('0') << (int)data[i];
        return ss.str();
    }

    std::string hash_password(const std::string& password) {
        unsigned char salt[16];
        if (RAND_bytes(salt, sizeof(salt)) != 1)
            throw std::runtime_error("Falha ao gerar salt");

        unsigned char out[32];
        PKCS5_PBKDF2_HMAC(password.c_str(), password.size(),
                           salt, sizeof(salt),
                           10000, EVP_sha256(),
                           sizeof(out), out);

        return "pbkdf2$" + to_hex(salt, sizeof(salt)) + "$" + to_hex(out, sizeof(out));
    }

    bool verify_password(const std::string& password, const std::string& stored) {
        // Esperado: "pbkdf2$<salt_hex>$<hash_hex>"
        auto p1 = stored.find('$');
        auto p2 = stored.rfind('$');
        if (p1 == std::string::npos || p1 == p2) return false;

        std::string salt_hex = stored.substr(p1 + 1, p2 - p1 - 1);
        std::string hash_hex = stored.substr(p2 + 1);

        // hex -> bytes
        auto from_hex = [](const std::string& h) {
            std::vector<unsigned char> bytes;
            for (size_t i = 0; i + 1 < h.size(); i += 2)
                bytes.push_back((unsigned char)std::stoi(h.substr(i, 2), nullptr, 16));
            return bytes;
        };

        auto salt_bytes = from_hex(salt_hex);
        auto hash_bytes = from_hex(hash_hex);

        unsigned char out[32];
        PKCS5_PBKDF2_HMAC(password.c_str(), password.size(),
                           salt_bytes.data(), salt_bytes.size(),
                           10000, EVP_sha256(),
                           sizeof(out), out);

        // comparação segura (tempo constante)
        return CRYPTO_memcmp(out, hash_bytes.data(), sizeof(out)) == 0;
    }
}
