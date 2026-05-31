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
    --mono: 'Share Tech Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .relatorio-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff0f0;
    padding: 20px;
    font-family: var(--mono);
  }

  .relatorio-container {
    width: 100%;
    max-width: 900px;
    border: 2.5px solid var(--red);
    background: var(--white);
    position: relative;
    padding: 24px 28px;
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
  .relatorio-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1.5px solid var(--red-light);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title {
    font-family: var(--mono);
    font-size: 18px;
    letter-spacing: 4px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .page-title span { color: var(--red); }

  .btn-sair {
    border: 1.5px solid var(--red);
    background: var(--red-pale);
    padding: 10px 32px;
    font-family: var(--mono);
    font-size: 14px;
    letter-spacing: 3px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 4px;
  }

  .btn-sair:hover { background: var(--red-mid); }

  /* Grid de turmas */
  .turmas-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .turma-card {
    border: 1.5px solid var(--red-light);
    border-radius: 8px;
    background: var(--red-pale);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: slideIn 0.3s ease both;
    transition: border-color 0.2s;
  }

  .turma-card:hover { border-color: var(--red); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .turma-nome {
    font-family: var(--mono);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--dark);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .turma-stat {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    line-height: 1.5;
  }

  .turma-stat span {
    color: var(--dark);
  }

  @media (max-width: 640px) {
    .turmas-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 900px) and (min-width: 641px) {
    .turmas-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const turmas = [
  { id: 1, nome: "TURMA A", partidas: 17, alunos: 28, vitoria: 58 },
  { id: 2, nome: "TURMA B", partidas: 10, alunos: 30, vitoria: 54 },
  { id: 3, nome: "TURMA C", partidas: 19, alunos: 31, vitoria: 59 },
  { id: 4, nome: "TURMA D", partidas: 15, alunos: 29, vitoria: 52 },
  { id: 5, nome: "TURMA E", partidas: 20, alunos: 30, vitoria: 62 },
  { id: 6, nome: "TURMA F", partidas: 14, alunos: 31, vitoria: 48 },
];

export default function RelatorioPage() {
  function handleSair() {
    alert("Saindo...");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="relatorio-wrapper">
        <div className="relatorio-container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Header */}
          <div className="relatorio-header">
            <div className="header-left">
              <div className="logo-badge">
                <img src="/logo.png" alt="Logo" width="32" height="32" style={{ objectFit: "contain" }} />
              </div>
              <div className="page-title"><span>// </span>RELATÓRIOS</div>
            </div>
            <button className="btn-sair" onClick={handleSair}>SAIR</button>
          </div>

          {/* Grid */}
          <div className="turmas-grid">
            {turmas.map((t, i) => (
              <div
                className="turma-card"
                key={t.id}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="turma-nome">{t.nome}</div>
                <div className="turma-stat">PARTIDAS CONCLUIDAS: <span>{t.partidas}</span></div>
                <div className="turma-stat">TOTAL ALUNOS: <span>{t.alunos}</span></div>
                <div className="turma-stat">VITÓRIA/PARTIDA: <span>{t.vitoria}%</span></div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}