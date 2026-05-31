import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Teko:wght@400;500;600;700&display=swap');

  :root {
    --red: #e8302a;
    --red-light: #f7a8a6;
    --red-pale: #fde8e8;
    --red-mid: #f5c8c8;
    --white: #fff8f8;
    --dark: #2a0a0a;
    --green: #4caf50;
    --green-light: #c2f0d0;
    --mono: 'Share Tech Mono', monospace;
    --display: 'Teko', sans-serif;
  }

  .waiting-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff0f0;
    padding: 20px;
    font-family: 'Share Tech Mono', monospace;
  }

  .waiting-container {
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

  .corner { position: absolute; width: 18px; height: 18px; }
  .corner-tl { top: -2px; left: -2px; border-top: 3px solid var(--red); border-left: 3px solid var(--red); }
  .corner-tr { top: -2px; right: -2px; border-top: 3px solid var(--red); border-right: 3px solid var(--red); }
  .corner-bl { bottom: -2px; left: -2px; border-bottom: 3px solid var(--red); border-left: 3px solid var(--red); }
  .corner-br { bottom: -2px; right: -2px; border-bottom: 3px solid var(--red); border-right: 3px solid var(--red); }

  /* Header */
  .waiting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 2px solid var(--red-light);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-badge {
    width: 40px;
    height: 40px;
    background: transparent;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .waiting-title {
    font-family: var(--display);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 3px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .waiting-title span { color: var(--red); }

  /* Aguardando box */
  .aguardando-box {
    border: 2px solid var(--red);
    padding: 12px 24px;
    text-align: center;
    min-width: 180px;
  }

  .aguardando-label {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--dark);
    font-family: var(--mono);
  }

  .aguardando-number {
    font-family: var(--display);
    font-size: 42px;
    font-weight: 700;
    color: var(--red);
    line-height: 1;
    margin: 4px 0;
  }

  .aguardando-sub {
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--dark);
    font-family: var(--mono);
  }

  /* Room info */
  .room-info {
    padding: 16px 20px;
    border-bottom: 2px solid var(--red-light);
  }

  .room-info-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: #8a4040;
    font-family: var(--mono);
    text-transform: uppercase;
  }

  .room-name {
    font-family: var(--display);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--dark);
    text-transform: uppercase;
    margin: 2px 0 6px;
  }

  .room-code {
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--dark);
    font-family: var(--mono);
    text-transform: uppercase;
  }

  .room-code span {
    font-weight: 700;
    color: var(--red);
  }

  /* Players section */
  .players-section {
    padding: 16px 20px;
  }

  .players-label {
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--dark);
    font-family: var(--mono);
    text-transform: uppercase;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--red-light);
    padding-bottom: 8px;
  }

  .players-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .player-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--red-pale);
    border: 1.5px solid var(--red-light);
    animation: slideIn 0.3s ease both;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .player-info { display: flex; flex-direction: column; gap: 3px; }

  .player-name {
    font-family: var(--display);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .player-role {
    font-size: 10px;
    letter-spacing: 1.5px;
    color: #8a4040;
    font-family: var(--mono);
    text-transform: uppercase;
  }

  .player-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-text {
    font-size: 12px;
    letter-spacing: 2px;
    font-family: var(--mono);
    font-weight: 700;
    text-transform: uppercase;
  }

  .status-ready { color: var(--green); }
  .status-waiting { color: #d4860a; }

  .status-btn {
    padding: 8px 16px;
    border: 2px solid;
    font-family: var(--display);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: default;
    min-width: 110px;
    text-align: center;
  }

  .btn-ready {
    border-color: var(--green);
    color: var(--green);
    background: var(--green-light);
  }

  /* Footer */
  .waiting-footer {
    padding: 16px 20px;
    border-top: 2px solid var(--red-light);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-buttons {
    display: flex;
    gap: 12px;
  }

  .btn-sair {
    flex: 1;
    padding: 14px;
    background: var(--red-pale);
    border: 2px solid var(--red);
    font-family: var(--display);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 3px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-sair:hover { background: var(--red-mid); }

  .btn-iniciar {
    flex: 2;
    padding: 14px;
    background: var(--red);
    border: 2px solid var(--red);
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

  .btn-iniciar:hover { background: #c5251f; }
  .btn-iniciar:active { transform: scale(0.98); }

  .footer-hint {
    text-align: center;
    padding-left: 36%;
    font-size: 10px;
    letter-spacing: 2px;
    color: #8a4040;
    font-family: var(--mono);
    text-transform: uppercase;
  }

  @media (max-width: 600px) {
    .waiting-header { flex-direction: column; gap: 12px; align-items: flex-start; }
    .footer-buttons { flex-direction: column; }
  }
`;

const players = [
  { id: 1, name: "Gabriel", role: "Criador da Sala", ready: true  },
  { id: 2, name: "Maria",   role: "",                ready: true  },
  { id: 3, name: "Lucas",   role: "",                ready: true  },
  { id: 4, name: "Ana",     role: "",                ready: true  },
];

const totalNeeded = 0; // todos prontos

export default function WaitingPage() {
  const notReady = players.filter(p => !p.ready).length;

  function handleSair() {
    alert("Saindo da sala...");
  }

  function handleIniciar() {
    alert("Iniciando partida!");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="waiting-wrapper">
        <div className="waiting-container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Header */}
          <div className="waiting-header">
            <div className="header-left">
              <div className="logo-badge">
                <img src="/logo.png" alt="Logo" width="40" height="40" style={{ objectFit: "contain" }} />
              </div>
              <div className="waiting-title"><span>// </span>SALA DE ESPERA</div>
            </div>

            <div className="aguardando-box">
              <div className="aguardando-label">AGUARDANDO</div>
              <div className="aguardando-number">{notReady}</div>
              <div className="aguardando-sub">JOGADORES PARA INICIAR</div>
            </div>
          </div>

          {/* Room info */}
          <div className="room-info">
            <div className="room-info-label">NOME DA SALA</div>
            <div className="room-name">Laboratório 01</div>
            <div className="room-code">CÓDIGO DA SALA: <span>QUI7X92</span></div>
          </div>

          {/* Players */}
          <div className="players-section">
            <div className="players-label">JOGADORES</div>
            <div className="players-list">
              {players.map((player, i) => (
                <div
                  className="player-card"
                  key={player.id}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    {player.role && <div className="player-role">{player.role}</div>}
                  </div>
                  <div className="player-right">
                    <span className={`status-text ${player.ready ? "status-ready" : "status-waiting"}`}>
                      {player.ready ? "PRONTO ✓" : "AGUARDANDO..."}
                    </span>
                    <div className={`status-btn ${player.ready ? "btn-ready" : ""}`}>
                      {player.ready ? "PRONTO" : "FICAR PRONTO"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="waiting-footer">
            <div className="footer-buttons">
              <button className="btn-sair" onClick={handleSair}>
                SAIR DA SALA
              </button>
              <button className="btn-iniciar" onClick={handleIniciar}>
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <polygon points="2,1 13,7 2,13" fill="white"/>
                </svg>
                INICIAR PARTIDA
              </button>
            </div>
            <div className="footer-hint">SOMENTE O CRIADOR PODE INICIAR</div>
          </div>

        </div>
      </div>
    </>
  );
}