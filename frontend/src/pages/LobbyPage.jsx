import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Teko:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red: #e8302a;
    --red-light: #f7a8a6;
    --red-pale: #fde8e8;
    --red-mid: #f5c8c8;
    --white: #fff8f8;
    --dark: #2a0a0a;
    --mono: 'Share Tech Mono', monospace;
    --display: 'Teko', sans-serif;
  }

  .lobby-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff0f0;
    padding: 20px;
    font-family: 'Share Tech Mono', monospace;
  }

  .lobby-container {
    width: 100%;
    max-width: 820px;
    border: 2.5px solid var(--red);
    background: var(--white);
    position: relative;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .corner { position: absolute; width: 18px; height: 18px; }
  .corner-tl { top: -2px; left: -2px; border-top: 3px solid var(--red); border-left: 3px solid var(--red); }
  .corner-tr { top: -2px; right: -2px; border-top: 3px solid var(--red); border-right: 3px solid var(--red); }
  .corner-bl { bottom: -2px; left: -2px; border-bottom: 3px solid var(--red); border-left: 3px solid var(--red); }
  .corner-br { bottom: -2px; right: -2px; border-bottom: 3px solid var(--red); border-right: 3px solid var(--red); }

  .lobby-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 2px solid var(--red-light);
    background: var(--white);
  }

  .logo-badge {
    width: 40px;
    height: 40px;
    background: var(--red);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .lobby-title {
    font-family: var(--display);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 3px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .lobby-title span { color: var(--red); }

  .flash-msg {
    margin-left: auto;
    font-size: 11px;
    color: var(--red);
    letter-spacing: 1px;
    font-family: var(--mono);
    animation: fadeIn 0.3s ease;
  }

  .lobby-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 360px;
  }

  .tab-header {
    display: flex;
    border-bottom: 2px solid var(--red-light);
  }

  .tab-btn {
    flex: 1;
    padding: 12px 16px;
    font-family: var(--display);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--red-pale);
    color: var(--red);
  }

  .tab-btn.active { background: var(--red); color: white; }
  .tab-btn:hover:not(.active) { background: var(--red-mid); }

  .left-panel {
    border-right: 2px solid var(--red-light);
    display: flex;
    flex-direction: column;
  }

  .panel-section {
    padding: 16px 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    font-family: var(--mono);
    margin-bottom: 2px;
  }

  .field-group { display: flex; flex-direction: column; gap: 4px; }

  .lobby-input {
    width: 100%;
    padding: 9px 12px;
    background: var(--red-pale);
    border: 1.5px solid var(--red-light);
    font-family: var(--mono);
    font-size: 12px;
    color: var(--dark);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    letter-spacing: 1px;
  }

  .lobby-input::placeholder { color: var(--red-light); }
  .lobby-input:focus { border-color: var(--red); background: #fff5f5; }

  .field-hint {
    font-size: 10px;
    color: #c08080;
    letter-spacing: 1px;
    font-family: var(--mono);
  }

  .number-control {
    display: flex;
    align-items: center;
    border: 1.5px solid var(--red-light);
    background: var(--red-pale);
    width: fit-content;
  }

  .num-btn {
    width: 32px;
    height: 32px;
    background: var(--red-mid);
    border: none;
    font-family: var(--display);
    font-size: 18px;
    color: var(--red);
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .num-btn:hover { background: var(--red-light); }

  .num-display {
    width: 40px;
    text-align: center;
    font-family: var(--display);
    font-size: 18px;
    font-weight: 600;
    color: var(--dark);
    letter-spacing: 1px;
  }

  .create-btn {
    margin: 0 18px 16px;
    padding: 13px;
    background: var(--red);
    border: none;
    font-family: var(--display);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 3px;
    color: white;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .create-btn:hover { background: #c5251f; }
  .create-btn:active { transform: scale(0.98); }

  .right-panel { display: flex; flex-direction: column; }

  .search-bar {
    padding: 12px 16px;
    border-bottom: 1.5px solid var(--red-light);
  }

  .rooms-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rooms-list::-webkit-scrollbar { width: 4px; }
  .rooms-list::-webkit-scrollbar-track { background: var(--red-pale); }
  .rooms-list::-webkit-scrollbar-thumb { background: var(--red-light); border-radius: 2px; }

  .room-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--red-pale);
    border: 1.5px solid var(--red-light);
    transition: border-color 0.2s, background 0.2s;
    animation: slideIn 0.3s ease both;
  }

  .room-card:hover { border-color: var(--red); background: #fddada; }

  .room-info { display: flex; flex-direction: column; gap: 4px; }

  .room-name {
    font-family: var(--display);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .room-meta {
    font-size: 10px;
    letter-spacing: 1.5px;
    color: #8a4040;
    font-family: var(--mono);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .diff-badge {
    font-size: 10px;
    letter-spacing: 1px;
    font-weight: 700;
    font-family: var(--mono);
    padding: 1px 5px;
    border-radius: 2px;
  }

  .diff-hard  { color: #c0392b; background: #ffc9c9; }
  .diff-medium { color: #d4860a; background: #ffe8b0; }
  .diff-easy  { color: #27ae60; background: #c2f0d0; }

  .enter-btn {
    padding: 7px 14px;
    background: var(--red);
    border: none;
    font-family: var(--display);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
    color: white;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .enter-btn:hover { background: #c5251f; }

  .section-heading {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    font-family: var(--mono);
    padding: 10px 16px 4px;
    border-bottom: 1px solid var(--red-mid);
  }

  .empty-state {
    text-align: center;
    padding: 30px 20px;
    color: var(--red-light);
    font-size: 12px;
    letter-spacing: 1.5px;
    font-family: var(--mono);
  }

  @media (max-width: 600px) {
    .lobby-body { grid-template-columns: 1fr; }
    .left-panel { border-right: none; border-bottom: 2px solid var(--red-light); }
  }
`;

const initialRooms = [
  { id: 1, name: "Laboratório 01",  players: 2, maxPlayers: 4, difficulty: "difícil" },
  { id: 2, name: "Química Avançada", players: 3, maxPlayers: 4, difficulty: "médio"  },
  { id: 3, name: "Dominó Químico",  players: 1, maxPlayers: 4, difficulty: "fácil"   },
];

function DiffBadge({ level }) {
  const map = { "difícil": "diff-hard", "médio": "diff-medium", "fácil": "diff-easy" };
  return <span className={`diff-badge ${map[level] ?? "diff-easy"}`}>{level}</span>;
}

export default function LobbyMultiplayer() {
  const [roomName,    setRoomName]    = useState("");
  const [roomCode,    setRoomCode]    = useState("");
  const [maxPlayers,  setMaxPlayers]  = useState(2);
  const [search,      setSearch]      = useState("");
  const [rooms,       setRooms]       = useState(initialRooms);
  const [flash,       setFlash]       = useState("");

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toString().includes(search)
  );

  function showFlash(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2000);
  }

  function handleCreate() {
    if (!roomName.trim()) { showFlash("Digite o nome da sala!"); return; }
    setRooms(prev => [
      { id: Date.now(), name: roomName.trim().toUpperCase(), players: 1, maxPlayers, difficulty: "fácil" },
      ...prev,
    ]);
    setRoomName(""); setRoomCode(""); setMaxPlayers(2);
    showFlash("Sala criada com sucesso!");
  }

  function handleEnter(room) {
    showFlash(`Entrando em ${room.name}...`);
  }

  return (
    <>
      <style>{styles}</style>

      <div className="lobby-wrapper">
        <div className="lobby-container">
          {/* Corner brackets */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* ── Header ── */}
          <div className="lobby-header">
            <div className="logo-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2"  y="2"  width="9" height="9" rx="1" fill="white" opacity="0.9"/>
                <rect x="13" y="2"  width="9" height="9" rx="1" fill="white" opacity="0.6"/>
                <rect x="2"  y="13" width="9" height="9" rx="1" fill="white" opacity="0.6"/>
                <rect x="13" y="13" width="9" height="9" rx="1" fill="white" opacity="0.9"/>
                <circle cx="5"  cy="5"  r="1.2" fill="#e8302a"/>
                <circle cx="18" cy="5"  r="1.2" fill="#e8302a"/>
                <circle cx="5"  cy="18" r="1.2" fill="#e8302a"/>
                <circle cx="16" cy="16" r="1.2" fill="#e8302a"/>
                <circle cx="20" cy="20" r="1.2" fill="#e8302a"/>
              </svg>
            </div>
            <div className="lobby-title"><span>// </span>LOBBY MULTIPLAYER</div>
            {flash && <div className="flash-msg">{flash}</div>}
          </div>

          {/* ── Body ── */}
          <div className="lobby-body">

            {/* ── Left: Create Room ── */}
            <div className="left-panel">
              <div className="tab-header">
                <button className="tab-btn active">CRIAR SALA</button>
              </div>

              <div className="panel-section">
                <div className="section-label">// CRIAR SALA</div>

                <div className="field-group">
                  <span className="section-label">NOME DA SALA</span>
                  <input
                    className="lobby-input"
                    placeholder="EX.: LABORATÓRIO 01"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                  />
                </div>

                <div className="field-group">
                  <span className="section-label">CÓDIGO DA SALA (OPCIONAL)</span>
                  <input
                    className="lobby-input"
                    placeholder="DIGITE O CÓDIGO (OPCIONAL)"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <span className="section-label">MÁXIMO DE JOGADORES</span>
                  <div className="number-control">
                    <button className="num-btn" onClick={() => setMaxPlayers(p => Math.max(2, p - 1))}>−</button>
                    <span className="num-display">{maxPlayers}</span>
                    <button className="num-btn" onClick={() => setMaxPlayers(p => Math.min(4, p + 1))}>+</button>
                  </div>
                  <span className="field-hint">MÍNIMO: 2 | MÁXIMO: 4</span>
                </div>
              </div>

              <button className="create-btn" onClick={handleCreate}>
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <polygon points="2,1 13,7 2,13" fill="white"/>
                </svg>
                CRIAR SALA
              </button>
            </div>

            {/* ── Right: Join Room ── */}
            <div className="right-panel">
              <div className="tab-header">
                <button className="tab-btn active" style={{ cursor: "default" }}>
                  ENTRAR EM SALA
                </button>
              </div>

              <div className="section-heading">// ENTRAR EM SALA</div>

              <div className="search-bar">
                <input
                  className="lobby-input"
                  placeholder="BUSCAR POR NOME OU CÓDIGO DA SALA..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="rooms-list">
                {filtered.length === 0 && (
                  <div className="empty-state">NENHUMA SALA ENCONTRADA</div>
                )}
                {filtered.map((room, i) => (
                  <div
                    className="room-card"
                    key={room.id}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className="room-info">
                      <div className="room-name">{room.name}</div>
                      <div className="room-meta">
                        {room.players}/{room.maxPlayers} JOGADORES
                        <span>|</span>
                        <DiffBadge level={room.difficulty} />
                      </div>
                    </div>
                    <button className="enter-btn" onClick={() => handleEnter(room)}>
                      ENTRAR
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}