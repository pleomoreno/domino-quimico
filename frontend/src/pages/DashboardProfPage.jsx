import { useState } from "react";

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

  .prof-wrapper {
    min-height: 100vh;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 48px 48px;
    padding: 0;
    font-family: var(--mono);
  }

  .prof-container {
    max-width: 100%;
    margin: 0;
    padding: 24px;
    position: relative;
  }

  .corner { position: absolute; width: 24px; height: 24px; }
  .corner-tl { top: 8px; left: 8px; border-top: 2.5px solid var(--red-bright); border-left: 2.5px solid var(--red-bright); }
  .corner-tr { top: 8px; right: 8px; border-top: 2.5px solid var(--red-bright); border-right: 2.5px solid var(--red-bright); }
  .corner-bl { bottom: 8px; left: 8px; border-bottom: 2.5px solid var(--red-bright); border-left: 2.5px solid var(--red-bright); }
  .corner-br { bottom: 8px; right: 8px; border-bottom: 2.5px solid var(--red-bright); border-right: 2.5px solid var(--red-bright); }

  /* Header */
  .prof-header {
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

  .role-badge {
    border: 1.5px solid var(--green-bright);
    padding: 4px 14px;
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--green-bright);
    border-radius: 4px;
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

  /* Body */
  .prof-body {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 16px;
    align-items: start;
  }

  .prof-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Stats */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .stat-card {
    border: 1.5px solid var(--red);
    border-radius: 6px;
    background: rgba(255,255,255,0.45);
    padding: 12px 14px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--green-bright);
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 11px;
    letter-spacing: 1.5px;
    color: var(--dark);
    line-height: 1.4;
  }

  /* Iniciar partida */
  .btn-host {
    width: 100%;
    border: 1.5px solid var(--red);
    border-radius: 8px;
    background: rgba(255,255,255,0.5);
    padding: 18px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: var(--mono);
    font-size: 18px;
    letter-spacing: 4px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    text-align: left;
  }

  .btn-host:hover {
    background: rgba(232,48,42,0.08);
    box-shadow: 0 0 0 1px var(--red-bright);
  }

  .play-icon {
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 16px solid var(--red);
    flex-shrink: 0;
  }

  /* Desempenho dos alunos */
  .desempenho-box {
    border: 1.5px solid var(--red);
    border-radius: 8px;
    background: rgba(255,255,255,0.45);
    padding: 14px 16px;
  }

  .desempenho-title {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 1fr;
    gap: 8px;
    font-size: 11px;
    letter-spacing: 1.5px;
    color: var(--red);
    text-transform: uppercase;
    border-bottom: 1px solid var(--red);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 1fr;
    gap: 8px;
    font-size: 12px;
    letter-spacing: 1px;
    color: var(--dark);
    padding: 6px 0;
    border-bottom: 1px solid rgba(122,16,16,0.1);
  }

  .table-row:last-child { border-bottom: none; }

  .cell-green { color: var(--green-bright); font-weight: 700; }

  /* Botões de ação */
  .action-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .btn-action {
    border: 1.5px solid var(--red);
    border-radius: 6px;
    background: rgba(255,255,255,0.45);
    padding: 16px 10px;
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    text-align: center;
    line-height: 1.4;
  }

  .btn-action:hover {
    background: rgba(232,48,42,0.08);
    box-shadow: 0 0 0 1px var(--red-bright);
  }

  .btn-action:active { transform: scale(0.98); }

  /* Lista de turmas */
  .turmas-box {
    border: 1.5px solid var(--red);
    border-radius: 8px;
    background: rgba(255,255,255,0.45);
    padding: 14px 16px;
  }

  .turmas-title {
    font-size: 13px;
    letter-spacing: 3px;
    color: var(--red);
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .turma-item {
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(122,16,16,0.15);
  }

  .turma-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .turma-name {
    font-size: 13px;
    letter-spacing: 1.5px;
    color: var(--dark);
    margin-bottom: 3px;
  }

  .turma-alunos {
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--dark);
    margin-bottom: 3px;
  }

  .turma-aproveitamento {
    font-size: 11px;
    letter-spacing: 1.5px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .turma-aproveitamento span { font-weight: 700; }
  .pct-green  { color: var(--green-bright); }
  .pct-yellow { color: #c47a00; }
  .pct-red    { color: var(--red-bright); }

  @media (max-width: 720px) {
    .prof-body { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: 1fr; }
    .action-row { grid-template-columns: 1fr; }
  }
`;

const alunos = [
  { nome: "Ana Carvalho", partidas: 18, aproveitamento: 94, tempo: "28s" },
  { nome: "Bruno Lima",   partidas: 14, aproveitamento: 81, tempo: "34s" },
  { nome: "Carla Souza",  partidas: 20, aproveitamento: 67, tempo: "41s" },
];

const turmas = [
  { nome: "Turma A - 1º Ano", alunos: 32, aproveitamento: 78 },
  { nome: "Turma B - 1º Ano", alunos: 33, aproveitamento: 65 },
  { nome: "Turma C - 2º Ano", alunos: 33, aproveitamento: 85 },
];

function pctClass(p) {
  if (p >= 75) return "pct-green";
  if (p >= 60) return "pct-yellow";
  return "pct-red";
}

export default function DashboardProfessorPage() {
  return (
    <>
      <style>{styles}</style>

      <div className="prof-wrapper">
        <div className="prof-container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Header */}
          <div className="prof-header">
            <div className="user-info">
              <div className="avatar">PR</div>
              <span className="user-name">Prof. Rafael</span>
              <div className="role-badge">Professor</div>
            </div>
            <button className="btn-sair" onClick={() => alert("Saindo...")}>Sair</button>
          </div>

          {/* Body */}
          <div className="prof-body">

            {/* Esquerda */}
            <div className="prof-left">

              {/* Stats */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-value">34</div>
                  <div className="stat-label">Alunos Ativos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">12</div>
                  <div className="stat-label">Partidas Jogadas Hoje</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">73%</div>
                  <div className="stat-label">Média de Acertos da Turma</div>
                </div>
              </div>

              {/* Iniciar partida como host */}
              <button className="btn-host" onClick={() => alert("Iniciando partida como host...")}>
                <div className="play-icon" />
                INICIAR PARTIDA COMO HOST
              </button>

              {/* Desempenho dos alunos */}
              <div className="desempenho-box">
                <div className="desempenho-title">Desempenho dos Alunos</div>
                <div className="table-header">
                  <span>Aluno</span>
                  <span>Partidas</span>
                  <span>Aproveitamento</span>
                  <span>Tempo Médio</span>
                </div>
                {alunos.map((a) => (
                  <div className="table-row" key={a.nome}>
                    <span>{a.nome}</span>
                    <span>{a.partidas}</span>
                    <span className="cell-green">{a.aproveitamento}%</span>
                    <span>{a.tempo}</span>
                  </div>
                ))}
              </div>

              {/* Botões de ação */}
              <div className="action-row">
                <button className="btn-action" onClick={() => alert("Ver Relatórios")}>
                  VER<br/>RELATÓRIOS
                </button>
                <button className="btn-action" onClick={() => alert("Gerenciar Alunos")}>
                  GERENCIAR<br/>ALUNOS
                </button>
                <button className="btn-action" onClick={() => alert("Exportar CSV")}>
                  EXPORTAR<br/>CSV
                </button>
              </div>

            </div>

            {/* Direita: Lista de turmas */}
            <div className="turmas-box">
              <div className="turmas-title">Lista de Turmas</div>
              {turmas.map((t) => (
                <div className="turma-item" key={t.nome}>
                  <div className="turma-name">{t.nome}</div>
                  <div className="turma-alunos">{t.alunos} alunos</div>
                  <div className="turma-aproveitamento">
                    Aproveitamento: <span className={pctClass(t.aproveitamento)}>{t.aproveitamento}%</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}