import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.png'
import FloatingDecor from '../components/FloatingDecor'

const API_URL = 'http://localhost:8080'

function detectarTipo(email) {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  if (domain === 'aluno.cps.sp.gov.br') return 'ALUNO'
  if (domain === 'cps.sp.gov.br') return 'PROFESSOR'
  return null
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e?.preventDefault()
    setErro('')

    if (!email || !senha) {
      setErro('Preencha todos os campos')
      return
    }

    const tipo = detectarTipo(email)
    if (!tipo) {
      setErro('E-mail não autorizado para esta plataforma')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setErro(json.error || 'Erro ao fazer login')
        return
      }

      const { token, user_id, tipo: userTipo, nome } = json.data
      localStorage.setItem('token', token)
      localStorage.setItem('user_id', user_id)
      localStorage.setItem('tipo', userTipo)
      localStorage.setItem('nome', nome)

      if (userTipo === 'PROFESSOR') {
        navigate('/dashboard/professor')
      } else {
        navigate('/dashboard/aluno')
      }
    } catch (err) {
      setErro('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="relative w-full min-h-screen bg-white flex items-center justify-center font-mono">

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
        width: 500, height: 520,
        background: 'radial-gradient(ellipse, rgba(200,16,46,0.18) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(24px)',
      }} />

      {/* z-10: card */}
      <div
        className="relative z-10 w-full max-w-[460px] mx-4 border-2 border-dq-red/50 px-6 sm:px-10 py-8 flex flex-col"
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

        <form onSubmit={handleLogin} className="flex flex-col">
          <Field label="E-MAIL">
            <Input type="email" placeholder="seu e-mail institucional"
              value={email} onChange={e => setEmail(e.target.value)} />
          </Field>

          <Field label="SENHA">
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={senha} onChange={e => setSenha(e.target.value)} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] tracking-widest text-dq-muted hover:text-dq-red font-bold">
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </Field>

          {erro && (
            <div className="mb-4 px-3 py-2 border border-dq-red/40 text-[11px] tracking-wide text-dq-red font-bold text-center"
              style={{ background: 'rgba(200,16,46,0.08)' }}>
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 border-2 border-dq-red text-dq-red font-bold text-[14px] tracking-[4px] transition-colors mb-6 hover:bg-dq-red/15 disabled:opacity-50"
            style={{ background: 'rgba(200,16,46,0.08)' }}>
            {loading ? '⏳ ENTRANDO...' : '▶ ENTRAR'}
          </button>
        </form>

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
      <div className="absolute bottom-3 left-0 right-0 px-5 py-2 flex justify-between text-[9px] tracking-widest text-dq-muted font-bold">
        <span>INSTITUTO MAUÁ DE TECNOLOGIA</span>
        <span className="hidden sm:inline">ETEC JÚLIO DE MESQUITA · 2026</span>
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
function Input({ type, placeholder, value, onChange }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      className="w-full border-2 border-dq-red/30 px-4 py-3 text-[13px] text-dq-red placeholder-dq-muted font-bold outline-none focus:border-dq-red/70 transition-colors"
      style={{ background: 'rgba(200,16,46,0.06)' }} />
  )
}