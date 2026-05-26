import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Teko:wght@400;500;600;700&display=swap');

  :root {
    --red: #7a1010;
    --red-bright: #e8302a;
    --bg: #f0f4f0;
    --grid: #b0c8b0;
    --white: #ffffff;
    --dark: #5a0a0a;
    --mono: 'Share Tech Mono', monospace;
    --display: 'Teko', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .config-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 48px 48px;
    padding: 30px 20px;
    font-family: var(--mono);
  }

  .config-container {
    width: 100%;
    max-width: 900px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Corner brackets */
  .corner { position: absolute; width: 28px; height: 28px; z-index: 2; }
  .corner-tl { top: -4px; left: -4px; border-top: 3px solid var(--red-bright); border-left: 3px solid var(--red-bright); }
  .corner-tr { top: -4px; right: -4px; border-top: 3px solid var(--red-bright); border-right: 3px solid var(--red-bright); }
  .corner-bl { bottom: -4px; left: -4px; border-bottom: 3px solid var(--red-bright); border-left: 3px solid var(--red-bright); }
  .corner-br { bottom: -4px; right: -4px; border-bottom: 3px solid var(--red-bright); border-right: 3px solid var(--red-bright); }

  /* Title */
  .config-title {
    text-align: center;
    font-family: var(--mono);
    font-size: 22px;
    letter-spacing: 6px;
    color: var(--red);
    text-transform: uppercase;
    padding: 18px 0 14px;
  }

  /* Sections */
  .section-box {
    border: 1.5px solid var(--red);
    background: rgba(255,255,255,0.55);
    margin-bottom: 10px;
    padding: 18px 20px;
  }

  /* Mode selection */
  .mode-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .mode-card {
    border: 2px solid var(--red);
    border-radius: 10px;
    padding: 20px 22px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    background: rgba(255,255,255,0.4);
  }

  .mode-card:hover {
    background: rgba(255,255,255,0.7);
  }

  .mode-card.selected {
    border-color: var(--red-bright);
    border-width: 2.5px;
    background: rgba(255, 220, 220, 0.4);
    box-shadow: 0 0 0 1px var(--red-bright);
  }

  .mode-name {
    font-family: var(--mono);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .mode-desc {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--dark);
    letter-spacing: 1px;
  }

  /* Difficulty */
  .diff-title {
    text-align: center;
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 2px;
    color: var(--red);
    margin-bottom: 14px;
  }

  .diff-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }

  .diff-card {
    border: 2px solid var(--red);
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    background: rgba(255,255,255,0.4);
  }

  .diff-card:hover { background: rgba(255,255,255,0.7); }

  .diff-card.selected {
    border-color: var(--red-bright);
    border-width: 2.5px;
    background: rgba(255, 220, 220, 0.4);
    box-shadow: 0 0 0 1px var(--red-bright);
  }

  .diff-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot-easy   { background: #1a7a3a; }
  .dot-medium { background: #c47a00; }
  .dot-hard   { background: #e8302a; }

  .diff-label {
    font-family: var(--mono);
    font-size: 15px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
  }

  /* Settings */
  .settings-section {
    border: 1.5px solid var(--red);
    background: rgba(255,255,255,0.55);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .settings-left {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .setting-label {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 1px;
    color: var(--red);
    text-transform: uppercase;
    min-width: 110px;
    line-height: 1.4;
  }

  .setting-select {
    appearance: none;
    -webkit-appearance: none;
    background: rgba(255,255,255,0.7);
    border: 1.5px solid var(--red);
    border-radius: 4px;
    padding: 8px 36px 8px 12px;
    font-family: var(--mono);
    font-size: 14px;
    color: var(--red);
    letter-spacing: 1px;
    cursor: pointer;
    min-width: 120px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a1010' stroke-width='2' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    outline: none;
    transition: border-color 0.2s;
  }

  .setting-select:focus { border-color: var(--red-bright); }

  /* Continuar button */
  .btn-continuar {
    padding: 16px 36px;
    border: 2px solid var(--red);
    border-radius: 6px;
    background: rgba(255,255,255,0.4);
    font-family: var(--mono);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    white-space: nowrap;
  }

  .btn-continuar:hover {
    background: rgba(232, 48, 42, 0.12);
    box-shadow: 0 0 0 1px var(--red-bright);
    border-color: var(--red-bright);
  }

  .btn-continuar:active { transform: scale(0.98); }

  @media (max-width: 600px) {
    .mode-grid { grid-template-columns: 1fr; }
    .diff-grid { grid-template-columns: 1fr; }
    .settings-section { flex-direction: column; align-items: flex-start; }
  }
`;

const MODES = [
  { id: "solo",        name: "SOLO",        desc: "Jogue contra o tempo" },
  { id: "multiplayer", name: "MULTIPLAYER", desc: "Até 4 jogadores"      },
];

const DIFFICULTIES = [
  { id: "facil",   label: "Fácil",  dotClass: "dot-easy"   },
  { id: "medio",   label: "Médio",  dotClass: "dot-medium" },
  { id: "dificil", label: "Difícil", dotClass: "dot-hard"  },
];

export default function ConfigPage() {
  const [mode,       setMode]       = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [tempo,      setTempo]      = useState("60s");
  const [pedras,     setPedras]     = useState("7");

  function handleContinuar() {
    if (!mode || !difficulty) {
      alert("Selecione o modo e a dificuldade!");
      return;
    }
    alert(`Modo: ${mode} | Dificuldade: ${difficulty} | Tempo: ${tempo} | Pedras: ${pedras}`);
  }

  return (
    <>
      <style>{styles}</style>

      <div className="config-wrapper">
        <div className="config-container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Title */}
          <div className="config-title">CONFIGURAR PARTIDA</div>

          {/* Mode */}
          <div className="section-box">
            <div className="mode-grid">
              {MODES.map(m => (
                <div
                  key={m.id}
                  className={`mode-card ${mode === m.id ? "selected" : ""}`}
                  onClick={() => setMode(m.id)}
                >
                  <div className="mode-name">{m.name}</div>
                  <div className="mode-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="section-box">
            <div className="diff-title">Selecione a Dificuldade</div>
            <div className="diff-grid">
              {DIFFICULTIES.map(d => (
                <div
                  key={d.id}
                  className={`diff-card ${difficulty === d.id ? "selected" : ""}`}
                  onClick={() => setDifficulty(d.id)}
                >
                  <div className={`diff-dot ${d.dotClass}`} />
                  <span className="diff-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings + Continuar */}
          <div className="settings-section">
            <div className="settings-left">
              <div className="setting-row">
                <div className="setting-label">Tempo por<br/>jogada:</div>
                <select
                  className="setting-select"
                  value={tempo}
                  onChange={e => setTempo(e.target.value)}
                >
                  <option value="15s">15s</option>
                  <option value="30s">30s</option>
                  <option value="60s">60s</option>
                </select>
              </div>

              <div className="setting-row">
                <div className="setting-label">Pedras<br/>iniciais:</div>
                <select
                  className="setting-select"
                  value={pedras}
                  onChange={e => setPedras(e.target.value)}
                >
                  <option value="5">5</option>
                  <option value="7">7</option>
                  <option value="9">9</option>
                </select>
              </div>
            </div>

            <button className="btn-continuar" onClick={handleContinuar}>
              CONTINUAR
            </button>
          </div>

        </div>
      </div>
    </>
  );
}