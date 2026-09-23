import { useState } from 'react'

interface Confetti {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
}

// ── Confetti burst ───────────────────────────────────────────────────────────
function ConfettiBurst() {
  const [confetti] = useState<Confetti[]>(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#ff2d78', '#000000', '#ffd700', '#ff6ba8', '#ffffff', '#ff0055'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 1.2,
      duration: Math.random() * 2 + 2,
      size: Math.random() * 10 + 5,
    }))
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 confetti-burst" aria-hidden="true">
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute"
          style={{
            left: `${c.x}%`, top: '-20px',
            width: c.size, height: c.size * 0.5,
            background: c.color, borderRadius: 2,
            animation: `confettiFall ${c.duration}s ${c.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

export default ConfettiBurst