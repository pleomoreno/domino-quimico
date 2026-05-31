  import { useNavigate } from 'react-router-dom'
  import logo from '/logo.png'
  import FloatingDecor from '../components/FloatingDecor'

  export default function LandingPage() {
    const navigate = useNavigate()

    return (
      <div
        className="relative w-screen h-screen bg-white overflow-hidden flex items-center justify-center cursor-pointer font-mono"
        onClick={() => navigate('/login')}
        onKeyDown={() => navigate('/login')}
        tabIndex={0}
      >
        {/* grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(200,16,46,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }} />

        {/* z-1: decorações flutuantes */}
              <FloatingDecor />

        {/* cantos */}
        <Corner pos="top-3 left-3"     borders="border-t-2 border-l-2" />
        <Corner pos="top-3 right-3"    borders="border-t-2 border-r-2" />
        <Corner pos="bottom-3 left-3"  borders="border-b-2 border-l-2" />
        <Corner pos="bottom-3 right-3" borders="border-b-2 border-r-2" />

        {/* conteúdo */}
        <div className="relative z-10 flex flex-col items-center gap-12">
          <img
            src={logo}
            alt="Dominó Químico"
            className="w-96"
            style={{
              filter: `
                drop-shadow(0 0 32px rgba(200,16,46,0.5))
                drop-shadow(0 0 64px rgba(200,16,46,0.25))
              `,
            }}
          />
          <p
            className="text-dq-red animate-pulse font-bold"
            style={{ fontSize: '20px', letterSpacing: '8px' }}
          >
            PRESSIONE QUALQUER TECLA PARA INICIAR
          </p>
        </div>

        {/* rodapé */}
        <div className="absolute bottom-0 left-1 right-0 px-5 py-2 flex justify-between text-[9px] tracking-widest text-dq-muted font-bold">
        <div className="flex justify-between w-[1998px]">
          <span className="self-end mb-3">INSTITUTO MAUÁ DE TECNOLOGIA</span>
          <img
            src="/logo_etec_pb.png"
            alt="ETEC Júlio de Mesquita"
            className="h-20 relative top-3"
          />
          </div>
        </div>
      </div>
    )
  }

  function Corner({ pos, borders }) {
    return <div className={`absolute w-5 h-5 ${pos} ${borders} border-dq-red`} />
  }