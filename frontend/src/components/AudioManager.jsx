import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function AudioManager() {
  const location = useLocation()
  const isGame = location.pathname === '/game'

  const audioRef   = useRef(null)
  const [ready,    setReady]    = useState(false)
  const [musicOn,  setMusicOn]  = useState(
    () => localStorage.getItem('dq_music') !== 'false'
  )
  const [volume, setVolume] = useState(
    () => parseFloat(localStorage.getItem('dq_volume') ?? '0.1')
  )

  useEffect(() => {
    const track = isGame ? '/audio/gm.mp3' : '/audio/bgm.mp3'

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    const audio = new Audio(track)
    audio.loop   = true
    audio.volume = volume
    audioRef.current = audio

    setReady(false)
    audio.addEventListener('canplaythrough', () => setReady(true))
    audio.addEventListener('error', () => setReady(false))

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [isGame]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (musicOn && ready) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [musicOn, ready])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    function onUpdate() {
      const newMusic = localStorage.getItem('dq_music') !== 'false'
      const newVol   = parseFloat(localStorage.getItem('dq_volume') ?? '0.1')
      setMusicOn(newMusic)
      setVolume(newVol)
    }
    window.addEventListener('dq-audio-update', onUpdate)
    return () => window.removeEventListener('dq-audio-update', onUpdate)
  }, [])

  useEffect(() => {
    function tryPlay() {
      const audio = audioRef.current
      if (!audio || !musicOn) return
      audio.play().catch(() => {})
      window.removeEventListener('click',      tryPlay)
      window.removeEventListener('keydown',    tryPlay)
      window.removeEventListener('touchstart', tryPlay)
    }
    window.addEventListener('click',      tryPlay)
    window.addEventListener('keydown',    tryPlay)
    window.addEventListener('touchstart', tryPlay)
    return () => {
      window.removeEventListener('click',      tryPlay)
      window.removeEventListener('keydown',    tryPlay)
      window.removeEventListener('touchstart', tryPlay)
    }
  }, [musicOn])

  function handleToggle() {
    const next = !musicOn
    setMusicOn(next)
    localStorage.setItem('dq_music', String(next))
    window.dispatchEvent(new CustomEvent('dq-audio-update'))
  }

  // ─── Ícone flutuante de mute ─────────────────────────────
  return (
    <button
      onClick={handleToggle}
      title={musicOn ? 'Mutar música' : 'Ligar música'}
      style={{
        position:        'fixed',
        bottom:          12,
        right:           12,
        zIndex:          9999,
        width:           36,
        height:          36,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        background:      musicOn ? 'rgba(200,16,46,0.90)' : 'rgba(80,80,80,0.80)',
        border:          '1.5px solid rgba(255,255,255,0.25)',
        borderRadius:    6,
        cursor:          'pointer',
        color:           'white',
        backdropFilter:  'blur(8px)',
        transition:      'background 0.2s',
        padding:         0,
      }}
    >
      {musicOn ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  )
}