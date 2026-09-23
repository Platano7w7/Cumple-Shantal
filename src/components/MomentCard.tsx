import { useState } from 'react'

// ── Moment card ───────────────────────────────────────────────────────────────
function MomentCard({ emoji, title, text }: { emoji: string; title: string; text: string; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-6 flex gap-4 items-start transition-all duration-500 cursor-default"
      style={{
        background: hovered
          ? 'linear-gradient(135deg, #200018ee, #100010ee)'
          : 'linear-gradient(135deg, #15000fee, #0d000bee)',
        backdropFilter: 'blur(16px)',
        border:     hovered ? '1px solid #ff2d7866' : '1px solid #ff2d7833',
        boxShadow:  hovered ? '0 0 40px #ff2d7855, inset 0 0 20px #ff2d7811' : '0 0 15px #ff2d7822',
        transform:  hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <span className="text-3xl shrink-0 mt-1">{emoji}</span>
      <div>
        <h3 style={{ fontFamily: "'Cinzel', serif", color: '#ff6ba8', fontSize: 16, fontWeight: 600, marginBottom: 6, textShadow: '0 0 10px #ff2d7888' }}>
          {title}
        </h3>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: '#e8a0c0', fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>
          {text}
        </p>
      </div>
    </div>
  )
}

export default MomentCard