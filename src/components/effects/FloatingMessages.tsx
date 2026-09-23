import { useEffect, useRef, useState } from 'react'

// ── Floating memories (dynamic, smart positions) ─────────────────────────────
type ActiveMessage = {
  key: number
  idx: number
  x: number
  y: number
  dur: number
  delay: number
  lx: number
  ly: number
}

// Zonas protegidas: no pueden aparecer frases encima de estos elementos.
const PROTECTED_ZONES: { x: number; y: number; w: number; h: number }[] = [
  { x: 12, y: 8,  w: 76, h: 16 },  // título + subtítulo
  { x: 52, y: 84, w: 48, h: 15 },  // controles de música
  { x: 36, y: 2,  w: 28, h: 22 },  // carta colgante del regalo secreto
]

function isProtectedZone(x: number, y: number): boolean {
  return PROTECTED_ZONES.some(z => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h)
}

function closestMessageDistance(others: { x: number; y: number }[], x: number, y: number): number {
  let min = Infinity
  for (const o of others) {
    const d = Math.hypot(o.x - x, o.y - y)
    if (d < min) min = d
  }
  return min
}

function pickMessagePosition(others: { x: number; y: number }[], minSep = 17): { x: number; y: number } {
  for (let i = 0; i < 150; i++) {
    const x = 3 + Math.random() * 82
    const y = 2 + Math.random() * 70
    if (isProtectedZone(x, y)) continue
    if (closestMessageDistance(others, x, y) < minSep) continue
    return { x, y }
  }
  let best = { x: 4, y: 4 }
  let bestD = -1
  for (let i = 0; i < 250; i++) {
    const x = 3 + Math.random() * 82
    const y = 2 + Math.random() * 70
    if (isProtectedZone(x, y)) continue
    const d = closestMessageDistance(others, x, y)
    if (d > bestD) {
      bestD = d
      best = { x, y }
    }
  }
  return best
}

function FloatingMessages({ messages }: { messages: readonly string[] }) {
  const nextKeyRef = useRef(0)
  const [targetCount] = useState(() =>
    Math.min(
      typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 7,
      messages.length,
    )
  )

  const makeMessage = (idx: number, key: number, pos: { x: number; y: number }): ActiveMessage => ({
    key,
    idx,
    x: pos.x,
    y: pos.y,
    dur: 16 + Math.random() * 14,
    delay: -Math.random() * 16,
    lx: (Math.random() - 0.5) * 90,
    ly: -(25 + Math.random() * 70),
  })

  const [active, setActive] = useState<ActiveMessage[]>(() => {
    if (messages.length === 0) return []
    const indices = messages.map((_, i) => i).sort(() => Math.random() - 0.5)
    const out: ActiveMessage[] = []
    for (let i = 0; i < targetCount; i++) {
      const pos = pickMessagePosition(out)
      out.push(makeMessage(indices[i], nextKeyRef.current++, pos))
    }
    return out
  })

  // Reemplaza dinámicamente una frase por otra sin duplicar frases activas.
  useEffect(() => {
    if (messages.length < 2) return
    const id = window.setInterval(() => {
      setActive(prev => {
        if (prev.length === 0) return prev
        const next = [...prev]
        next.splice(Math.floor(Math.random() * next.length), 1)
        const used = new Set(next.map(m => m.idx))
        const avail = messages.map((_, i) => i).filter(i => !used.has(i))
        if (avail.length === 0) return next.length > 0 ? next : prev
        const idx = avail[Math.floor(Math.random() * avail.length)]
        const pos = pickMessagePosition(next)
        next.push(makeMessage(idx, nextKeyRef.current++, pos))
        return next
      })
    }, 3400)
    return () => window.clearInterval(id)
  }, [messages])

  if (active.length === 0) return null
  return (
    <>
      {active.map(m => (
        <div
          key={m.key}
          className="absolute pointer-events-none"
          style={{ left: `${m.x}%`, top: `${m.y}%`, zIndex: 5, maxWidth: 220 }}
        >
          <div
            className="text-center"
            style={{
              '--lx': `${m.lx}px`,
              '--ly': `${m.ly}px`,
              animation:    `recuerdoFloat ${m.dur}s ${m.delay}s ease-in-out infinite`,
              fontFamily:   "'Poppins', sans-serif",
              fontSize:     13,
              color:        '#ffb3d1',
              textShadow:   '0 0 10px #ff2d78',
              fontWeight:   300,
              lineHeight:   1.5,
            } as React.CSSProperties}
          >
            {messages[m.idx]}
          </div>
        </div>
      ))}
    </>
  )
}

export default FloatingMessages