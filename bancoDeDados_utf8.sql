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

-- 1. USUÃRIOS

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

    -- ValidaÃ§Ã£o de e-mail institucional
    CONSTRAINT chk_email_institucional
        CHECK (email LIKE '%@aluno.cps.sp.gov.br' OR email LIKE '%@cps.sp.gov.br')
);

-- 2. SESSÃ•ES / REVOGAÃ‡ÃƒO DE JWT

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

-- 3. TURMAS (relaÃ§Ã£o professor pro aluno)

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

-- 3b. SALAS DE JOGO (professor cria, alunos entram por cÃ³digo)

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

-- 4. NÃVEIS DE DIFICULDADE

CREATE TABLE game_levels (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(50)     NOT NULL,
    dificuldade VARCHAR(10)     NOT NULL,

    CONSTRAINT chk_dificuldade
        CHECK (dificuldade IN ('FÃCIL', 'MÃ‰DIO', 'DIFÃCIL'))
);

INSERT INTO game_levels (nome, dificuldade) VALUES
    ('Iniciante',    'FÃCIL'),
    ('IntermediÃ¡rio','MÃ‰DIO'),
    ('AvanÃ§ado',     'DIFÃCIL');

-- 5. VALORES / CATEGORIAS QUÃMICAS

CREATE TABLE domino_values (
    id        SERIAL PRIMARY KEY,
    valor     VARCHAR(50)  NOT NULL UNIQUE,
    categoria VARCHAR(20)  NOT NULL,

    CONSTRAINT chk_categoria
        CHECK (categoria IN ('ÃCIDO', 'BASE', 'SAL', 'Ã“XIDO', 'HIDRETO'))
);

-- Exemplos de valores; adicione conforme o conteÃºdo pedagÃ³gico
INSERT INTO domino_values (valor, categoria) VALUES
    -- ClassificaÃ§Ãµes (nomes de funÃ§Ã£o â€” os dois lados das "buchas")
    ('Ãcido',   'ÃCIDO'),
    ('Base',    'BASE'),
    ('Sal',     'SAL'),
    ('Ã“xido',   'Ã“XIDO'),
    ('Hidreto', 'HIDRETO'),

    -- FÃ³rmulas: Ãcidos
    ('HCl',    'ÃCIDO'),
    ('H2SO4',  'ÃCIDO'),
    ('HNO3',   'ÃCIDO'),

    -- FÃ³rmulas: Bases
    ('NaOH',    'BASE'),
    ('KOH',     'BASE'),
    ('Ca(OH)2', 'BASE'),

    -- FÃ³rmulas: Sais
    ('NaCl',   'SAL'),
    ('CaCO3',  'SAL'),
    ('Na2SO4', 'SAL'),
    ('KNO3',   'SAL'),

    -- FÃ³rmulas: Ã“xidos
    ('Na2O',   'Ã“XIDO'),
    ('CaO',    'Ã“XIDO'),
    ('CO2',    'Ã“XIDO'),
    ('Fe2O3',  'Ã“XIDO'),

    -- FÃ³rmulas: Hidretos (faltavam completamente!)
    ('NaH',  'HIDRETO'),
    ('CaH2', 'HIDRETO');

-- PeÃ§as do DominÃ³ QuÃ­mico
-- Formato: (valor_a, valor_b) onde cada um Ã© id da tabela domino_values
-- "Buchas" = peÃ§as com duas classificaÃ§Ãµes (nomes de funÃ§Ã£o)
-- ReferÃªncias por ordem do INSERT acima:
-- 1=Ãcido  2=Base  3=Sal  4=Ã“xido  5=Hidreto
-- 6=HCl  7=H2SO4  8=HNO3
-- 9=NaOH 10=KOH  11=Ca(OH)2
-- 12=NaCl 13=CaCO3 14=Na2SO4 15=KNO3
-- 16=Na2O 17=CaO 18=CO2 19=Fe2O3
-- 20=NaH  21=CaH2

CREATE TABLE domino_tiles (
    id          SERIAL PRIMARY KEY,
    valor_a     INT NOT NULL REFERENCES domino_values(id),
    valor_b     INT NOT NULL REFERENCES domino_values(id)
);

INSERT INTO domino_tiles (valor_a, valor_b) VALUES
    -- Buchas (classificaÃ§Ã£o â†” classificaÃ§Ã£o â€” lados opostos de funÃ§Ã£o)
    (1, 2),   -- Ãcido | Base
    (1, 3),   -- Ãcido | Sal
    (1, 4),   -- Ãcido | Ã“xido
    (1, 5),   -- Ãcido | Hidreto  â† PEÃ‡A INICIAL (regra do PDF)
    (2, 3),   -- Base | Sal
    (2, 4),   -- Base | Ã“xido
    (2, 5),   -- Base | Hidreto
    (3, 4),   -- Sal | Ã“xido
    (3, 5),   -- Sal | Hidreto
    (4, 5),   -- Ã“xido | Hidreto

    -- FÃ³rmula â†” ClassificaÃ§Ã£o (encaixes normais)
    (6,  1),  -- HCl     | Ãcido
    (7,  1),  -- H2SO4   | Ãcido
    (8,  1),  -- HNO3    | Ãcido
    (9,  2),  -- NaOH    | Base
    (10, 2),  -- KOH     | Base
    (11, 2),  -- Ca(OH)2 | Base
    (12, 3),  -- NaCl    | Sal
    (13, 3),  -- CaCO3   | Sal
    (14, 3),  -- Na2SO4  | Sal
    (16, 4),  -- Na2O    | Ã“xido
    (17, 4),  -- CaO     | Ã“xido
    (18, 4),  -- CO2     | Ã“xido
    (19, 4),  -- Fe2O3   | Ã“xido
    (20, 5),  -- NaH     | Hidreto
    (21, 5),  -- CaH2    | Hidreto

    -- FÃ³rmula â†” FÃ³rmula (mesma funÃ§Ã£o â€” combinaÃ§Ãµes extras)
    (6,  7),  -- HCl    | H2SO4   (Ãcido â†” Ãcido)
    (9, 11),  -- NaOH   | Ca(OH)2 (Base  â†” Base)
    (12,14);  -- NaCl   | Na2SO4  (Sal   â†” Sal)

-- 6. PEÃ‡AS DE DOMINÃ“



-- Junction: peÃ§a para cada nÃ­vel (controla quais peÃ§as aparecem em cada dificuldade)
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
    codigo_sala     VARCHAR(10)     UNIQUE,          -- cÃ³digo para o aluno entrar no lobby
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

-- 9. MÃƒO DOS JOGADORES

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

    -- Referencia match_players, nÃ£o users â€” impede jogada de quem nÃ£o estÃ¡ na partida
    player_id       INT     NOT NULL REFERENCES match_players(id)    ON DELETE CASCADE,

    tile_id         INT     NOT NULL REFERENCES domino_tiles(id),
    lado_jogado     VARCHAR(8) NOT NULL,
    passou_vez      BOOLEAN DEFAULT FALSE,
    jogado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_lado_move
        CHECK (lado_jogado IN ('ESQUERDA', 'DIREITA', 'CENTRO'))
);

CREATE INDEX idx_moves_match ON moves(match_id);

-- 12. ESTATÃSTICAS DO JOGADOR POR NÃVEL

CREATE TABLE player_stats (
    id              SERIAL PRIMARY KEY,
    user_id         INT     NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    level_id        INT     NOT NULL REFERENCES game_levels(id),
    partidas_jogadas INT    DEFAULT 0,
    vitorias        INT     DEFAULT 0,
    derrotas        INT     DEFAULT 0,
    pontos_totais   INT     DEFAULT 0,
    ultima_partida  TIMESTAMP,

    UNIQUE (user_id, level_id)   -- um registro por aluno por nÃ­vel
);

-- 13. VIEWS ÃšTEIS

-- RelatÃ³rio do professor: desempenho dos alunos da sua turma por nÃ­vel
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


-- Lobby: partidas abertas com vagas disponÃ­veis
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

-- 14. FUNÃ‡ÃƒO: atualizar stats apÃ³s partida

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

-- 15. TRIGGER: fechar sessÃµes ao anonimizar usuÃ¡rio (LGPD)

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