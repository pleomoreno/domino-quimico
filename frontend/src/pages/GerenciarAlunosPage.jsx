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
    --display: 'Teko', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .gerenciar-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff0f0;
    padding: 20px;
    font-family: var(--mono);
  }

  .gerenciar-container {
    width: 100%;
    max-width: 860px;
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
  .gerenciar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
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

  /* Table header */
  .table-header {
    display: grid;
    grid-template-columns: 1.5fr 1.2fr 1fr;
    gap: 8px;
    padding: 0 16px 10px;
    font-size: 11px;
    letter-spacing: 2.5px;
    color: var(--dark);
    text-transform: uppercase;
  }

  /* Aluno rows */
  .alunos-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .aluno-card {
    display: grid;
    grid-template-columns: 2fr 1.2fr 1fr;
    align-items: center;
    gap: 8px;
    border: 1.5px solid var(--red-light);
    border-radius: 6px;
    background: var(--red-pale);
    padding: 16px 16px;
    animation: slideIn 0.3s ease both;
    transition: border-color 0.2s;
  }

  .aluno-card:hover { border-color: var(--red); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .aluno-nome {
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 2px;
    color: var(--dark);
    text-transform: uppercase;
  }

  .aluno-vitoria {
    font-family: var(--mono);
    font-size: 14px;
    letter-spacing: 1px;
    color: var(--dark);
  }

  .btn-excluir {
    border: 1.5px solid var(--red);
    background: var(--white);
    padding: 8px 16px;
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
    justify-self: end;
    min-width: 100px;
    text-align: center;
  }

  .btn-excluir:hover {
    background: var(--red);
    color: white;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--red-light);
    text-transform: uppercase;
  }

  @media (max-width: 560px) {
    .aluno-card { grid-template-columns: 1fr 1fr; }
    .aluno-nome { grid-column: 1 / -1; }
    .table-header { display: none; }
  }
`;

const alunosIniciais = [
  { id: 1, nome: "GABRIEL - TURMA A", vitoria: 60 },
  { id: 2, nome: "MARIA - TURMA A",   vitoria: 40 },
  { id: 3, nome: "LUCAS - TURMA A",   vitoria: 58 },
  { id: 4, nome: "ANA - TURMA C",     vitoria: 85 },
  { id: 5, nome: "HEITOR - TURMA B",  vitoria: 37 },
];

export default function GerenciarAlunosPage() {
  const [alunos, setAlunos] = useState(alunosIniciais);

  function handleExcluir(id) {
    const aluno = alunos.find(a => a.id === id);
    if (window.confirm(`Excluir ${aluno.nome}?`)) {
      setAlunos(prev => prev.filter(a => a.id !== id));
    }
  }

  function handleSair() {
    alert("Saindo...");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="gerenciar-wrapper">
        <div className="gerenciar-container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Header */}
          <div className="gerenciar-header">
            <div className="header-left">
              <div className="logo-badge">
                <img src="/logo.png" alt="Logo" width="32" height="32" style={{ objectFit: "contain" }} />
              </div>
              <div className="page-title"><span>// </span>GERENCIAR ALUNOS</div>
            </div>
            <button className="btn-sair" onClick={handleSair}>SAIR</button>
          </div>

          {/* Table header */}
          <div className="table-header">
            <span>ALUNOS</span>
            <span>VITÓRIA / PARTIDA</span>
            <span></span>
          </div>

          {/* Lista */}
          <div className="alunos-list">
            {alunos.length === 0 && (
              <div className="empty-state">Nenhum aluno cadastrado</div>
            )}
            {alunos.map((aluno, i) => (
              <div
                className="aluno-card"
                key={aluno.id}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="aluno-nome">{aluno.nome}</div>
                <div className="aluno-vitoria">{aluno.vitoria}%</div>
                <button
                  className="btn-excluir"
                  onClick={() => handleExcluir(aluno.id)}
                >
                  EXCLUIR
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}