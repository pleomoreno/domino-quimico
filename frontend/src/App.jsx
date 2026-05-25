import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import LobbyPage from './pages/LobbyPage'
import WaitingPage from './pages/WaitingPage'

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
      </Routes>
    </BrowserRouter>
  )
}