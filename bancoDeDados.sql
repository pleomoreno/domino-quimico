-- 0. LIMPEZA

DROP TABLE IF EXISTS user_sessions      CASCADE;
DROP TABLE IF EXISTS moves              CASCADE;
DROP TABLE IF EXISTS board_tiles        CASCADE;
DROP TABLE IF EXISTS player_hands       CASCADE;
DROP TABLE IF EXISTS match_players      CASCADE;
DROP TABLE IF EXISTS matches            CASCADE;
DROP TABLE IF EXISTS sala_alunos        CASCADE;
DROP TABLE IF EXISTS salas              CASCADE;
DROP TABLE IF EXISTS turma_alunos       CASCADE;
DROP TABLE IF EXISTS turmas             CASCADE;
DROP TABLE IF EXISTS player_stats       CASCADE;
DROP TABLE IF EXISTS tile_levels        CASCADE;
DROP TABLE IF EXISTS domino_tiles       CASCADE;
DROP TABLE IF EXISTS domino_values      CASCADE;
DROP TABLE IF EXISTS game_levels        CASCADE;
DROP TABLE IF EXISTS users              CASCADE;

-- 1. USUÁRIOS

CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    nome                VARCHAR(100)        NOT NULL,
    email               VARCHAR(150)        NOT NULL UNIQUE,
    senha_hash          VARCHAR(255)        NOT NULL,
    tipo                VARCHAR(10)         NOT NULL,

    -- LGPD
    lgpd_consentimento  TIMESTAMP,
    anonimizado         BOOLEAN             DEFAULT FALSE,
    deletado_em         TIMESTAMP,

    criado_em           TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_tipo_usuario
        CHECK (tipo IN ('ALUNO', 'PROFESSOR')),

    -- Validação de e-mail institucional
    CONSTRAINT chk_email_institucional
        CHECK (email LIKE '%@aluno.cps.sp.gov.br' OR email LIKE '%@cps.sp.gov.br')
);

-- 2. SESSÕES / REVOGAÇÃO DE JWT

CREATE TABLE user_sessions (
    id          SERIAL PRIMARY KEY,
    user_id     INT             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255)    NOT NULL,
    criado_em   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    expira_em   TIMESTAMP       NOT NULL,
    revogado    BOOLEAN         DEFAULT FALSE
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);

-- 3. TURMAS (relação professor pro aluno)

CREATE TABLE turmas (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(100)    NOT NULL,
    professor_id    INT             NOT NULL REFERENCES users(id),
    criado_em       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE turma_alunos (
    turma_id    INT REFERENCES turmas(id) ON DELETE CASCADE,
    aluno_id    INT REFERENCES users(id)  ON DELETE CASCADE,
    ingressou_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (turma_id, aluno_id)
);

-- 3b. SALAS DE JOGO (professor cria, alunos entram por código)

CREATE TABLE salas (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(6)      NOT NULL UNIQUE,
    professor_id    INT             NOT NULL REFERENCES users(id),
    status          VARCHAR(15)     NOT NULL DEFAULT 'aguardando',
    max_jogadores   INT             DEFAULT 10,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_status_sala
        CHECK (status IN ('aguardando', 'em_andamento', 'finalizada'))
);

CREATE INDEX idx_salas_codigo ON salas(codigo);
CREATE INDEX idx_salas_professor ON salas(professor_id);

CREATE TABLE sala_alunos (
    id          SERIAL PRIMARY KEY,
    sala_id     INT NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    aluno_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (sala_id, aluno_id)
);

-- 4. NÍVEIS DE DIFICULDADE

CREATE TABLE game_levels (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(50)     NOT NULL,
    dificuldade VARCHAR(10)     NOT NULL,

    CONSTRAINT chk_dificuldade
        CHECK (dificuldade IN ('FÁCIL', 'MÉDIO', 'DIFÍCIL'))
);

INSERT INTO game_levels (nome, dificuldade) VALUES
    ('Iniciante',    'FÁCIL'),
    ('Intermediário','MÉDIO'),
    ('Avançado',     'DIFÍCIL');

-- 5. VALORES / CATEGORIAS QUÍMICAS

CREATE TABLE domino_values (
    id        SERIAL PRIMARY KEY,
    valor     VARCHAR(50)  NOT NULL UNIQUE,
    categoria VARCHAR(20)  NOT NULL,

    CONSTRAINT chk_categoria
        CHECK (categoria IN ('ÁCIDO', 'BASE', 'SAL', 'ÓXIDO', 'HIDRETO'))
);

-- Exemplos de valores; adicione conforme o conteúdo pedagógico
INSERT INTO domino_values (valor, categoria) VALUES
    -- Classificações (nomes de função — os dois lados das "buchas")
    ('Ácido',   'ÁCIDO'),
    ('Base',    'BASE'),
    ('Sal',     'SAL'),
    ('Óxido',   'ÓXIDO'),
    ('Hidreto', 'HIDRETO'),

    -- Fórmulas: Ácidos
    ('HCl',    'ÁCIDO'),
    ('H2SO4',  'ÁCIDO'),
    ('HNO3',   'ÁCIDO'),

    -- Fórmulas: Bases
    ('NaOH',    'BASE'),
    ('KOH',     'BASE'),
    ('Ca(OH)2', 'BASE'),

    -- Fórmulas: Sais
    ('NaCl',   'SAL'),
    ('CaCO3',  'SAL'),
    ('Na2SO4', 'SAL'),
    ('KNO3',   'SAL'),

    -- Fórmulas: Óxidos
    ('Na2O',   'ÓXIDO'),
    ('CaO',    'ÓXIDO'),
    ('CO2',    'ÓXIDO'),
    ('Fe2O3',  'ÓXIDO'),

    -- Fórmulas: Hidretos (faltavam completamente!)
    ('NaH',  'HIDRETO'),
    ('CaH2', 'HIDRETO');

-- Peças do Dominó Químico
-- Formato: (valor_a, valor_b) onde cada um é id da tabela domino_values
-- "Buchas" = peças com duas classificações (nomes de função)
-- Referências por ordem do INSERT acima:
-- 1=Ácido  2=Base  3=Sal  4=Óxido  5=Hidreto
-- 6=HCl  7=H2SO4  8=HNO3
-- 9=NaOH 10=KOH  11=Ca(OH)2
-- 12=NaCl 13=CaCO3 14=Na2SO4 15=KNO3
-- 16=Na2O 17=CaO 18=CO2 19=Fe2O3
-- 20=NaH  21=CaH2

INSERT INTO domino_tiles (valor_a, valor_b) VALUES
    -- Buchas (classificação ↔ classificação — lados opostos de função)
    (1, 2),   -- Ácido | Base
    (1, 3),   -- Ácido | Sal
    (1, 4),   -- Ácido | Óxido
    (1, 5),   -- Ácido | Hidreto  ← PEÇA INICIAL (regra do PDF)
    (2, 3),   -- Base | Sal
    (2, 4),   -- Base | Óxido
    (2, 5),   -- Base | Hidreto
    (3, 4),   -- Sal | Óxido
    (3, 5),   -- Sal | Hidreto
    (4, 5),   -- Óxido | Hidreto

    -- Fórmula ↔ Classificação (encaixes normais)
    (6,  1),  -- HCl     | Ácido
    (7,  1),  -- H2SO4   | Ácido
    (8,  1),  -- HNO3    | Ácido
    (9,  2),  -- NaOH    | Base
    (10, 2),  -- KOH     | Base
    (11, 2),  -- Ca(OH)2 | Base
    (12, 3),  -- NaCl    | Sal
    (13, 3),  -- CaCO3   | Sal
    (14, 3),  -- Na2SO4  | Sal
    (16, 4),  -- Na2O    | Óxido
    (17, 4),  -- CaO     | Óxido
    (18, 4),  -- CO2     | Óxido
    (19, 4),  -- Fe2O3   | Óxido
    (20, 5),  -- NaH     | Hidreto
    (21, 5),  -- CaH2    | Hidreto

    -- Fórmula ↔ Fórmula (mesma função — combinações extras)
    (6,  7),  -- HCl    | H2SO4   (Ácido ↔ Ácido)
    (9, 11),  -- NaOH   | Ca(OH)2 (Base  ↔ Base)
    (12,14);  -- NaCl   | Na2SO4  (Sal   ↔ Sal)

-- 6. PEÇAS DE DOMINÓ

CREATE TABLE domino_tiles (
    id          SERIAL PRIMARY KEY,
    valor_a     INT NOT NULL REFERENCES domino_values(id),
    valor_b     INT NOT NULL REFERENCES domino_values(id)
);

-- Junction: peça para cada nível (controla quais peças aparecem em cada dificuldade)
CREATE TABLE tile_levels (
    tile_id     INT REFERENCES domino_tiles(id)  ON DELETE CASCADE,
    level_id    INT REFERENCES game_levels(id)   ON DELETE CASCADE,
    PRIMARY KEY (tile_id, level_id)
);

-- 7. PARTIDAS

CREATE TABLE matches (
    id              SERIAL PRIMARY KEY,
    level_id        INT             NOT NULL REFERENCES game_levels(id),
    status          VARCHAR(15)     NOT NULL DEFAULT 'AGUARDANDO',
    codigo_sala     VARCHAR(10)     UNIQUE,          -- código para o aluno entrar no lobby
    max_jogadores   INT             NOT NULL DEFAULT 4,
    iniciado_em     TIMESTAMP,
    finalizado_em   TIMESTAMP,
    criado_em       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_status_match
        CHECK (status IN ('AGUARDANDO', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA')),

    CONSTRAINT chk_max_jogadores
        CHECK (max_jogadores BETWEEN 2 AND 4)
);

CREATE INDEX idx_matches_codigo ON matches(codigo_sala);
CREATE INDEX idx_matches_status ON matches(status);

-- 8. JOGADORES NA PARTIDA

CREATE TABLE match_players (
    id              SERIAL PRIMARY KEY,
    match_id        INT     NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id         INT     NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    ordem_jogada    INT,
    pontuacao       INT     DEFAULT 0,
    vencedor        BOOLEAN DEFAULT FALSE,
    UNIQUE (match_id, user_id)
);

-- 9. MÃO DOS JOGADORES

CREATE TABLE player_hands (
    id              SERIAL PRIMARY KEY,
    match_player_id INT     NOT NULL REFERENCES match_players(id) ON DELETE CASCADE,
    tile_id         INT     NOT NULL REFERENCES domino_tiles(id),
    jogada_em       TIMESTAMP
);

-- 10. TABULEIRO

CREATE TABLE board_tiles (
    id              SERIAL PRIMARY KEY,
    match_id        INT     NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    tile_id         INT     NOT NULL REFERENCES domino_tiles(id),
    posicao         INT     NOT NULL,        -- ordem no tabuleiro
    lado            VARCHAR(8) NOT NULL,

    CONSTRAINT chk_lado
        CHECK (lado IN ('ESQUERDA', 'DIREITA', 'CENTRO'))
);

-- 11. JOGADAS

CREATE TABLE moves (
    id              SERIAL PRIMARY KEY,
    match_id        INT     NOT NULL REFERENCES matches(id)          ON DELETE CASCADE,

    -- Referencia match_players, não users — impede jogada de quem não está na partida
    player_id       INT     NOT NULL REFERENCES match_players(id)    ON DELETE CASCADE,

    tile_id         INT     NOT NULL REFERENCES domino_tiles(id),
    lado_jogado     VARCHAR(8) NOT NULL,
    passou_vez      BOOLEAN DEFAULT FALSE,
    jogado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_lado_move
        CHECK (lado_jogado IN ('ESQUERDA', 'DIREITA', 'CENTRO'))
);

CREATE INDEX idx_moves_match ON moves(match_id);

-- 12. ESTATÍSTICAS DO JOGADOR POR NÍVEL

CREATE TABLE player_stats (
    id              SERIAL PRIMARY KEY,
    user_id         INT     NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    level_id        INT     NOT NULL REFERENCES game_levels(id),
    partidas_jogadas INT    DEFAULT 0,
    vitorias        INT     DEFAULT 0,
    derrotas        INT     DEFAULT 0,
    pontos_totais   INT     DEFAULT 0,
    ultima_partida  TIMESTAMP,

    UNIQUE (user_id, level_id)   -- um registro por aluno por nível
);

-- 13. VIEWS ÚTEIS

-- Relatório do professor: desempenho dos alunos da sua turma por nível
CREATE OR REPLACE VIEW vw_relatorio_professor AS
SELECT
    t.professor_id,
    t.nome          AS turma,
    u.nome          AS aluno,
    u.email,
    gl.dificuldade,
    ps.partidas_jogadas,
    ps.vitorias,
    ps.derrotas,
    ps.pontos_totais,
    CASE
        WHEN ps.partidas_jogadas > 0
        THEN ROUND(ps.vitorias::NUMERIC / ps.partidas_jogadas * 100, 1)
        ELSE 0
    END             AS taxa_vitoria_pct
FROM turmas t
JOIN turma_alunos ta ON ta.turma_id = t.id
JOIN users u          ON u.id = ta.aluno_id
LEFT JOIN player_stats ps ON ps.user_id = u.id
LEFT JOIN game_levels gl  ON gl.id = ps.level_id
WHERE u.anonimizado = FALSE;


-- Lobby: partidas abertas com vagas disponíveis
CREATE OR REPLACE VIEW vw_partidas_abertas AS
SELECT
    m.id,
    m.codigo_sala,
    m.max_jogadores,
    gl.dificuldade,
    COUNT(mp.id)                AS jogadores_atuais,
    m.max_jogadores - COUNT(mp.id) AS vagas_restantes,
    m.criado_em
FROM matches m
JOIN game_levels gl  ON gl.id = m.level_id
LEFT JOIN match_players mp ON mp.match_id = m.id
WHERE m.status = 'AGUARDANDO'
GROUP BY m.id, m.codigo_sala, m.max_jogadores, gl.dificuldade, m.criado_em;

-- 14. FUNÇÃO: atualizar stats após partida

CREATE OR REPLACE FUNCTION fn_atualizar_stats(
    p_user_id   INT,
    p_level_id  INT,
    p_venceu    BOOLEAN,
    p_pontos    INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO player_stats (user_id, level_id, partidas_jogadas, vitorias, derrotas, pontos_totais, ultima_partida)
    VALUES (
        p_user_id, p_level_id, 1,
        CASE WHEN p_venceu THEN 1 ELSE 0 END,
        CASE WHEN p_venceu THEN 0 ELSE 1 END,
        p_pontos,
        NOW()
    )
    ON CONFLICT (user_id, level_id) DO UPDATE SET
        partidas_jogadas = player_stats.partidas_jogadas + 1,
        vitorias         = player_stats.vitorias  + CASE WHEN p_venceu THEN 1 ELSE 0 END,
        derrotas         = player_stats.derrotas  + CASE WHEN p_venceu THEN 0 ELSE 1 END,
        pontos_totais    = player_stats.pontos_totais + p_pontos,
        ultima_partida   = NOW();
END;
$$ LANGUAGE plpgsql;

-- 15. TRIGGER: fechar sessões ao anonimizar usuário (LGPD)

CREATE OR REPLACE FUNCTION fn_revogar_sessoes_lgpd()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.anonimizado = TRUE AND OLD.anonimizado = FALSE THEN
        UPDATE user_sessions
        SET revogado = TRUE
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_anonimizar_usuario
AFTER UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_revogar_sessoes_lgpd();