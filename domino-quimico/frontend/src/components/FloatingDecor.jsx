import { useEffect, useRef } from 'react'

const PIECES = [
  { top: 'HCl',      bot: 'Ácido'  },
  { top: 'Base',     bot: 'NaOH'   },
  { top: 'NaCl',     bot: 'Sal'    },
  { top: 'CO₂',      bot: 'Óxido'  },
  { top: 'H₂SO₄',   bot: 'Ácido'  },
  { top: 'Ca(OH)₂', bot: 'Base'   },
  { top: 'Sal',      bot: 'KNO₃'  },
  { top: 'Fe₂O₃',   bot: 'Óxido'  },
]

// posições fixas pra não recalcular no render
const PIECE_CONFIGS = [
  { left: '4%',  top: '12%', delay: 0,   duration: 4  },
  { left: '82%', top: '8%',  delay: 1.5, duration: 5  },
  { left: '7%',  top: '55%', delay: 3,   duration: 4.5},
  { left: '78%', top: '60%', delay: 0.8, duration: 5.5},
  { left: '88%', top: '35%', delay: 2.2, duration: 4  },
  { left: '2%',  top: '30%', delay: 4,   duration: 5  },
]


const DOT_CONFIGS = [
  { left: '15%', top: '20%', delay: 0,   size: 5, duration: 3   },
  { left: '70%', top: '15%', delay: 1,   size: 4, duration: 4   },
  { left: '30%', top: '75%', delay: 2,   size: 6, duration: 3.5 },
  { left: '85%', top: '70%', delay: 0.5, size: 4, duration: 4.5 },
  { left: '50%', top: '10%', delay: 3,   size: 3, duration: 3   },
  { left: '60%', top: '80%', delay: 1.5, size: 5, duration: 5   },
  { left: '22%', top: '45%', delay: 2.5, size: 3, duration: 3.5 },
  { left: '92%', top: '50%', delay: 0.8, size: 4, duration: 4   },
  { left: '40%', top: '88%', delay: 3.5, size: 5, duration: 4.5 },
  { left: '10%', top: '85%', delay: 1.2, size: 3, duration: 3.5 },
]

export default function FloatingDecor() {
  return (
    <>
      <style>{`
        @keyframes floatPiece {
          0%   { transform: translateY(0px) rotate(-2deg); opacity: 0.55; }
          50%  { transform: translateY(-18px) rotate(2deg); opacity: 0.75; }
          100% { transform: translateY(0px) rotate(-2deg); opacity: 0.55; }
        }
        @keyframes floatDot {
          0%   { transform: translateY(0px); opacity: 0.4; }
          50%  { transform: translateY(-10px); opacity: 0.7; }
          100% { transform: translateY(0px); opacity: 0.4; }
        }
      `}</style>

      {/* peças de dominó flutuantes */}
      {PIECE_CONFIGS.map((cfg, i) => {
        const piece = PIECES[i % PIECES.length]
        return (
          <div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{
              left: cfg.left,
              top: cfg.top,
              zIndex: 1,
              animation: `floatPiece ${cfg.duration}s ease-in-out infinite`,
              animationDelay: `${cfg.delay}s`,
            }}
          >
            <div
              className="flex flex-col font-mono font-bold border-2 border-dq-red/30 px-2 py-1 gap-1 text-center"
              style={{
                background: 'rgba(200,16,46,0.06)',
                backdropFilter: 'blur(4px)',
                minWidth: 52,
              }}
            >
              <span className="text-dq-red/50" style={{ fontSize: 8 }}>{piece.top}</span>
              <div className="w-full h-px bg-dq-red/25" />
              <span className="text-dq-red/50" style={{ fontSize: 8 }}>{piece.bot}</span>
            </div>
          </div>
        )
      })}

      {/* bolinhas flutuantes */}
      {DOT_CONFIGS.map((cfg, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: cfg.left,
            top: cfg.top,
            width: cfg.size,
            height: cfg.size,
            background: 'rgba(200,16,46,0.35)',
            boxShadow: '0 0 6px rgba(200,16,46,0.4)',
            zIndex: 1,
            animation: `floatDot ${cfg.duration}s ease-in-out infinite`,
            animationDelay: `${cfg.delay}s`,
          }}
        />
      ))}
    </>
  )
}