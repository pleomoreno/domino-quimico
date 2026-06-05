# Dominó Químico

Jogo educacional de dominó digital para classificação de Funções Inorgânicas (ácidos, bases, sais, óxidos), desenvolvido como Projeto Integrador Interdisciplinar (PII/TTI202) — Instituto Mauá de Tecnologia em parceria com ETEC Júlio de Mesquita.

---

## Tecnologias

| Camada    | Stack                                           |
|-----------|-------------------------------------------------|
| Frontend  | React 19 + Vite 8, Tailwind CSS v3              |
| Backend   | C++17, Crow Framework, libpqxx, jwt-cpp, OpenSSL|
| Banco     | PostgreSQL 14+                                  |
| Build     | CMake 3.16+, vcpkg                              |

---

## Pré-requisitos (instalar antes)

### Gerais
- [Node.js ≥ 18](https://nodejs.org/) + npm
- [PostgreSQL ≥ 14](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

### Backend (C++)
- GCC ≥ 9 ou Clang ≥ 8 (com suporte a C++17)
- CMake ≥ 3.16
- vcpkg (veja abaixo)
- `pkg-config`

**Ubuntu/Debian:**
```bash
sudo apt install build-essential cmake pkg-config libssl-dev
```

**Fedora:**
```bash
sudo dnf install gcc-c++ cmake pkg-config openssl-devel
```

---

## Setup

### 1. Clonar o repositório

```bash
git clone https://github.com/pleomoreno/domino-quimico.git
cd domino-quimico
```

### 2. Instalar vcpkg (uma vez por máquina)

```bash
# Na pasta PAI do repositório (um nível acima de domino-quimico)
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh       # Linux/macOS
# bootstrap-vcpkg.bat      # Windows
cd ..
```

> O CMakeLists.txt já aponta para `../vcpkg`. Se clonou em outro lugar, ajuste
> `CMAKE_TOOLCHAIN_FILE` em `backend/CMakeLists.txt`.

### 3. Instalar dependências C++ via vcpkg

```bash
cd vcpkg
./vcpkg install crow jwt-cpp libpqxx nlohmann-json openssl
cd ..
```

### 4. Configurar o banco de dados

```bash
# Criar usuário e banco (ajuste a senha conforme necessário)
sudo -u postgres psql -c "CREATE USER domino WITH PASSWORD 'domino123';"
sudo -u postgres psql -c "CREATE DATABASE domino_quimico OWNER domino;"

# Rodar o script SQL
psql -U domino -d domino_quimico -f bancoDeDados.sql
```

### 5. Configurar variáveis de ambiente do backend

Crie o arquivo `backend/.env` (ou exporte como variáveis de ambiente):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=domino_quimico
DB_USER=domino
DB_PASSWORD=domino123
JWT_SECRET=sua-chave-secreta-aqui
```

### 6. Compilar o backend

```bash
cd backend
mkdir -p build && cd build

cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=../../vcpkg/scripts/buildsystems/vcpkg.cmake \
  -DCMAKE_BUILD_TYPE=Release

cmake --build . --config Release -j$(nproc)
cd ../..
```

### 7. Instalar dependências do frontend

```bash
cd frontend
npm install
```

### 8. (Opcional) Adicionar música de fundo

Coloque um arquivo MP3 em `frontend/public/audio/bgm.mp3`. Se não existir, o jogo funciona normalmente sem música.

---

## Executar

### Backend

```bash
cd backend/build
./domino-backend
# Servidor inicia em http://localhost:8080
```

### Frontend

```bash
cd frontend
npm run dev
# Interface em http://localhost:5173
```

---

## Estrutura do Projeto

domino-quimico/
├── backend/
│   ├── src/             # Código C++ (rotas, modelos, middleware)
│   ├── include/         # Headers
│   └── CMakeLists.txt
├── frontend/
│   ├── public/
│   │   └── audio/       # Coloque bgm.mp3 aqui
│   └── src/
│       ├── components/  # FloatingDecor, AudioManager
│       └── pages/       # Todas as telas do jogo
└── bancoDeDados.sql

---

## Telas disponíveis

| Rota                   | Descrição                |
|------------------------|--------------------------|
| `/`                    | Landing (splash)         |
| `/login`               | Login institucional      |
| `/register`            | Cadastro                 |
| `/dashboard/aluno`     | Dashboard do aluno       |
| `/dashboard/professor` | Dashboard do professor   |
| `/config`              | Configurar partida       |
| `/lobby`               | Lobby de salas           |
| `/room/:code`          | Sala de espera           |
| `/game`                | Tabuleiro de jogo        |
| `/gerenciar`           | Gerenciar alunos         |
| `/relatorio`           | Relatórios               |

---

## Credenciais para apresentação

- **Aluno:** e-mail `@aluno.cps.sp.gov.br`
- **Professor:** e-mail `@cps.sp.gov.br`

---

## Equipe

| Nome | Papel |
|------|-------|
| Leo (pleomoreno) | Product Owner, Backend Lead |
| Erik Kenji Sakura (Japa) | Scrum Master, Design (Figma) |
| Felipe Eros Bressani Bittencourt | Full-stack |
| João Carlos Soares Sartorelli | Banco de dados, documentação |
| João Vitor de Freitas Silva | Full-stack |

---

*Instituto Mauá de Tecnologia × ETEC Júlio de Mesquita · 2026*