import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:8080';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Teko:wght@400;500;600;700&display=swap');

  :root {
    --red: #7a1010;
    --red-bright: #e8302a;
    --bg: #f0f4f0;
    --grid: #b0c8b0;
    --white: #ffffff;
    --dark: #3a1010;
    --green: #2e7d32;
    --green-bright: #4caf50;
    --mono: 'Share Tech Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dashboard-wrapper {
    min-height: 100vh;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 48px 48px;
    padding: 24px;
    font-family: var(--mono);
  }

  .dashboard-container {
    max-width: 960px;
    margin: 0 auto;
    position: relative;
  }

  /* Corner brackets */
  .corner { position: absolute; width: 24px; height: 24px; }
  .corner-tl { top: -6px; left: -6px; border-top: 2.5px solid var(--red-bright); border-left: 2.5px solid var(--red-bright); }
  .corner-tr { top: -6px; right: -6px; border-top: 2.5px solid var(--red-bright); border-right: 2.5px solid var(--red-bright); }
  .corner-bl { bottom: -6px; left: -6px; border-bottom: 2.5px solid var(--red-bright); border-left: 2.5px solid var(--red-bright); }
  .corner-br { bottom: -6px; right: -6px; border-bottom: 2.5px solid var(--red-bright); border-right: 2.5px solid var(--red-bright); }

  /* ── Header ── */
  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 4px 20px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--red);
    background: #f8d0d0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--red);
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  .user-name {
    font-size: 15px;
    letter-spacing: 2px;
    color: var(--dark);
  }

  .btn-sair {
    border: 1.5px solid var(--red);
    background: rgba(255,255,255,0.5);
    padding: 8px 28px;
    font-family: var(--mono);
    font-size: 14px;
    letter-spacing: 3px;
    color: var(--red);
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 4px;
  }

  .btn-sair:hover { background: rgba(232,48,42,0.1); }

  /* ── Body ── */
  .dash-body {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 16px;
    align-items: start;
  }

  .dash-left {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Jogar agora */
  .btn-jogar {
    width: 100%;
    border: 1.5px solid var(--red);
    border-radius: 8px;
    background: rgba(255,255,255,0.5);
    padding: 18px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: var(--mono);
    font-size: 20px;
    letter-spacing: 4px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    text-align: left;
  }

  .btn-jogar:hover {
    background: rgba(232,48,42,0.08);
    box-shadow: 0 0 0 1px var(--red-bright);
  }

  .btn-jogar:active { transform: scale(0.99); }

  .play-icon {
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 16px solid var(--red);
    flex-shrink: 0;
  }

  /* Desempenho */
  .desempenho-box {
    border: 1.5px solid var(--red);
    border-radius: 8px;
    background: rgba(255,255,255,0.45);
    padding: 16px 18px;
  }

  .desempenho-title {
    font-size: 14px;
    letter-spacing: 2px;
    color: var(--red);
    margin-bottom: 14px;
  }

  .aulas-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .aula-card {
    border: 1.5px solid var(--red);
    border-radius: 6px;
    background: rgba(255,255,255,0.5);
    padding: 10px 12px 8px;
  }

  .aula-label {
    font-size: 11px;
    letter-spacing: 1.5px;
    color: var(--red);
    margin-bottom: 10px;
  }

  .bar-chart {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 10px;
    height: 60px;
  }

  .bar {
    width: 22px;
    border-radius: 2px 2px 0 0;
    transition: height 0.4s ease;
  }

  .bar-green { background: var(--green-bright); }
  .bar-red   { background: var(--red-bright); }

  /* ── Classificação ── */
  .ranking-box {
    border: 1.5px solid var(--red);
    border-radius: 8px;
    background: rgba(255,255,255,0.45);
    padding: 16px 18px;
  }

  .ranking-title {
    font-size: 13px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ranking-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    letter-spacing: 1px;
  }

  .rank-pos {
    color: var(--dark);
    min-width: 16px;
  }

  .rank-name {
    flex: 1;
    color: var(--dark);
  }

  .rank-name.me {
    font-weight: 700;
    color: var(--red);
  }

  .rank-pct {
    color: var(--green);
    font-weight: 700;
    min-width: 38px;
    text-align: right;
  }

  .rank-pct.low { color: #c47a00; }
  .rank-pct.very-low { color: var(--red-bright); }

  @media (max-width: 680px) {
    .dash-body { grid-template-columns: 1fr; }
    .aulas-grid { grid-template-columns: 1fr; }
  }
`;

const aulas = [
  { label: "Jogo 1", green: 75, red: 35 },
  { label: "Jogo 2", green: 60, red: 45 },
  { label: "Jogo 3", green: 85, red: 20 },
];

const ranking = [
  { pos: 1, name: "Ana C.",   pct: 94, me: false },
  { pos: 2, name: "João M.",  pct: 88, me: true  },
  { pos: 3, name: "Pleo S.",  pct: 76, me: false },
  { pos: 4, name: "Laura F.", pct: 67, me: false },
  { pos: 5, name: "Manja R.", pct: 55, me: false },
];

function pctClass(p) {
  if (p >= 75) return "";
  if (p >= 60) return "low";
  return "very-low";
}

export default function DashboardAlunoPage() {
  const navigate = useNavigate();
  const [codigoSala, setCodigoSala] = useState('');
  const [erroSala, setErroSala] = useState('');
  const [loadingSala, setLoadingSala] = useState(false);

  const nome = localStorage.getItem('nome') || 'Aluno';
  const iniciais = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  function handleJogar() {
    navigate('/game');
  }

  function handleSair() {
    localStorage.clear();
    navigate('/login');
  }

  async function handleEntrarSala() {
    if (!codigoSala.trim()) {
      setErroSala('Digite o código da sala');
      return;
    }
    setErroSala('');
    setLoadingSala(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/rooms/${codigoSala.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErroSala(json.error || 'Erro ao entrar na sala');
        return;
      }
      navigate(`/room/${codigoSala.trim().toUpperCase()}`);
    } catch (err) {
      setErroSala('Erro de conexão');
    } finally {
      setLoadingSala(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Header */}
          <div className="dash-header">
            <div className="user-info">
              <div className="avatar">{iniciais}</div>
              <span className="user-name">{nome}</span>
            </div>
            <button className="btn-sair" onClick={handleSair}>Sair</button>
          </div>

          {/* Body */}
          <div className="dash-body">

            {/* Left */}
            <div className="dash-left">

              {/* Jogar agora */}
              <button className="btn-jogar" onClick={handleJogar}>
                <div className="play-icon" />
                PARTIDA RÁPIDA (VS BOT)
              </button>

              {/* Entrar em Sala */}
              <div className="desempenho-box">
                <div className="desempenho-title">Entrar em Sala</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: erroSala ? '8px' : '0' }}>
                  <input
                    type="text"
                    placeholder="CÓDIGO DA SALA"
                    value={codigoSala}
                    onChange={e => setCodigoSala(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      border: '1.5px solid var(--red)',
                      borderRadius: '4px',
                      fontFamily: 'var(--mono)',
                      fontSize: '16px',
                      letterSpacing: '4px',
                      color: 'var(--dark)',
                      background: 'rgba(255,255,255,0.5)',
                      outline: 'none',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleEntrarSala()}
                  />
                  <button
                    onClick={handleEntrarSala}
                    disabled={loadingSala}
                    style={{
                      padding: '12px 20px',
                      border: '1.5px solid var(--red)',
                      borderRadius: '4px',
                      fontFamily: 'var(--mono)',
                      fontSize: '13px',
                      letterSpacing: '2px',
                      color: 'var(--red)',
                      background: 'rgba(255,255,255,0.5)',
                      cursor: loadingSala ? 'wait' : 'pointer',
                      textTransform: 'uppercase',
                      transition: 'background 0.2s',
                      opacity: loadingSala ? 0.6 : 1,
                    }}
                  >
                    {loadingSala ? '...' : 'ENTRAR'}
                  </button>
                </div>
                {erroSala && (
                  <div style={{
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: 'var(--red-bright)',
                    marginTop: '6px',
                  }}>
                    {erroSala}
                  </div>
                )}
              </div>

              {/* Meu Desempenho */}
              <div className="desempenho-box">
                <div className="desempenho-title">Meu Desempenho</div>
                <div className="aulas-grid">
                  {aulas.map((aula) => (
                    <div className="aula-card" key={aula.label}>
                      <div className="aula-label">{aula.label}</div>
                      <div className="bar-chart">
                        <div
                          className="bar bar-green"
                          style={{ height: `${aula.green}%` }}
                        />
                        <div
                          className="bar bar-red"
                          style={{ height: `${aula.red}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Ranking */}
            <div className="ranking-box">
              <div className="ranking-title">CLASSIFICAÇÃO DA TURMA</div>
              <div className="ranking-list">
                {ranking.map((r) => (
                  <div className="ranking-row" key={r.pos}>
                    <span className="rank-pos">{r.pos}</span>
                    <span className={`rank-name ${r.me ? "me" : ""}`}>{r.name}</span>
                    <span className={`rank-pct ${pctClass(r.pct)}`}>{r.pct}%</span>
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