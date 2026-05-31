import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.png'
import FloatingDecor from '../components/FloatingDecor'

export default function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole]     = useState('aluno')
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden flex items-center justify-center font-mono">

      {/* z-0: grid */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(200,16,46,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,16,46,0.12) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }} />

      {/* z-1: decorações flutuantes */}
      <FloatingDecor />

      {/* z-2: cantos da tela */}
      <Corner pos="top-3 left-3"     borders="border-t-2 border-l-2" />
      <Corner pos="top-3 right-3"    borders="border-t-2 border-r-2" />
      <Corner pos="bottom-3 left-3"  borders="border-b-2 border-l-2" />
      <Corner pos="bottom-3 right-3" borders="border-b-2 border-r-2" />

      {/* sombra atrás do card */}
      <div className="absolute z-[3]" style={{
        width: 500, height: 560,
        background: 'radial-gradient(ellipse, rgba(200,16,46,0.18) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(24px)',
      }} />

      {/* z-10: card */}
      <div
        className="relative z-10 w-[460px] border-2 border-dq-red/50 px-10 py-8 flex flex-col"
        style={{
          background: 'rgba(200,16,46,0.08)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 40px rgba(200,16,46,0.2), inset 0 0 60px rgba(200,16,46,0.04)',
        }}
      >
        <Corner pos="-top-px -left-px"     borders="border-t-2 border-l-2" size="w-4 h-4" />
        <Corner pos="-top-px -right-px"    borders="border-t-2 border-r-2" size="w-4 h-4" />
        <Corner pos="-bottom-px -left-px"  borders="border-b-2 border-l-2" size="w-4 h-4" />
        <Corner pos="-bottom-px -right-px" borders="border-b-2 border-r-2" size="w-4 h-4" />

        <img src={logo} alt="logo" className="w-32 mx-auto mb-6"
          style={{ filter: 'drop-shadow(0 0 12px rgba(200,16,46,0.4))' }} />

        <p className="text-center text-[11px] tracking-[3px] text-dq-muted font-bold mb-6">
          // ACESSO AO SISTEMA
        </p>

        <div className="flex border-2 border-dq-red/40 mb-6">
          {['aluno', 'professor'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-[10px] text-[12px] tracking-[3px] uppercase font-bold transition-colors
                ${role === r ? 'bg-dq-red/15 text-dq-red' : 'text-dq-muted hover:text-dq-red/70'}
                ${r === 'professor' ? 'border-l-2 border-dq-red/40' : ''}`}>
              {r}
            </button>
          ))}
        </div>

        <Field label="E-MAIL">
          <Input type="email" placeholder="seu@email.com" />
        </Field>

        <Field label="SENHA">
          <div className="relative">
            <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" />
            <button onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] tracking-widest text-dq-muted hover:text-dq-red font-bold">
              {showPw ? 'HIDE' : 'SHOW'}
            </button>
          </div>
        </Field>

        <div className="flex justify-end mb-6 -mt-2">
          <span className="text-[9px] tracking-widest text-dq-muted hover:text-dq-red cursor-pointer font-bold">
            ESQUECI A SENHA
          </span>
        </div>

        <button onClick={() => navigate('/dashboard')}
          className="w-full py-4 border-2 border-dq-red text-dq-red font-bold text-[14px] tracking-[4px] transition-colors mb-6 hover:bg-dq-red/15"
          style={{ background: 'rgba(200,16,46,0.08)' }}>
          ▶ ENTRAR
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-dq-red/20" />
          <span className="text-[9px] tracking-widest text-dq-muted font-bold">OU</span>
          <div className="flex-1 h-px bg-dq-red/20" />
        </div>

        <p className="text-center text-[10px] tracking-[2px] text-dq-muted font-bold">
          NÃO TEM CONTA?{' '}
          <span onClick={() => navigate('/register')}
            className="text-dq-red cursor-pointer hover:underline">
            CRIAR CONTA
          </span>
        </p>
      </div>

      {/* rodapé */}
      <div className="absolute bottom-3 left-1 right-0 px-5 py-2 flex justify-between text-[9px] tracking-widest text-dq-muted font-bold">
      <div className="flex justify-between w-[1998px]">
        <span>INSTITUTO MAUÁ DE TECNOLOGIA</span>
        <span>ETEC JÚLIO DE MESQUITA · 2026</span>
        </div>
      </div>
    </div>
  )
}

function Corner({ pos, borders, size = 'w-5 h-5' }) {
  return <div className={`absolute ${size} ${pos} ${borders} border-dq-red`} />
}
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-[6px] mb-5">
      <label className="text-[10px] tracking-[3px] text-dq-muted font-bold">{label}</label>
      {children}
    </div>
  )
}
function Input({ type, placeholder }) {
  return (
    <input type={type} placeholder={placeholder}
      className="w-full border-2 border-dq-red/30 px-4 py-3 text-[13px] text-dq-red placeholder-dq-muted font-bold outline-none focus:border-dq-red/70 transition-colors"
      style={{ background: 'rgba(200,16,46,0.06)' }} />
  )
}