import { useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  color: string
  size: number
  delay: number
  animDur: number
}

// ── Floating particles with scroll parallax ─────────────────────────────────
function FloatingParticles() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: (Math.random() - 0.5) * 60,
      dy: (Math.random() - 0.5) * 60,
      color: ['#ff2d78', '#ff6ba8', '#ffffff', '#ffb3d1', '#ff0055'][Math.floor(Math.random() * 5)],
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      animDur: 4 + Math.random() * 4,
    }))
  )
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        transform: `translateY(calc(var(--parallax-px, 0px) * -0.08))`,
        willChange: 'transform',
        transition: 'transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            animation: `particleDrift ${p.animDur}s ${p.delay}s ease-in-out infinite alternate`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export default FloatingParticles