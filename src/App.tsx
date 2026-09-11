import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ── Editable content ──────────────────────────────────────────────────────────
// Añade o elimina canciones aquí. Los archivos deben estar en `public/assets/audio/`.
interface PlaylistTrack { title: string; file: string }
const playlist: PlaylistTrack[] = [
  { title: "Canción 1", file: "assets/audio/cancion1.mp3" },
  { title: "Canción 2", file: "assets/audio/cancion2.mp3" },
  { title: "Canción 3", file: "assets/audio/cancion3.mp3" },
]

// Resuelve rutas relativas a la base del sitio (funciona con Figma Make y Vite).
function resolveAudio(file: string): string {
  if (file.startsWith('/') || /^[a-z]+:/i.test(file)) return file
  return `${import.meta.env.BASE_URL}${file}`
}

const floatingMessages = [
  "Feliz cumpleaños Shantal 🎂",
  "Desde que hacemos dúo en LoL las rankeds son mucho más divertidas 🎮",
  "Espero seguir rankeando contigo por mucho tiempo ✨",
  "Pasamos de puzzles de 1000 piezas...",
  "...a puzzles de 2000 o más 🧩",
  "Y que nunca falten las partidas de Roblox 🚀",
  "Gracias por todos los momentos compartidos 💖",
  "Que cumplas todos tus sueños 🦷",
  "21 años de pura dedicación y esfuerzo 💪",
  "Ojalá poder seguir molestándote por mucho tiempo 😂",
  "🏥 En Roblox te estaré esperando en el hospital de animales como tu secretario.",
  "🐭 Cuidado, matas a Ratanilo como tú dices.",
  "💃 Esperando para modelar juntos en Dress To Impress.",
  "📚 Esperándote mientras ordeno la biblioteca.",
  "✨ Siempre hay una nueva aventura esperándonos.",
  "🎮 Las rankeds siempre son más divertidas contigo.",
  "🧩 De puzzles de 1000 piezas a retos mucho más grandes.",
]

// ─────────────────────────────────────────────────────────────────────────────

type Phase     = 'intro' | 'exploding' | 'traveling' | 'main'
type GiftPhase = 'idle' | 'squish' | 'opening' | 'exploding'

interface Star     { id: number; x: number; y: number; size: number; delay: number; duration: number; zoomDur: number }
interface Particle { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number; delay: number; animDur: number }
interface Confetti { id: number; x: number; color: string; delay: number; duration: number; size: number }

// ── useStars ──────────────────────────────────────────────────────────────────
function useStars(count: number): Star[] {
  const [stars] = useState<Star[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      zoomDur: 0.45 + Math.random() * 0.55,
    }))
  )
  return stars
}

// ── useAnimatedOnScroll ───────────────────────────────────────────────────────
function useAnimatedOnScroll(threshold = 0.15) {
  const ref  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ── AnimatedOnScroll wrapper ──────────────────────────────────────────────────
function AnimatedOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useAnimatedOnScroll()
  return (
    <div
      ref={ref}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(40px)',
        transition: `opacity 0.7s ${delay}s ease, transform 0.75s ${delay}s cubic-bezier(0.34, 1.4, 0.64, 1)`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

// ── Parallax star layer ───────────────────────────────────────────────────────
function ParallaxStarLayer({
  count, zooming = false, parallaxY = 0, opacity = 1,
}: {
  count: number; zooming?: boolean; parallaxY?: number; opacity?: number
}) {
  const stars = useStars(count)
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 0, right: 0,
        top: '-15%', height: '130%',
        overflow: 'hidden',
        transform: `translateY(${parallaxY}px)`,
        willChange: 'transform',
        opacity,
      }}
    >
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            animation: zooming
              ? `travelThrough ${s.zoomDur}s forwards`
              : `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Star field (two parallax layers) ─────────────────────────────────────────
function StarField({
  count = 200, zooming = false, scrollY = 0,
}: {
  count?: number; zooming?: boolean; scrollY?: number
}) {
  return (
    <>
      <ParallaxStarLayer count={Math.floor(count * 0.6)} zooming={zooming} parallaxY={scrollY * -0.05} opacity={0.7} />
      <ParallaxStarLayer count={Math.floor(count * 0.4)} zooming={zooming} parallaxY={scrollY * -0.12} opacity={1} />
    </>
  )
}

// ── Floating particles with scroll parallax ──────────────────────────────────
function FloatingParticles({ scrollY = 0 }: { scrollY?: number }) {
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
        transform: `translateY(${scrollY * -0.08}px)`,
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

// ── Confetti burst ────────────────────────────────────────────────────────────
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
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

// ── Opening burst particles (radiate from gift center) ────────────────────────
function OpeningBurst({ active }: { active: boolean }) {
  const [bursts] = useState(() =>
    Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2
      const dist  = 70 + Math.random() * 110
      return {
        id: i,
        bx: Math.cos(angle) * dist,
        by: Math.sin(angle) * dist,
        color: ['#ff2d78', '#ff6ba8', '#ffffff', '#ffd700', '#ffb3d1'][i % 5],
        size: 5 + Math.random() * 7,
        delay: Math.random() * 0.15,
      }
    })
  )
  if (!active) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 25 }}>
      {bursts.map(b => (
        <div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: b.size, height: b.size,
            background: b.color,
            boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}88`,
            '--bx': `${b.bx}px`,
            '--by': `${b.by}px`,
            animation: `burstOut 0.7s ${b.delay}s cubic-bezier(0.2, 0, 0.8, 1) forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ── Gift Box ──────────────────────────────────────────────────────────────────
function GiftBox({ onClick, giftPhase }: { onClick: () => void; giftPhase: GiftPhase }) {
  const isOpening   = giftPhase === 'opening'
  const isExploding = giftPhase === 'exploding'

  const outerStyle: React.CSSProperties = {
    cursor: giftPhase === 'idle' ? 'pointer' : 'default',
    userSelect: 'none',
    filter: 'drop-shadow(0 0 30px #ff2d78) drop-shadow(0 0 60px #ff2d7866)',
    animation:
      giftPhase === 'squish'   ? 'squishBounce 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards' :
      giftPhase === 'exploding' ? 'giftBodyExit 0.7s ease-in forwards' :
      giftPhase === 'opening'  ? 'none' :
      'giftBounce 3s ease-in-out infinite',
    position: 'relative',
    display: 'inline-block',
  }

  // Lid group style: flies up when opening/exploding
  const lidStyle: React.CSSProperties = {
    animation: isOpening || isExploding
      ? 'lidFlyUp 0.55s cubic-bezier(0.55, 0, 1, 0.45) forwards'
      : 'none',
  }

  return (
    <div onClick={giftPhase === 'idle' ? onClick : undefined} style={outerStyle}>
      {/* Inner glow when box is open */}
      {(isOpening || isExploding) && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '50%', top: '65%',
            transform: 'translate(-50%, -50%)',
            width: 120, height: 60,
            background: 'radial-gradient(ellipse, #ff2d78ff 0%, #ff2d7888 40%, transparent 70%)',
            filter: 'blur(14px)',
            animation: 'fadeIn 0.2s ease',
            zIndex: 1,
          }}
        />
      )}

      <svg width="180" height="200" viewBox="0 0 180 200" fill="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ff2d78" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ff2d78" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#ff2d78" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* ── Body (stays put) */}
        <g>
          <rect x="20" y="88" width="140" height="90" rx="6" fill="#1a0010" stroke="#ff2d78" strokeWidth="2.5"/>
          <rect x="20" y="88" width="140" height="90" rx="6" fill="url(#boxGrad)" opacity="0.7"/>
          {/* Ribbon vertical - body portion */}
          <rect x="82" y="88" width="16" height="90" fill="#ff2d78" opacity="0.9"/>
          {/* Shine */}
          <ellipse cx="55" cy="110" rx="12" ry="5" fill="white" opacity="0.12" transform="rotate(-30 55 110)"/>
          {/* Stars decoration */}
          <text x="42" y="152" fontSize="18" fill="#ff2d78" opacity="0.8">✦</text>
          <text x="115" y="140" fontSize="14" fill="#ff6ba8" opacity="0.7">✦</text>
          {/* Inner glow when open */}
          {(isOpening || isExploding) && (
            <rect x="21" y="88" width="138" height="89" rx="5" fill="#ff2d78" opacity="0.15"/>
          )}
        </g>

        {/* ── Lid (animates up) */}
        <g style={lidStyle}>
          {/* Lid body */}
          <rect x="10" y="64" width="160" height="30" rx="6" fill="#1a0010" stroke="#ff2d78" strokeWidth="2.5"/>
          <rect x="10" y="64" width="160" height="30" rx="6" fill="url(#lidGrad)" opacity="0.8"/>
          {/* Horizontal ribbon */}
          <rect x="10" y="74" width="160" height="10" fill="#ff2d78" opacity="0.9"/>
          {/* Vertical ribbon - lid portion */}
          <rect x="82" y="64" width="16" height="30" fill="#ff2d78" opacity="0.9"/>
          {/* Bow left */}
          <ellipse cx="72" cy="60" rx="28" ry="14" fill="#ff2d78" transform="rotate(-20 72 60)"/>
          <ellipse cx="72" cy="60" rx="18" ry="8"  fill="#ff6ba8" transform="rotate(-20 72 60)"/>
          {/* Bow right */}
          <ellipse cx="108" cy="60" rx="28" ry="14" fill="#ff2d78" transform="rotate(20 108 60)"/>
          <ellipse cx="108" cy="60" rx="18" ry="8"  fill="#ff6ba8" transform="rotate(20 108 60)"/>
          {/* Bow center */}
          <circle cx="90" cy="59" r="10" fill="#ff2d78"/>
          <circle cx="90" cy="59" r="6"  fill="#ff6ba8"/>
        </g>
      </svg>
    </div>
  )
}

// ── Cloud of forming particles (stage 2 of planet birth) ─────────────────────
function CloudParticles() {
  const items = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => {
      const angle = (i / 22) * Math.PI * 2
      const dist  = 55 + Math.random() * 90
      const size  = 6 + Math.random() * 7
      return {
        id: i,
        cx: Math.cos(angle) * dist,
        cy: Math.sin(angle) * dist,
        size,
        color: ['#ff2d78', '#ff6ba8', '#ffb3d1', '#ffffff'][i % 4],
        delay: i * 0.022,
      }
    })
  , [])
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {items.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            // center in the 340×340 container, then offset by half size
            left: `calc(50% - ${p.size / 2}px)`,
            top:  `calc(50% - ${p.size / 2}px)`,
            width:  p.size,
            height: p.size,
            background: p.color,
            boxShadow:  `0 0 8px ${p.color}`,
            '--cx': `${p.cx}px`,
            '--cy': `${p.cy}px`,
            animation: `cloudParticle 0.65s ${p.delay}s ease-out both`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ── Planet birth sequence wrapper ─────────────────────────────────────────────
function PlanetReveal({ stage }: { stage: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>

      {/* Stage 1: Flash ring */}
      {stage >= 1 && (
        <div
          className="absolute rounded-full"
          style={{
            width: 100, height: 100,
            border: '4px solid #ff2d78',
            boxShadow: '0 0 40px #ff2d78, 0 0 80px #ff2d7888',
            animation: 'flashRing 0.8s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Stage 2: Cloud of forming particles */}
      {stage >= 2 && <CloudParticles />}

      {/* Stage 3+: Planet */}
      {stage >= 3 && (
        <div
          className="relative"
          style={{
            width: 280, height: 280,
            animation: 'planetScaleIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          {/* Planet sphere */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #2d0020, #0d0010 70%, #1a000f)',
              border: '2px solid #ff2d7844',
              boxShadow: '0 0 40px #ff2d7844, 0 0 80px #ff2d7822, inset 0 0 60px #ff2d7811',
              animation: 'planetPulse 4s ease-in-out infinite',
            }}
          />
          {/* Ring */}
          <div
            className="absolute"
            style={{
              left: -30, top: '50%', transform: 'translateY(-50%)',
              width: 340, height: 50,
              border: '2px solid #ff2d7855',
              borderRadius: '50%',
              boxShadow: '0 0 15px #ff2d7833',
              pointerEvents: 'none',
            }}
          />

          {/* Stage 4: Tooth glow-in */}
          {stage >= 4 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: 'toothGlowIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
            >
              <svg width="100" height="110" viewBox="0 0 100 110" fill="none">
                <path d="M50 5 C30 5, 10 20, 10 42 C10 55, 14 63, 18 70 C22 78, 26 88, 30 100 C32 106, 35 108, 38 108 C42 108, 44 104, 46 98 C48 92, 50 85, 50 85 C50 85, 52 92, 54 98 C56 104, 58 108, 62 108 C65 108, 68 106, 70 100 C74 88, 78 78, 82 70 C86 63, 90 55, 90 42 C90 20, 70 5, 50 5Z" fill="#fff" stroke="#ff2d78" strokeWidth="2"/>
                <path d="M50 5 C40 5, 25 12, 18 25" stroke="#ff6ba8" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <path d="M38 108 C36 102, 34 92, 30 80" stroke="#ffb3d1" strokeWidth="1.5" fill="none" opacity="0.5"/>
                <path d="M50 5 C30 5, 10 20, 10 42 C10 55, 14 63, 18 70 C22 78, 26 88, 30 100 C32 106, 35 108, 38 108 C42 108, 44 104, 46 98 C48 92, 50 85, 50 85 C50 85, 52 92, 54 98 C56 104, 58 108, 62 108 C65 108, 68 106, 70 100 C74 88, 78 78, 82 70 C86 63, 90 55, 90 42 C90 20, 70 5, 50 5Z" fill="none" stroke="#ff2d78" strokeWidth="5" opacity="0.35" filter="blur(3px)"/>
              </svg>
            </div>
          )}

          {/* Orbiting elements - appear with tooth */}
          {stage >= 4 && [
            { emoji: '💗', delay: '0s',   reverse: false },
            { emoji: '⭐', delay: '-2s',  reverse: false },
            { emoji: '🦷', delay: '-4s',  reverse: false },
            { emoji: '✨', delay: '-1s',  reverse: true  },
            { emoji: '💎', delay: '-3s',  reverse: true  },
          ].map((item, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: '50%', left: '50%',
                marginTop: -12, marginLeft: -12,
                width: 24, height: 24,
                fontSize: 18,
                animation: `${item.reverse ? 'orbitReverse' : 'orbit'} ${5 + i * 1.2}s ${item.delay} linear infinite`,
                filter: 'drop-shadow(0 0 6px #ff2d78)',
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sparkle decoration ────────────────────────────────────────────────────────
function Sparkles({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute text-pink-400"
          style={{
            left:     `${10 + i * 11}%`,
            top:      `${20 + (i % 3) * 30}%`,
            fontSize: `${10 + (i % 3) * 6}px`,
            animation: `sparkle ${2 + i * 0.4}s ${i * 0.3}s ease-in-out infinite`,
            filter:   'drop-shadow(0 0 4px #ff2d78)',
          }}
        >
          ✦
        </span>
      ))}
    </>
  )
}

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
  { x: 14, y: 14, w: 72, h: 42 },  // planeta + diente
  { x: 12, y: 58, w: 76, h: 20 },  // título + subtítulo
  { x: 20, y: 82, w: 56, h: 16 },  // botones (mensaje secreto / reinicio)
  { x: 52, y: 84, w: 48, h: 15 },  // controles de música
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

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ emoji, text, delay }: { emoji: string; text: string; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl border border-pink-900 p-6 text-center transition-all duration-500 cursor-default"
      style={{
        background: hovered
          ? 'linear-gradient(135deg, #1a0015ee, #0d000aee)'
          : 'linear-gradient(135deg, #12000ecc, #0a0008cc)',
        backdropFilter: 'blur(12px)',
        boxShadow: hovered
          ? '0 0 30px #ff2d7866, 0 0 60px #ff2d7833, inset 0 0 30px #ff2d7811'
          : '0 0 15px #ff2d7833, inset 0 0 15px #ff2d7808',
        transform: hovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
        animation:            `floatCard ${3 + delay * 0.5}s ${delay * 0.2}s ease-in-out infinite`,
        animationPlayState:   hovered ? 'paused' : 'running',
      }}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <p style={{ fontFamily: "'Poppins', sans-serif", color: '#ffb3d1', fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}

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

// ── Secret Letter ─────────────────────────────────────────────────────────────
function SecretLetter({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', animation: 'fadeIn 0.3s ease' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="rounded-3xl p-8 max-w-lg w-full relative"
        style={{
          background:  'linear-gradient(160deg, #1a0015, #0d000a)',
          border:      '1px solid #ff2d7866',
          boxShadow:   '0 0 60px #ff2d7855, 0 0 120px #ff2d7822',
          animation:   'letterUnfold 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          maxHeight:   '90vh',
          overflowY:   'auto',
        }}
      >
        <div className="text-center mb-6">
          <span style={{ fontSize: 40 }}>💌</span>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#ff6ba8', fontSize: 22, fontWeight: 600, textShadow: '0 0 20px #ff2d78', marginTop: 8 }}>
            Mensaje secreto
          </h2>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #ff2d7888, transparent)', margin: '12px 0' }}/>
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", color: '#e8a0c0', fontSize: 15, fontWeight: 300, lineHeight: 2, whiteSpace: 'pre-line' }}>
          {`Shantal:\n\nEspero que este cumpleaños esté lleno de momentos inolvidables.\n\nGracias por las risas, por las rankeds, por los puzzles, por Roblox y por todos los buenos momentos compartidos.\n\nMe encanta molestarte, aunque seguramente ya lo sabes.\n\nEspero seguir creando nuevos recuerdos contigo y verte cumplir todas las metas que te propongas.\n\nFeliz cumpleaños número 21.\n\n❤️`}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ff2d78, #ff0055)', color: 'white', border: 'none', boxShadow: '0 0 20px #ff2d7866', fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}
          >
            Cerrar ✨
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Music controls (button + volume slider) ──────────────────────────────────
function MusicControls({
  musicOn, onToggle, volume, onVolumeChange, trackTitle,
}: {
  musicOn: boolean
  onToggle: () => void
  volume: number
  onVolumeChange: (v: number) => void
  trackTitle: string
}) {
  const fill = `${Math.round(volume * 100)}%`
  return (
    <div className="fixed bottom-6 right-6 z-30 flex max-w-[92vw] items-center gap-2.5">
      <div className="volume-pill">
        <span className="volume-title">{trackTitle}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volumen de la música"
          className="volume-slider"
          style={{ '--fill': fill } as React.CSSProperties}
        />
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={musicOn ? 'Silenciar música' : 'Reproducir música'}
        aria-pressed={musicOn}
        className="rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0 transition-all duration-300 hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #ff2d78, #ff0055)', boxShadow: '0 0 20px #ff2d7866', border: 'none', cursor: 'pointer' }}
      >
        {musicOn ? '🔊' : '🔇'}
      </button>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,       setPhase]       = useState<Phase>('intro')
  const [giftPhase,   setGiftPhase]   = useState<GiftPhase>('idle')
  const [planetStage, setPlanetStage] = useState(0)
  const [secretOpen,  setSecretOpen]  = useState(false)
  const [musicOn,     setMusicOn]     = useState(false)
  const [volume,      setVolume]      = useState(0.3)
  const [currentTrack,setCurrentTrack]= useState(0)
  const [scrollY,     setScrollY]     = useState(0)

  const audioRef        = useRef<HTMLAudioElement | null>(null)
  const volumeRef       = useRef(0.3)
  const currentTrackRef = useRef(0)
  const scrollRef       = useRef<HTMLDivElement>(null)
  const timersRef       = useRef<ReturnType<typeof setTimeout>[]>([])

  // Scroll tracking for parallax
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrollY(scrollRef.current.scrollTop)
  }, [])

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  // ── Playlist helpers ──
  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current
    if (!audio || playlist.length === 0) return
    const n = ((index % playlist.length) + playlist.length) % playlist.length
    const track = playlist[n]
    if (!track) return
    currentTrackRef.current = n
    setCurrentTrack(n)
    audio.src = resolveAudio(track.file)
    audio.volume = volumeRef.current
    audio.play().catch(() => {})
  }, [])

  // Unicelta el audio dentro del gesto del usuario (clic en el regalo): precarga
  // y silencia la primera canción para que luego pueda sonar sin ser bloqueada.
  const unlockAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || playlist.length === 0 || audio.getAttribute('src')) return
    const track = playlist[currentTrackRef.current] ?? playlist[0]
    audio.src = resolveAudio(track.file)
    audio.volume = volumeRef.current
    audio.play().then(() => audio.pause()).catch(() => {})
  }, [])

  // Elemento de audio único: al terminar avanza a la siguiente canción y al
  // llegar a la última vuelve a la primera (loop de playlist).
  useEffect(() => {
    const audio = new Audio()
    audio.loop = false
    audio.preload = 'auto'
    audio.volume = volumeRef.current
    audioRef.current = audio

    const onEnded = () => playTrack(currentTrackRef.current + 1)
    const onError = () => {
      const track = playlist[currentTrackRef.current]
      const src = audio.currentSrc || audio.src || '(sin fuente)'
      const code = audio.error?.code ?? null
      console.error(
        `[Música] Error al cargar la canción "${track?.title ?? 'desconocida'}"` +
          `${track ? ` (${track.file})` : ''}:`,
        { url: src, errorCode: code, mediaError: audio.error?.message ?? null }
      )
    }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      try {
        audio.removeAttribute('src')
        audio.load()
      } catch { /* noop */ }
      audioRef.current = null
    }
  }, [playTrack])

  const startMusic = useCallback(() => {
    if (!audioRef.current || playlist.length === 0) return
    playTrack(0)
    setMusicOn(true)
  }, [playTrack])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio || playlist.length === 0) return
    if (musicOn) {
      audio.pause()
      setMusicOn(false)
    } else {
      if (!audio.getAttribute('src')) {
        playTrack(currentTrackRef.current)
      } else {
        audio.volume = volumeRef.current
        audio.play().catch(() => {})
      }
      setMusicOn(true)
    }
  }, [musicOn, playTrack])

  const handleVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    volumeRef.current = clamped
    setVolume(clamped)
    if (audioRef.current) audioRef.current.volume = clamped
  }, [])

  // ── Gift click sequence ──
  const handleGiftClick = useCallback(() => {
    if (giftPhase !== 'idle') return
    clearAllTimers()
    unlockAudio() // desbloquea el audio dentro del gesto del usuario

    // 1. Squish
    setGiftPhase('squish')

    // 2. Lid opens
    addTimer(() => setGiftPhase('opening'), 320)

    // 3. Body explodes
    addTimer(() => setGiftPhase('exploding'), 900)

    // 4. Switch to "exploding" phase for full-screen confetti
    addTimer(() => setPhase('exploding'), 1100)

    // 5. Travel through space
    addTimer(() => setPhase('traveling'), 2000)

    // 6. Main scene arrives — start music + planet birth sequence
    addTimer(() => {
      setPhase('main')
      startMusic()
      setPlanetStage(1)                               // flash ring
    }, 3200)
    addTimer(() => setPlanetStage(2), 3200 + 500)    // particle cloud
    addTimer(() => setPlanetStage(3), 3200 + 1000)   // planet scales in
    addTimer(() => setPlanetStage(4), 3200 + 1700)   // tooth + orbits
    addTimer(() => setPlanetStage(5), 3200 + 2500)   // title

  }, [giftPhase, startMusic, unlockAudio])

  // ── Restart ──
  const handleRestart = useCallback(() => {
    clearAllTimers()
    setPhase('intro')
    setGiftPhase('idle')
    setPlanetStage(0)
    setSecretOpen(false)
    setScrollY(0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0

    // Música: detener y volver a la primera canción. El volumen se conserva.
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      try {
        audio.removeAttribute('src')
        audio.load()
      } catch { /* noop */ }
    }
    setMusicOn(false)
    currentTrackRef.current = 0
    setCurrentTrack(0)
  }, [])

  useEffect(() => () => clearAllTimers(), [])

  // ── Shared background ──
  const spaceBg: React.CSSProperties = {
    background: 'radial-gradient(ellipse at 20% 50%, #1a003399 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #3300224d 0%, transparent 45%), radial-gradient(ellipse at 60% 80%, #220033aa 0%, transparent 40%), #05000d',
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INTRO
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={spaceBg}>
        <StarField count={200} scrollY={0} />
        <FloatingParticles />
        <Sparkles count={10} />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div style={{ position: 'relative' }}>
            <GiftBox onClick={handleGiftClick} giftPhase={giftPhase} />
            <OpeningBurst active={giftPhase === 'opening'} />
          </div>
          <p
            className="text-center"
            style={{
              fontFamily:    "'Poppins', sans-serif",
              color:         '#ffb3d1',
              fontSize:      16,
              fontWeight:    300,
              textShadow:    '0 0 10px #ff2d78',
              letterSpacing: '0.08em',
              animation:     'fadeIn 2s 0.8s both',
              opacity:       giftPhase !== 'idle' ? 0 : undefined,
              transition:    'opacity 0.3s ease',
            }}
          >
            Presiona para abrir tu regalo 🎁
          </p>
        </div>

        <MusicControls
          musicOn={musicOn}
          onToggle={toggleMusic}
          volume={volume}
          onVolumeChange={handleVolume}
          trackTitle={playlist[currentTrack]?.title ?? 'Música'}
        />
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EXPLODING
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'exploding') {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={spaceBg}>
        <StarField count={200} />
        <ConfettiBurst />
        <FloatingParticles />
        <p
          className="absolute"
          style={{
            fontFamily: "'Cinzel', serif",
            color:      '#ff6ba8',
            fontSize:   'clamp(22px, 5vw, 36px)',
            fontWeight: 600,
            textShadow: '0 0 30px #ff2d78',
            animation:  'fadeInUp 0.6s 0.2s both',
          }}
        >
          ✨ Feliz Cumpleaños ✨
        </p>
        <MusicControls
          musicOn={musicOn}
          onToggle={toggleMusic}
          volume={volume}
          onVolumeChange={handleVolume}
          trackTitle={playlist[currentTrack]?.title ?? 'Música'}
        />
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TRAVELING
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'traveling') {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={spaceBg}>
        <StarField count={300} zooming />
        <ConfettiBurst />
        <div className="absolute flex flex-col items-center gap-4" style={{ animation: 'fadeInUp 0.8s 0.1s both' }}>
          <div style={{ fontSize: 80, filter: 'drop-shadow(0 0 30px #ff2d78)', animation: 'float 2s ease-in-out infinite' }}>
            🌍
          </div>
          <p style={{ fontFamily: "'Cinzel', serif", color: '#ff6ba8', fontSize: 20, textShadow: '0 0 20px #ff2d78', animation: 'glowText 2s ease-in-out infinite' }}>
            Viajando a tu mundo especial…
          </p>
        </div>
        <MusicControls
          musicOn={musicOn}
          onToggle={toggleMusic}
          volume={volume}
          onVolumeChange={handleVolume}
          trackTitle={playlist[currentTrack]?.title ?? 'Música'}
        />
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full h-full overflow-hidden" style={spaceBg}>
      {/* Parallax background layers */}
      <StarField count={200} scrollY={scrollY} />
      <FloatingParticles scrollY={scrollY} />

      {/* Recuerdos flotando por el espacio (posiciones inteligentes) */}
      <FloatingMessages messages={floatingMessages} />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="main-scroll relative z-10 h-full"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* ── Hero ── */}
        <section className="min-h-screen flex flex-col items-center justify-center gap-12 px-6 py-20 relative">
          <Sparkles count={12} />

          {/* Planet birth sequence */}
          <PlanetReveal stage={planetStage} />

          {/* Title — only visible at stage 5 */}
          <div
            className="text-center"
            style={{
              opacity:    planetStage >= 5 ? 1 : 0,
              transition: 'none',
              animation:  planetStage >= 5 ? 'titleReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' : 'none',
            }}
          >
            <h1
              style={{
                fontFamily:            "'Cinzel', serif",
                fontWeight:            900,
                fontSize:              'clamp(28px, 6vw, 54px)',
                background:            'linear-gradient(135deg, #ffffff, #ff6ba8, #ff2d78, #ffffff)',
                backgroundSize:        '200% auto',
                WebkitBackgroundClip:  'text',
                WebkitTextFillColor:   'transparent',
                animation:             'shimmer 4s linear infinite',
                lineHeight:            1.2,
                marginBottom:          16,
              }}
            >
              Feliz Cumpleaños Shantal 🎂✨
            </h1>
            <p
              style={{
                fontFamily:    "'Poppins', sans-serif",
                color:         '#e8a0c0',
                fontSize:      'clamp(14px, 2.5vw, 18px)',
                fontWeight:    300,
                letterSpacing: '0.04em',
                textShadow:    '0 0 15px #ff2d7866',
                animation:     'subtitleReveal 0.8s 0.5s both',
              }}
            >
              21 años llenos de esfuerzo, dedicación y sueños por cumplir.
            </p>
          </div>
        </section>

        {/* ── Sobre Shantal ── */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <AnimatedOnScroll>
            <h2
              className="text-center mb-12"
              style={{
                fontFamily: "'Cinzel', serif",
                color:      '#ff6ba8',
                fontSize:   'clamp(20px, 4vw, 32px)',
                fontWeight: 600,
                textShadow: '0 0 20px #ff2d7888',
                animation:  'glowText 3s ease-in-out infinite',
              }}
            >
              ✦ Sobre Shantal ✦
            </h2>
          </AnimatedOnScroll>

          <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { emoji: '🦷', text: 'La futura odontóloga más dedicada.',                    delay: 0 },
              { emoji: '📚', text: 'Siempre esforzándose para lograr sus metas.',            delay: 0.1 },
              { emoji: '🐱', text: 'Amante de los gatos y orgullosa integrante del equipo de todos los gatos que viven en su casa.', delay: 0.2 },
              { emoji: '😂', text: 'Y la persona que más disfruto molestar.',                delay: 0.3 },
              { emoji: '✨', text: 'Una persona única que merece un cumpleaños increíble.',  delay: 0.4 },
            ].map((c, i) => (
              <AnimatedOnScroll key={i} delay={c.delay}>
                <Card {...c} />
              </AnimatedOnScroll>
            ))}
          </div>
        </section>

        {/* ── Momentos especiales ── */}
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <AnimatedOnScroll>
            <h2
              className="text-center mb-12"
              style={{
                fontFamily: "'Cinzel', serif",
                color:      '#ff6ba8',
                fontSize:   'clamp(20px, 4vw, 32px)',
                fontWeight: 600,
                textShadow: '0 0 20px #ff2d7888',
              }}
            >
              ✦ Momentos especiales ✦
            </h2>
          </AnimatedOnScroll>

          <div className="flex flex-col gap-4">
            {[
              { emoji: '🎮', title: 'League of Legends', text: 'Desde que hacemos dúo las rankeds son mucho más divertidas.',      delay: 0 },
              { emoji: '🧩', title: 'Puzzles',            text: 'Ya no son puzzles de 1000 piezas, ahora vamos por 2000 o más.',    delay: 0.12 },
              { emoji: '🚀', title: 'Roblox',             text: 'Hospital de animales, bibliotecas, Dress To Impress y muchas aventuras más.', delay: 0.24 },
              { emoji: '🦷', title: 'Odontología',        text: 'Cada esfuerzo te acerca más a tus sueños.',                        delay: 0.36 },
            ].map((m, i) => (
              <AnimatedOnScroll key={i} delay={m.delay}>
                <MomentCard {...m} />
              </AnimatedOnScroll>
            ))}
          </div>
        </section>

        {/* ── Secret message + restart ── */}
        <section className="py-16 flex flex-col items-center gap-8 px-6">
          <AnimatedOnScroll>
            <button
              onClick={() => setSecretOpen(true)}
              className="px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                background:    'linear-gradient(135deg, #ff2d78, #ff0055, #cc0044)',
                color:         'white',
                border:        '1px solid #ff6ba8',
                boxShadow:     '0 0 30px #ff2d7866, 0 0 60px #ff2d7833',
                fontFamily:    "'Poppins', sans-serif",
                fontWeight:    500,
                cursor:        'pointer',
                animation:     'pulse-glow 3s ease-in-out infinite',
                letterSpacing: '0.04em',
              }}
            >
              Ver mensaje secreto ❤️
            </button>
          </AnimatedOnScroll>

          <AnimatedOnScroll delay={0.15}>
            <button
              onClick={handleRestart}
              className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
              style={{
                background:    'transparent',
                color:         '#ff6ba8',
                border:        '1px solid #ff2d7866',
                boxShadow:     '0 0 15px #ff2d7833',
                fontFamily:    "'Poppins', sans-serif",
                cursor:        'pointer',
                letterSpacing: '0.06em',
              }}
            >
              🎁 Abrir regalo nuevamente
            </button>
          </AnimatedOnScroll>
        </section>

        <div className="h-24" />
      </div>

      <MusicControls
        musicOn={musicOn}
        onToggle={toggleMusic}
        volume={volume}
        onVolumeChange={handleVolume}
        trackTitle={playlist[currentTrack]?.title ?? 'Música'}
      />
      {secretOpen && <SecretLetter onClose={() => setSecretOpen(false)} />}
    </div>
  )
}
