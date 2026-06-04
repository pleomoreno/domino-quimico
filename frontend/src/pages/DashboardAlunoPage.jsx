import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:8080';

export default function DashboardAlunoPage() {
  const navigate = useNavigate();
  const [codigoSala, setCodigoSala] = useState('');
  const [erroSala, setErroSala] = useState('');
  const [loadingSala, setLoadingSala] = useState(false);

  const nome = localStorage.getItem('nome') || 'Aluno';
  const iniciais = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Histórico de partidas recentes (local storage)
  const [historico] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('game_history') || '[]').slice(0, 8);
    } catch { return []; }
  });

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

          {/* Row: Partida Rápida + Entrar na Sala */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Partida Rápida */}
            <button
              onClick={handleJogar}
              className="group relative border-2 border-dq-red/40 bg-white/60 backdrop-blur-sm px-6 py-8 text-left transition-all hover:border-dq-red hover:shadow-[0_0_20px_rgba(200,16,46,0.15)] active:scale-[0.98]"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-dq-red" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-dq-red" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-dq-red" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-dq-red" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-dq-red/10 flex items-center justify-center group-hover:bg-dq-red/20 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <polygon points="5,2 18,10 5,18" fill="currentColor" className="text-dq-red" />
                  </svg>
                </div>
                <div>
                  <div className="text-[18px] font-bold tracking-[3px] text-dq-red">PARTIDA RÁPIDA</div>
                  <div className="text-[11px] tracking-[1px] text-dq-muted mt-1">JOGAR CONTRA BOTS</div>
                </div>
              </div>
            </button>

            {/* Entrar na Sala */}
            <div className="relative border-2 border-dq-red/40 bg-white/60 backdrop-blur-sm px-6 py-6">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-dq-red" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-dq-red" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-dq-red" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-dq-red" />
              <div className="text-[11px] tracking-[3px] text-dq-muted font-bold mb-4">// ENTRAR EM SALA</div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="CÓDIGO"
                  value={codigoSala}
                  onChange={e => setCodigoSala(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1 border-2 border-dq-red/30 px-4 py-3 text-[18px] text-dq-red font-bold tracking-[6px] text-center bg-white/50 outline-none focus:border-dq-red/70 transition-colors placeholder-dq-muted"
                  onKeyDown={e => e.key === 'Enter' && handleEntrarSala()}
                />
                <button
                  onClick={handleEntrarSala}
                  disabled={loadingSala}
                  className="px-5 py-3 border-2 border-dq-red text-dq-red font-bold text-[13px] tracking-[2px] hover:bg-dq-red/10 transition-colors disabled:opacity-50 active:scale-95"
                >
                  {loadingSala ? '...' : 'ENTRAR'}
                </button>
              </div>
              {erroSala && (
                <div className="mt-3 text-[11px] tracking-[1px] text-dq-red font-bold">
                  {erroSala}
                </div>
              )}
            </div>
          </div>

          {/* Desempenhos Recentes */}
          <div className="relative border-2 border-dq-red/40 bg-white/60 backdrop-blur-sm px-6 py-5">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-dq-red" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-dq-red" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-dq-red" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-dq-red" />

            <div className="text-[11px] tracking-[3px] text-dq-muted font-bold mb-4">// DESEMPENHOS RECENTES</div>

            {historico.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-[14px] text-dq-muted tracking-[2px]">NENHUMA PARTIDA REGISTRADA</div>
                <div className="text-[11px] text-dq-muted/60 mt-2 tracking-[1px]">JOGUE UMA PARTIDA RÁPIDA PARA VER SEU HISTÓRICO</div>
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {historico.map((game, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center w-16 h-16 border-2 ${
                      game.result === 'W'
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-dq-red/30 bg-dq-red/5'
                    }`}
                  >
                    <span className={`text-[22px] font-bold ${
                      game.result === 'W' ? 'text-emerald-500' : 'text-dq-red'
                    }`}>
                      {game.result}
                    </span>
                    <span className="text-[8px] text-dq-muted tracking-wider">{game.level || 'N1'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function Corner({ pos, borders }) {
  return <div className={`absolute w-5 h-5 ${pos} ${borders} border-dq-red`} />
}