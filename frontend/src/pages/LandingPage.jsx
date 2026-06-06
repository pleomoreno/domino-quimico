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
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(200,16,46,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,16,46,0.12) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }} />

      <FloatingDecor />

      <Corner pos="top-3 left-3"     borders="border-t-2 border-l-2" />
      <Corner pos="top-3 right-3"    borders="border-t-2 border-r-2" />
      <Corner pos="bottom-3 left-3"  borders="border-b-2 border-l-2" />
      <Corner pos="bottom-3 right-3" borders="border-b-2 border-r-2" />

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-12 px-4 w-full">
        <img
          src={logo}
          alt="Dominó Químico"
          className="w-[80%] max-w-[384px]"
          style={{
            filter: `
              drop-shadow(0 0 32px rgba(200,16,46,0.5))
              drop-shadow(0 0 64px rgba(200,16,46,0.25))
            `,
          }}
        />
        <p
          className="text-dq-red animate-pulse font-bold text-center leading-relaxed text-[13px] sm:text-[20px] tracking-[4px] sm:tracking-[8px]"
        >
          PRESSIONE QUALQUER TECLA PARA INICIAR
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 pb-4 sm:pb-2 flex flex-col-reverse sm:flex-row items-center sm:items-end justify-center sm:justify-between gap-3 sm:gap-0 text-[9px] tracking-widest text-dq-muted font-bold">
        <span className="sm:mb-3 text-center">INSTITUTO MAUÁ DE TECNOLOGIA</span>
        <img
          src="/logo_etec_pb.png"
          alt="ETEC Júlio de Mesquita"
          className="h-12 sm:h-20 relative sm:-top-5"
        />
      </div>
    </div>
  )
}

function Corner({ pos, borders }) {
  return <div className={`absolute w-5 h-5 ${pos} ${borders} border-dq-red`} />
}