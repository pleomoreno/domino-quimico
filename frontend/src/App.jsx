import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import LobbyPage from './pages/LobbyPage'
import WaitingPage from './pages/WaitingPage'
import ConfigPage from './pages/ConfigPage'
import DashboardAlunoPage from './pages/DashboardAlunoPage'
import DashboardProfPage from './pages/DashboardProfPage'
import GerenciarAlunosPage from './pages/GerenciarAlunosPage'
import RelatorioPage from './pages/RelatorioPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/config" element={<ConfigPage/>} />
        <Route path="/dashAluno" element={<DashboardAlunoPage/>} />
        <Route path="/dashProf" element={<DashboardProfPage/>} />
        <Route path="/gerenciar" element={<GerenciarAlunosPage/>} />
        <Route path="/relatorio" element={<RelatorioPage/>} />
      </Routes>
    </BrowserRouter>
  )
}