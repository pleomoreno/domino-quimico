import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:8080';

export default function DashboardProfessorPage() {
  const navigate = useNavigate();
  const [salaCriada, setSalaCriada] = useState(null);
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const nome = localStorage.getItem('nome') || 'Professor';
  const iniciais = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  function handleSair() {
    localStorage.clear();
    navigate('/login');
  }

  async function handleCriarSala() {
    setLoadingCriar(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSalaCriada(json.data);
      } else {
        alert(json.error || 'Erro ao criar sala');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor');
    } finally {
      setLoadingCriar(false);
    }
  }

  function handleCopiarCodigo() {
    if (salaCriada?.codigo) {
      navigator.clipboard.writeText(salaCriada.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  function handleVerSala() {
    if (salaCriada?.codigo) {
      navigate(`/room/${salaCriada.codigo}`);
    }
  }

  function handleNovaSala() {
    setSalaCriada(null);
    setCopiado(false);
  }

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden font-mono text-dq-red">
      {/* grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(200,16,46,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,16,46,0.12) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }} />

      {/* cantos */}
      <Corner pos="top-3 left-3" borders="border-t-2 border-l-2" />
      <Corner pos="top-3 right-3" borders="border-t-2 border-r-2" />
      <Corner pos="bottom-3 left-3" borders="border-b-2 border-l-2" />
      <Corner pos="bottom-3 right-3" borders="border-b-2 border-r-2" />

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-dq-red text-white flex items-center px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-[11px] font-bold tracking-wider">
            {iniciais}
          </div>
          <span className="text-[12px] tracking-[2px] uppercase text-white/80">{nome}</span>
          <span className="text-[10px] tracking-[1px] uppercase text-white/50 border border-white/30 px-2 py-0.5 rounded-full">PROFESSOR</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="font-bold tracking-[4px] text-[16px]">DOMINO QUIMICO</div>
        </div>
        <button
          onClick={handleSair}
          className="ml-auto text-[11px] tracking-[2px] uppercase text-white/70 hover:text-white border border-white/30 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          Sair
        </button>
      </div>

      {/* main content */}
      <div className="relative z-10 w-full h-full pt-16 pb-6 px-6 flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-5">

          {/* Criar Sala / Sala Criada */}
          {!salaCriada ? (
            <button
              onClick={handleCriarSala}
              disabled={loadingCriar}
              className="group relative border-2 border-dq-red/40 bg-white/60 backdrop-blur-sm px-6 py-8 text-left transition-all hover:border-dq-red hover:shadow-[0_0_20px_rgba(200,16,46,0.15)] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-dq-red" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-dq-red" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-dq-red" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-dq-red" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-dq-red/10 flex items-center justify-center group-hover:bg-dq-red/20 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-dq-red" />
                  </svg>
                </div>
                <div>
                  <div className="text-[18px] font-bold tracking-[3px] text-dq-red">
                    {loadingCriar ? 'CRIANDO SALA...' : 'CRIAR SALA DE JOGO'}
                  </div>
                  <div className="text-[11px] tracking-[1px] text-dq-muted mt-1">GERAR CÓDIGO PARA OS ALUNOS ENTRAREM</div>
                </div>
              </div>
            </button>
          ) : (
            <div className="relative border-2 border-emerald-500/50 bg-emerald-500/5 backdrop-blur-sm px-6 py-6 text-center">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />

              <div className="text-[11px] tracking-[3px] text-emerald-600 font-bold mb-2">// SALA CRIADA COM SUCESSO</div>
              <div
                className="text-[42px] font-bold tracking-[10px] text-emerald-500 my-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleCopiarCodigo}
                title="Clique para copiar"
              >
                {salaCriada.codigo}
              </div>
              <div className="text-[11px] tracking-[2px] text-dq-muted mb-4">COMPARTILHE ESTE CÓDIGO COM OS ALUNOS</div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCopiarCodigo}
                  className="px-5 py-2.5 border-2 border-emerald-500 text-emerald-600 font-bold text-[12px] tracking-[2px] hover:bg-emerald-500/10 transition-colors active:scale-95"
                >
                  {copiado ? '✓ COPIADO!' : 'COPIAR CÓDIGO'}
                </button>
                <button
                  onClick={handleVerSala}
                  className="px-5 py-2.5 border-2 border-dq-red/50 text-dq-red font-bold text-[12px] tracking-[2px] hover:bg-dq-red/10 transition-colors active:scale-95"
                >
                  VER SALA
                </button>
                <button
                  onClick={handleNovaSala}
                  className="px-5 py-2.5 border-2 border-dq-red/30 text-dq-muted font-bold text-[12px] tracking-[2px] hover:bg-dq-red/5 transition-colors active:scale-95"
                >
                  NOVA SALA
                </button>
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="VER RELATÓRIOS"
              subtitle="DESEMPENHO DOS ALUNOS"
              icon="📊"
              onClick={() => navigate('/relatorio')}
            />
            <ActionCard
              title="GERENCIAR ALUNOS"
              subtitle="TURMAS E MATRÍCULAS"
              icon="👥"
              onClick={() => navigate('/gerenciar')}
            />
            <ActionCard
              title="EXPORTAR CSV"
              subtitle="DADOS DA TURMA"
              icon="📁"
              onClick={() => alert('Exportar CSV')}
            />
          </div>

          {/* Desempenhos Recentes dos Alunos (placeholder) */}
          <div className="relative border-2 border-dq-red/40 bg-white/60 backdrop-blur-sm px-6 py-5">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-dq-red" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-dq-red" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-dq-red" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-dq-red" />

            <div className="text-[11px] tracking-[3px] text-dq-muted font-bold mb-4">// ATIVIDADE RECENTE</div>

            <div className="text-center py-6">
              <div className="text-[14px] text-dq-muted tracking-[2px]">NENHUMA ATIVIDADE RECENTE</div>
              <div className="text-[11px] text-dq-muted/60 mt-2 tracking-[1px]">CRIE UMA SALA PARA COMEÇAR</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, subtitle, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative border-2 border-dq-red/30 bg-white/60 backdrop-blur-sm px-5 py-5 text-left transition-all hover:border-dq-red/60 hover:shadow-[0_0_15px_rgba(200,16,46,0.1)] active:scale-[0.98]"
    >
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-dq-red" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-dq-red" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-dq-red" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-dq-red" />
      <div className="text-[20px] mb-2">{icon}</div>
      <div className="text-[14px] font-bold tracking-[2px] text-dq-red">{title}</div>
      <div className="text-[10px] tracking-[1px] text-dq-muted mt-1">{subtitle}</div>
    </button>
  );
}

function Corner({ pos, borders }) {
  return <div className={`absolute w-5 h-5 ${pos} ${borders} border-dq-red`} />
}