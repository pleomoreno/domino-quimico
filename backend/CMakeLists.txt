cmake_minimum_required(VERSION 3.16)
project(DominoQuimico VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Integração com vcpkg (ajuste o path)
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../vcpkg/scripts/buildsystems/vcpkg.cmake"
    CACHE STRING "")

find_package(Crow REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(PostgreSQL REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_check_modules(PQXX REQUIRED libpqxx)
find_package(OpenSSL REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

# Coleta todos os .cpp
file(GLOB_RECURSE SOURCES "src/*.cpp")

add_executable(domino-backend ${SOURCES})

target_include_directories(domino-backend PRIVATE
    include
    ${PostgreSQL_INCLUDE_DIRS}
    ${PQXX_INCLUDE_DIRS}
)

target_link_libraries(domino-backend
    PRIVATE
    Crow::Crow
    jwt-cpp::jwt-cpp
    ${PQXX_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    nlohmann_json::nlohmann_json
    pthread
)
