import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import {
  FRIDAY_CLOSING,
  FRIDAY_NOTES,
  FRIDAY_OPENING,
  GAME_CLOSING,
  GAME_MOMENTS,
  GAME_OPENING,
  GIFT_META,
  LETTER_BLOCKS,
  LETTER_CLOSING,
  PLAYLIST,
  PLAYLIST_INTRO,
  PLAYLIST_SEARCH_HINT,
  QUIZ_QUESTIONS,
  QUIZ_RESULTS,
  QUIZ_TOTAL,
  SECRET_AVAILABLE_LABEL,
  SECRET_BANNER_SUB,
  SECRET_BANNER_TITLE,
  SECRET_ESCAPING_LABEL,
  SECRET_GIFT_MIN_SCORE,
  SECRET_PATIENCE_MSG,
  SECRET_PLACEHOLDER_BODY,
  SECRET_PLACEHOLDER_TITLE,
  SECRET_TIME_ZONE,
  SECRET_UNLOCK_HOUR,
  getGiftMeta,
} from './gift-content'
import type { GiftId, PlaylistTrack, QuizQuestion, QuizResult } from './gift-content'
import { loadSave, persistSave, clearSave } from './lib/persistence'
import type { SaveState, YoutubeVideo } from './lib/persistence'
import GiftSlot from './components/GiftSlot'
import GiftShell from './components/GiftShell'

// El contenido editable (canciones, textos, preguntas) vive en `src/gift-content.ts`.
// Los archivos de audio deben estar en `public/assets/audio/`.

// ── Progreso guardado en el navegador ─────────────────────────────────────────
const initialSave: SaveState = loadSave()

// Resuelve rutas relativas a la base del sitio (funciona con Figma Make y Vite).
function resolveAudio(file: string): string {
  if (file.startsWith('/') || /^[a-z]+:/i.test(file)) return file
  return `${import.meta.env.BASE_URL}${file}`
}

// ¿Existe el archivo de audio? Se comprueba en caliente para ocultar canciones
// que todavía no tienen su mp3 (p. ej. las canciones 4, 5 y 6).
const audioExistsCache = new Map<string, Promise<boolean>>()
function audioFileExists(file: string): Promise<boolean> {
  const url = resolveAudio(file)
  const cached = audioExistsCache.get(url)
  if (cached) return cached
  const check = fetch(url, { method: 'HEAD' })
    .then(res => res.ok)
    .catch(() => false)
  audioExistsCache.set(url, check)
  return check
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

// Baraja la caja de regalo de la intro: solo se usa internamente por GiftBox
// (componente ahora sin uso). Se mantiene el tipo para que compile sin cambios.
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
// El desplazamiento llega como variable CSS (--parallax-px, definida en el hub
// durante el scroll) para NO re-renderizar React en cada evento de scroll.
function ParallaxStarLayer({
  count, factor = -0.05, opacity = 1,
}: {
  count: number; factor?: number; opacity?: number
}) {
  const stars = useStars(count)
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 0, right: 0,
        top: '-15%', height: '130%',
        overflow: 'hidden',
        transform: `translateY(calc(var(--parallax-px, 0px) * ${factor}))`,
        transition: 'transform 0.2s ease-out',
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
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Star field (two parallax layers) ─────────────────────────────────────────
function StarField({ count = 200 }: { count?: number }) {
  return (
    <>
      <ParallaxStarLayer count={Math.floor(count * 0.6)} factor={-0.05} opacity={0.7} />
      <ParallaxStarLayer count={Math.floor(count * 0.4)} factor={-0.12} opacity={1} />
    </>
  )
}

// ── Floating particles with scroll parallax ──────────────────────────────────
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
    <button
      type="button"
      className="gift-box-btn"
      aria-label="Abrir tu regalo de cumpleaños"
      disabled={giftPhase !== 'idle'}
      onClick={giftPhase === 'idle' ? onClick : undefined}
      style={outerStyle}
    >
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
    </button>
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

// ── Music player (track info + progress + transport + volume) ───────────────
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function MusicControls({
  musicOn, onToggle, onToggleMute, volume, onVolumeChange,
  trackTitle, currentTime, duration, onSeek, onPrev, onNext,
}: {
  musicOn: boolean
  onToggle: () => void
  onToggleMute: () => void
  volume: number
  onVolumeChange: (v: number) => void
  trackTitle: string
  currentTime: number
  duration: number
  onSeek: (t: number) => void
  onPrev: () => void
  onNext: () => void
}) {
  const fill = `${Math.round(volume * 100)}%`
  const dur = Math.max(duration || 0, 0.001)
  const pos = Math.min(Math.max(currentTime || 0, 0), dur)
  const progFill = `${dur > 0.001 ? Math.min(100, (pos / dur) * 100) : 0}%`

  // Navegación por teclado cuando el foco está sobre el contenedor del
  // reproductor: espacio = play/pause, ←/→ = ±5s, ↑/↓ = volumen.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement
    if (t.closest('input, button')) return
    if (e.key === ' ') {
      e.preventDefault()
      onToggle()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onSeek(pos - 5)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onSeek(pos + 5)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      onVolumeChange(Math.min(1, Math.max(0, volume + 0.05)))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onVolumeChange(Math.min(1, Math.max(0, volume - 0.05)))
    }
  }

  return (
    <div
      className="player-pill"
      role="region"
      aria-label="Reproductor de música"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="player-info">
        <span className="player-track">🎵 {trackTitle}</span>
        <span className="player-time">
          {formatTime(pos)} / {formatTime(dur)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={dur}
        step={0.1}
        value={pos}
        onChange={e => onSeek(parseFloat(e.target.value))}
        aria-label="Progreso de la canción"
        className="player-progress"
        style={{ '--fill': progFill } as React.CSSProperties}
      />

      <div className="player-controls">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Canción anterior"
          title="Canción anterior"
          className="player-button"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={musicOn ? 'Pausar canción' : 'Reproducir canción'}
          aria-pressed={musicOn}
          title={musicOn ? 'Pausar' : 'Reproducir'}
          className="player-button player-button-main"
        >
          {musicOn ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Siguiente canción"
          title="Siguiente canción"
          className="player-button"
        >
          ⏭
        </button>

        <span className="player-sep" aria-hidden="true" />

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={volume > 0 ? 'Silenciar música' : 'Activar sonido'}
          aria-pressed={volume === 0}
          title={volume > 0 ? 'Silenciar' : 'Activar sonido'}
          className="player-button"
        >
          {volume > 0 ? '🔊' : '🔇'}
        </button>
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
    </div>
  )
}

// ── Regalo 1: Los inicios — recorrido por el comienzo de la amistad ──────────
function GiftInicios() {
  return (
    <div>
      <p className="gift-opening" style={{ animation: 'fadeInUp 0.6s 0.15s both' }}>
        {GAME_OPENING}
      </p>

      <div className="memory-timeline" aria-label="Recorrido por los inicios de la amistad">
        {GAME_MOMENTS.map((m, i) => (
          <AnimatedOnScroll key={i} delay={i * 0.08}>
            <div className="memory-entry">
              <span className="memory-dot" aria-hidden="true">
                {i + 1}
              </span>
              <MomentCard emoji={m.emoji} title={m.title} text={m.text} delay={0} />
            </div>
          </AnimatedOnScroll>
        ))}
      </div>

      <p className="gift-closing" style={{ animation: 'fadeInUp 0.7s 0.2s both' }}>
        {GAME_CLOSING}
      </p>
    </div>
  )
}

// ── Regalo 2: Los viernes — notas e intimidad de nuestro tiempo juntos ───────
function GiftViernes() {
  return (
    <div>
      <p className="gift-opening" style={{ animation: 'fadeInUp 0.6s 0.15s both' }}>
        {FRIDAY_OPENING}
      </p>

      <div className="friday-notes" aria-label="Notas de nuestros viernes">
        {FRIDAY_NOTES.map((n, i) => (
          <AnimatedOnScroll key={i} delay={i * 0.09}>
            <div className="friday-note">
              <span className="friday-note-emoji" aria-hidden="true">
                {n.emoji}
              </span>
              <div className="friday-note-body">
                <h4 className="friday-note-title">{n.title}</h4>
                <p className="friday-note-text">{n.text}</p>
                {n.sign && <p className="friday-note-sign">{n.sign}</p>}
              </div>
            </div>
          </AnimatedOnScroll>
        ))}
      </div>

      <p className="gift-closing" style={{ animation: 'fadeInUp 0.7s 0.2s both' }}>
        {FRIDAY_CLOSING}
      </p>
    </div>
  )
}

// ── Regalo 3: Playlist para Shantal — mixtape + buscador de YouTube ─────────

interface YoutubeSearchResult extends YoutubeVideo {}

// Busca canciones con la YouTube Data API v3 (la clave vive solo en el entorno).
async function searchYouTube(query: string): Promise<YoutubeSearchResult[]> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_KEY_MISSING')
  const url =
    'https://www.googleapis.com/youtube/v3/search' +
    `?part=snippet&type=video&videoEmbeddable=true&maxResults=6&q=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('YOUTUBE_FETCH_FAILED')
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string }
      snippet?: { title?: string; channelTitle?: string; thumbnails?: { medium?: { url?: string } } }
    }>
  }
  return (data.items ?? [])
    .filter(it => it.id?.videoId && it.snippet?.title)
    .map(it => ({
      videoId: it.id!.videoId!,
      title: it.snippet!.title!,
      channel: it.snippet!.channelTitle ?? '',
      thumb: it.snippet!.thumbnails?.medium?.url ?? '',
    }))
}

function GiftPlaylist({
  tracks, onPickTrack, activeTrack, isPlaying,
}: {
  tracks: PlaylistTrack[]
  onPickTrack: (i: number) => void
  activeTrack: number
  isPlaying: boolean
}) {
  const currentIsPlaying = (i: number) => i === activeTrack && isPlaying

  const [query, setQuery] = useState(initialSave.youtubeQuery)
  const [results, setResults] = useState<YoutubeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YoutubeVideo | null>(initialSave.youtubeVideo)

  const persistFind = (video: YoutubeVideo | null, q: string) => {
    persistSave({ ...loadSave(), youtubeQuery: q, youtubeVideo: video })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    try {
      const found = await searchYouTube(q)
      setResults(found)
      setSearched(true)
      persistFind(selectedVideo, q)
    } catch {
      setError(
        import.meta.env.VITE_YOUTUBE_API_KEY
          ? 'No se pudo buscar ahora. Inténtalo en un momento.'
          : 'Falta configurar VITE_YOUTUBE_API_KEY para poder buscar en YouTube.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVideo = (video: YoutubeVideo) => {
    setSelectedVideo(video)
    persistFind(video, query.trim())
  }

  const handleClearVideo = () => {
    setSelectedVideo(null)
    persistFind(null, query.trim())
  }

  return (
    <div>
      <p
        className="gift-opening"
        style={{ whiteSpace: 'pre-line', animation: 'fadeInUp 0.6s 0.15s both' }}
      >
        {PLAYLIST_INTRO.replace('{count}', String(tracks.length))}
      </p>

      <div className="gift-arrow-down" style={{ animation: 'fadeInUp 0.6s 0.25s both' }}>
        <span className="gift-arrow-icon" aria-hidden="true">👇</span>
        <span className="gift-arrow-text">{PLAYLIST_SEARCH_HINT}</span>
      </div>

      <div className="gift-divider" aria-hidden="true" />

      <h3 className="gift-section-title" style={{ animation: 'fadeInUp 0.6s 0.3s both' }}>
        ❤️ Canciones para ti
      </h3>

      <div className="mixtape-list" aria-label="Playlist de canciones elegidas para ti">
        {tracks.map((t, i) => {
          const active = i === activeTrack
          return (
            <div key={i} className={`mixtape-track${active ? ' is-active' : ''}`}>
              <span className="mixtape-badge" aria-hidden="true">
                {currentIsPlaying(i) ? (
                  <span className="mixtape-eq"><i /><i /><i /></span>
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>

              <div className="mixtape-info">
                <span className="mixtape-title">
                  {t.emoji} {t.title}
                </span>
                {t.note && <span className="mixtape-note">{t.note}</span>}
              </div>

              {currentIsPlaying(i) ? (
                <span className="mixtape-now" role="status">💖 Sonando ahora</span>
              ) : (
                <button
                  type="button"
                  className="mixtape-play"
                  onClick={() => onPickTrack(i)}
                  aria-label={`Reproducir ${t.title}`}
                  title={`Reproducir ${t.title}`}
                >
                  ▶
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="gift-divider" aria-hidden="true" />

      <h3 className="gift-section-title" style={{ animation: 'fadeInUp 0.6s 0.35s both' }}>
        🔍 Buscar cualquier canción
      </h3>

      <form className="youtube-search-form" onSubmit={handleSearch}>
        <input
          className="youtube-search-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Escribe una canción…"
          aria-label="Buscar una canción en YouTube"
        />
        <button
          type="submit"
          className="gift-cta-primary youtube-search-btn"
          disabled={loading || query.trim().length === 0}
        >
          {loading ? 'Buscando…' : '🎵 Buscar'}
        </button>
      </form>

      {error && (
        <p className="youtube-msg is-error" role="status">{error}</p>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <p className="youtube-msg" role="status">
          No encontré resultados para «{query.trim()}». Prueba con otra canción.
        </p>
      )}

      {results.length > 0 && (
        <ul className="youtube-results" aria-label="Resultados de la búsqueda">
          {results.map(video => (
            <li key={video.videoId}>
              <button
                type="button"
                className="youtube-result"
                onClick={() => handleSelectVideo(video)}
                aria-label={`Reproducir: ${video.title}`}
              >
                <img className="youtube-thumb" src={video.thumb} alt="" loading="lazy" />
                <span className="youtube-result-info">
                  <span className="youtube-result-title">{video.title}</span>
                  <span className="youtube-result-channel">{video.channel}</span>
                </span>
                <span className="youtube-result-play" aria-hidden="true">▶</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedVideo && (
        <div className="youtube-player" style={{ animation: 'fadeInUp 0.5s both' }}>
          <div className="youtube-player-head">
            <span className="youtube-player-now" role="status">
              ► Reproduciendo: {selectedVideo.title}
            </span>
            <button
              type="button"
              className="youtube-player-close"
              onClick={handleClearVideo}
              aria-label="Quitar video"
            >
              ✕
            </button>
          </div>
          <div className="youtube-player-frame">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Regalo 4: Carta de cumpleaños — el capítulo más íntimo ──────────────────
function GiftCarta() {
  const styleClass: Record<string, string> = {
    saludo: 'letter-block-saludo',
    gordo: 'letter-block-gordo',
    despedida: 'letter-block-despedida',
    sign: 'letter-block-sign',
  }

  return (
    <div>
      {LETTER_BLOCKS.map((section, s) => (
        <div
          key={s}
          className={section.style === 'gordo' ? 'letter-section letter-section-gordo' : 'letter-section'}
        >
          {section.label && (
            <div className="letter-section-label" style={{ animation: 'fadeInUp 0.5s both' }}>
              {section.label}
            </div>
          )}
          {section.paragraphs.map((p, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.1}>
              <div className={`letter-block ${styleClass[section.style] ?? ''}`.trim()}>
                {p}
              </div>
            </AnimatedOnScroll>
          ))}
        </div>
      ))}

      <div className="carta-bridge" style={{ animation: 'fadeInUp 0.8s 0.3s both' }}>
        <span className="carta-divider" aria-hidden="true">✦ ✦ ✦</span>
        <p className="carta-bridge-text">{LETTER_CLOSING}</p>
      </div>
    </div>
  )
}

// ── G5: Examen de amistad (experiencia interactiva tipo juego) ────────────────
function GiftQuiz({
  bestScore, onFinish,
}: {
  bestScore: number
  onFinish: (score: number) => void
}) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number[]>(() => Array(QUIZ_QUESTIONS.length).fill(-1))
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const firedRef = useRef(false)

  const q = QUIZ_QUESTIONS[step]
  const answered = selected[step]
  const answeredCount = selected.filter(s => s !== -1).length

  const computeScore = (sel: number[]) =>
    QUIZ_QUESTIONS.reduce(
      (acc, question, i) => (question.correct !== null && sel[i] === question.correct ? acc + question.points : acc),
      0
    )

  const handleAnswer = (opt: number) => {
    if (revealed) return
    setSelected(prev => {
      const next = [...prev]
      next[step] = opt
      return next
    })
    setRevealed(true)
  }

  const handleNext = () => {
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1)
      setRevealed(false)
    } else {
      const score = computeScore(selected)
      setFinalScore(score)
      setDone(true)
      if (!firedRef.current) {
        firedRef.current = true
        onFinish(score)
      }
    }
  }

  const handleRetry = () => {
    setStep(0)
    setSelected(Array(QUIZ_QUESTIONS.length).fill(-1))
    setRevealed(false)
    setDone(false)
    setFinalScore(0)
    firedRef.current = false
  }

  const isCorrectSel = q.correct !== null && answered === q.correct

  if (done) {
    const result: QuizResult = QUIZ_RESULTS.find(r => finalScore >= r.min) ?? QUIZ_RESULTS[QUIZ_RESULTS.length - 1]
    return (
      <div className="quiz-result" style={{ animation: 'fadeInUp 0.6s both' }}>
        <div className="quiz-score">
          <span className="quiz-score-num">{finalScore}</span>
          <span className="quiz-score-total">/ {QUIZ_TOTAL} pts</span>
        </div>
        <h3 className="quiz-result-title">{result.title}</h3>
        <p className="quiz-result-message">{result.message}</p>
        {finalScore >= SECRET_GIFT_MIN_SCORE && (
          <p className="quiz-secret-hint" style={{ animation: 'giftPopIn 0.7s 0.3s both' }}>
            🎁 Has desbloqueado un regalo secreto
          </p>
        )}
        <p className="quiz-best">
          Mejor puntaje general: {Math.max(bestScore, finalScore)}/{QUIZ_TOTAL} 🏆
        </p>
        <div className="quiz-next-row">
          <button type="button" onClick={handleRetry} className="gift-cta-ghost">
            🔄 Reintentar examen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-wrap">
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${(answeredCount / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>
      <div className="quiz-top">
        <span className="quiz-step">Pregunta {step + 1} de {QUIZ_QUESTIONS.length}</span>
        <span className="quiz-pick">{answeredCount} respondidas · {step + 1 === QUIZ_QUESTIONS.length ? 'es la última' : `faltan ${QUIZ_QUESTIONS.length - 1 - step}`}</span>
      </div>

      <div className="quiz-card">
        <p className="quiz-prompt">{q.prompt}</p>
        <div className="quiz-options">
          {q.options.map((opt, i) => {
            const chosen = answered === i
            return (
              <button
                key={i}
                type="button"
                className={[
                  'quiz-option',
                  chosen && !revealed ? 'quiz-option-chosen' : '',
                  revealed && i === q.correct ? 'quiz-option-correct' : '',
                  revealed && chosen && i !== q.correct ? 'quiz-option-wrong' : '',
                  revealed && !chosen ? 'quiz-option-dim' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {revealed && (
        <div className="quiz-feedback" style={{ animation: 'fadeInUp 0.4s both' }} role="status" aria-live="polite">
          <span className="quiz-feedback-icon">{q.correct === null ? '💬' : isCorrectSel ? '🎉' : '😅'}</span>
          <div>
            <p className="quiz-feedback-text">
              {q.options[answered]?.feedback ?? (isCorrectSel ? '¡Correcto!' : 'No era esa…')}
            </p>
            {q.correct !== null && (
              <p className="quiz-feedback-pts">
                {answered === q.correct ? `+${q.points} pts` : '0 pts'}
              </p>
            )}
          </div>
        </div>
      )}

      {revealed && (
        <div className="quiz-next-row">
          <button type="button" onClick={handleNext} className="gift-cta-ghost">
            {step === QUIZ_QUESTIONS.length - 1 ? 'Ver resultado 🧠' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Cuerpo del regalo (Fase 1: contenido de ejemplo) ─────────────────────────
function GiftPlaceholderBody({
  id, tracks, onPickTrack, activeTrack, isPlaying, quizBest, onQuizFinish,
}: {
  id: GiftId
  tracks: PlaylistTrack[]
  onPickTrack?: (i: number) => void
  activeTrack: number
  isPlaying: boolean
  quizBest: number
  onQuizFinish: (score: number) => void
}) {
  if (id === 1) {
    return <GiftInicios />
  }
  if (id === 2) {
    return <GiftViernes />
  }
  if (id === 3) {
    return (
      <GiftPlaylist
        tracks={tracks}
        onPickTrack={onPickTrack ?? (() => {})}
        activeTrack={activeTrack}
        isPlaying={isPlaying}
      />
    )
  }
  if (id === 4) {
    return <GiftCarta />
  }
  return <GiftQuiz bestScore={quizBest} onFinish={onQuizFinish} />
}

// ── Diálogo del regalo secreto con trampa de foco y cierre con Escape ────────
function SecretDialog({
  onClose,
}: {
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (panel && first) first.focus()
    return () => previous?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="secret-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Regalo secreto"
    >
      <div
        ref={panelRef}
        className="secret-card"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '88vh', overflowY: 'auto' }}
      >
        <span className="secret-card-envelope">💌</span>
        <h3 className="secret-card-title">{SECRET_PLACEHOLDER_TITLE}</h3>
        <p className="secret-card-body">{SECRET_PLACEHOLDER_BODY}</p>
        <div>
          <span className="secret-card-tag">Se desbloquea a las {SECRET_UNLOCK_HOUR}:00 (hora de Lima)</span>
        </div>
        <div className="quiz-next-row">
          <button type="button" onClick={onClose} className="gift-cta-ghost">
            Cerrar ✨
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [musicOn,     setMusicOn]     = useState(false)

  // Playlist efectiva: solo las canciones cuyo archivo de audio existe.
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(PLAYLIST.map(t => audioFileExists(t.file)))
      .then(exists => {
        if (cancelled) return
        const available = PLAYLIST.filter((_, i) => exists[i])
        setPlaylistTracks(available.length > 0 ? available : PLAYLIST)
      })
      .catch(() => {
        if (!cancelled) setPlaylistTracks(PLAYLIST)
      })
    return () => { cancelled = true }
  }, [])
  const [volume,      setVolume]      = useState(initialSave.volume)
  const [currentTrack,setCurrentTrack]= useState(initialSave.pickedTrack)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)

  // ── Progreso de los 5 regalos ──
  const [completedGifts, setCompletedGifts] = useState<Record<GiftId, boolean>>(() => {
    const base: Record<GiftId, boolean> = { 1: false, 2: false, 3: false, 4: false, 5: false }
    for (const id of initialSave.completedGifts) base[id] = true
    return base
  })
  const [openGift,       setOpenGift]       = useState<GiftId | null>(null)
  const [unlockedBanner, setUnlockedBanner] = useState<GiftId | null>(null)

  // ── Quiz + regalo secreto ──
  const [quizBest,            setQuizBest]            = useState(() => Math.max(0, Math.min(QUIZ_TOTAL, initialSave.quizBest)))
  const [secretUnlockedBanner,setSecretUnlockedBanner]= useState(false)
  const [secretBoxOpen,       setSecretBoxOpen]       = useState(false)
  const [secretEscaping,      setSecretEscaping]      = useState(false)
  const [secretAttempts,      setSecretAttempts]      = useState(0)
  const [secretPatience,      setSecretPatience]      = useState(false)
  const quizBestRef = useRef(quizBest)
  const secretUnlockedRef = useRef(quizBest >= SECRET_GIFT_MIN_SCORE)

  // Mantiene fresco el "ya pasó la hora" del regalo secreto sin recargar la página.
  const [nowTick, setNowTick] = useState<number>(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30000)
    return () => window.clearInterval(id)
  }, [])

  const audioRef        = useRef<HTMLAudioElement | null>(null)
  const volumeRef       = useRef(initialSave.volume)
  const lastVolumeRef   = useRef(initialSave.volume > 0 ? initialSave.volume : 0.3)
  const currentTrackRef = useRef(initialSave.pickedTrack)
  const hubRef          = useRef<HTMLDivElement | null>(null)
  const hasStartedMusicRef = useRef(false)
  const timersRef       = useRef<ReturnType<typeof setTimeout>[]>([])

  // Parallax por scroll sin re-renderizar React: escribe solo la variable CSS.
  const handleScroll = useCallback(() => {
    if (hubRef.current) {
      const top = hubRef.current.querySelector<HTMLElement>('.main-scroll')?.scrollTop ?? 0
      hubRef.current.style.setProperty('--parallax-px', String(top))
    }
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
    if (!audio || playlistTracks.length === 0) return
    const n = ((index % playlistTracks.length) + playlistTracks.length) % playlistTracks.length
    const track = playlistTracks[n]
    if (!track) return
    currentTrackRef.current = n
    setCurrentTrack(n)
    setCurrentTime(0)
    setDuration(0)
    audio.src = resolveAudio(track.file)
    audio.volume = volumeRef.current
    audio.play().catch(() => {})
  }, [playlistTracks])

  // Elemento de audio único: al terminar avanza a la siguiente canción y al
  // llegar a la última vuelve a la primera (loop de playlist).
  useEffect(() => {
    const audio = new Audio()
    audio.loop = false
    audio.preload = 'auto'
    audio.volume = volumeRef.current
    audioRef.current = audio

    const onEnded = () => playTrack(currentTrackRef.current + 1)
    const onTimeUpdate = () => {
      setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0)
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const onError = () => {
      const track = playlistTracks[currentTrackRef.current]
      const src = audio.currentSrc || audio.src || '(sin fuente)'
      const code = audio.error?.code ?? null
      console.error(
        `[Música] Error al cargar la canción "${track?.title ?? 'desconocida'}"` +
          `${track ? ` (${track.file})` : ''}:`,
        { url: src, errorCode: code, mediaError: audio.error?.message ?? null }
      )
    }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
      try {
        audio.removeAttribute('src')
        audio.load()
      } catch { /* noop */ }
      audioRef.current = null
    }
  }, [playTrack])

  const startMusic = useCallback(() => {
    if (!audioRef.current || playlistTracks.length === 0) return
    playTrack(0)
    setMusicOn(true)
  }, [playTrack])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio || playlistTracks.length === 0) return
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
    if (clamped > 0) lastVolumeRef.current = clamped
    if (audioRef.current) audioRef.current.volume = clamped
  }, [])

  // Silenciar / restaurar el último volumen no nulo.
  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (volumeRef.current > 0) {
      lastVolumeRef.current = volumeRef.current
      volumeRef.current = 0
      setVolume(0)
      audio.volume = 0
    } else {
      const v = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.3
      volumeRef.current = v
      setVolume(v)
      audio.volume = v
    }
  }, [])

  // Salto a un momento concreto de la canción (click en la barra).
  const seekTo = useCallback((t: number) => {
    const audio = audioRef.current
    if (!audio) return
    if (!Number.isFinite(t)) return
    const clamped = Math.max(0, t)
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  // Anterior: wrap al final de la playlist. Siguiente: wrap al inicio.
  const prevTrack = useCallback(
    () => playTrack(currentTrackRef.current - 1),
    [playTrack]
  )
  const nextTrack = useCallback(
    () => playTrack(currentTrackRef.current + 1),
    [playTrack]
  )

  useEffect(() => () => clearAllTimers(), [])

  // ── Progreso de los regalos ──
  const isUnlocked = useCallback(
    (id: GiftId) => id === 1 || completedGifts[(id - 1) as GiftId],
    [completedGifts]
  )

  const completedCount = useMemo(
    () => GIFT_META.filter(g => completedGifts[g.id]).length,
    [completedGifts]
  )

  const handleOpenGift = useCallback((id: GiftId) => {
    setOpenGift(id)
    // Inicia la música con el primer regalo abierto (antes lo hacía la intro).
    if (!hasStartedMusicRef.current) {
      hasStartedMusicRef.current = true
      startMusic()
    }
    // La playlist desbloquea el siguiente regalo con solo visitarla
    // (además del botón "Hecho ✨" en caso de querer cerrarla antes).
    if (id === 3 && !completedGifts[3]) {
      setCompletedGifts(prev => ({ ...prev, 3: true }))
      setUnlockedBanner(4)
      addTimer(() => setUnlockedBanner(null), 3600)
    }
  }, [completedGifts, startMusic])

  const handlePickTrack = useCallback((i: number) => {
    playTrack(i)
    setMusicOn(true)
  }, [playTrack])

  // Marca un regalo como completado; `unlockNext` encadena el desbloqueo
  // del siguiente regalo (el 5 es el último y no tiene siguiente).
  const markCompleted = useCallback((id: GiftId, unlockNext: boolean) => {
    setCompletedGifts(prev => ({ ...prev, [id]: true }))
    if (unlockNext) {
      const next = (id + 1) as GiftId
      if (next <= 5) {
        setUnlockedBanner(next)
        addTimer(() => setUnlockedBanner(null), 3600)
      }
    }
  }, [])

  const completeGift = useCallback((id: GiftId) => {
    setOpenGift(null)
    markCompleted(id, true)
  }, [markCompleted])

  // Al terminar el Examen de amistad: guarda el mejor puntaje, cierra el regalo 5
  // (sin desbloquear otro) y, si alcanzó el mínimo, revela la carta colgante.
  const handleQuizFinish = useCallback((score: number) => {
    const clamped = Math.max(0, Math.min(QUIZ_TOTAL, Math.floor(score)))
    setQuizBest(prev => Math.max(prev, clamped))
    const newBest = Math.max(quizBestRef.current, clamped)
    quizBestRef.current = newBest
    markCompleted(5, false)
    if (newBest >= SECRET_GIFT_MIN_SCORE && !secretUnlockedRef.current) {
      secretUnlockedRef.current = true
      setSecretUnlockedBanner(true)
      addTimer(() => setSecretUnlockedBanner(false), 4200)
    }
  }, [markCompleted])

  // Hora local (número) en la zona horaria del regalo secreto.
  const secretHourNow = useCallback((): number => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: SECRET_TIME_ZONE,
        hour: 'numeric',
        hourCycle: 'h23',
      }).formatToParts(new Date())
      const h = parts.find(p => p.type === 'hour')
      const n = h ? Number(h.value) : NaN
      return Number.isFinite(n) ? n : new Date().getHours()
    } catch {
      return new Date().getHours()
    }
  }, [])
  // La carta colgante: antes de las 8 PM se escapa y no se abre. Después de
  // varios intentos muestra el mensaje de paciencia. A partir de la hora se
  // deja atrapar y abre el regalo secreto.
  const secretOpenNow = useMemo(
    () => nowTick >= 0 && secretHourNow() >= SECRET_UNLOCK_HOUR,
    [nowTick, secretHourNow]
  )

  const handleSecretClick = useCallback(() => {
    if (secretOpenNow) {
      setSecretBoxOpen(true)
      return
    }
    setSecretEscaping(false)
    requestAnimationFrame(() => setSecretEscaping(true))
    const attempts = secretAttempts + 1
    setSecretAttempts(attempts)
    if (attempts >= 3) {
      setSecretPatience(true)
      addTimer(() => setSecretPatience(false), 4500)
    }
    addTimer(() => setSecretEscaping(false), 1100)
  }, [secretOpenNow, secretAttempts])

  const handleClearProgress = useCallback(() => {
    if (!window.confirm('¿Seguro que quieres borrar todo el progreso?')) return
    clearSave()
    setCompletedGifts({ 1: false, 2: false, 3: false, 4: false, 5: false })
    setQuizBest(0)
    quizBestRef.current = 0
    secretUnlockedRef.current = false
    setSecretUnlockedBanner(false)
    setSecretBoxOpen(false)
    setUnlockedBanner(null)
    setOpenGift(null)
  }, [])

  // ── Persistencia del progreso (con debounce) ──
  useEffect(() => {
    const save: SaveState = {
      ...loadSave(),
      version: 1,
      completedGifts: GIFT_META.filter(g => completedGifts[g.id]).map(g => g.id),
      quizBest,
      pickedTrack: currentTrack,
      volume,
    }
    const id = window.setTimeout(() => persistSave(save), 250)
    return () => window.clearTimeout(id)
  }, [completedGifts, quizBest, currentTrack, volume])

  // ── Shared background ──
  const spaceBg: React.CSSProperties = {
    background: 'radial-gradient(ellipse at 20% 50%, #1a003399 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #3300224d 0%, transparent 45%), radial-gradient(ellipse at 60% 80%, #220033aa 0%, transparent 40%), #05000d',
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HUB
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div ref={hubRef} className="relative w-full h-full overflow-hidden" style={spaceBg}>
      {/* Parallax background layers */}
      <StarField count={200} />
      <FloatingParticles />

      {/* Recuerdos flotando por el espacio (posiciones inteligentes) */}
      <FloatingMessages messages={floatingMessages} />

      {/* Banner de regalo desbloqueado */}
      {unlockedBanner !== null && (
        <div className="gift-unlock-layer" aria-live="polite">
          <ConfettiBurst />
          <div className="gift-banner" role="status">
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div className="gift-banner-title">Has desbloqueado un regalo nuevo</div>
              <div className="gift-banner-meta">
                {getGiftMeta(unlockedBanner).emoji} {getGiftMeta(unlockedBanner).title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner del regalo secreto recién desbloqueado */}
      {secretUnlockedBanner && (
        <div className="gift-unlock-layer" aria-live="polite">
          <ConfettiBurst />
          <div className="gift-banner" role="status">
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div className="gift-banner-title">{SECRET_BANNER_TITLE}</div>
              <div className="gift-banner-meta">{SECRET_BANNER_SUB}</div>
            </div>
          </div>
        </div>
      )}

      {/* Carta colgante del regalo secreto (se desbloquea con el quiz) */}
      {quizBest >= SECRET_GIFT_MIN_SCORE && (
        <div className="secret-hanger">
          <div className="secret-thread" aria-hidden="true" />
          <button
            type="button"
            aria-label="Carta colgante del regalo secreto"
            className={`secret-letter${secretEscaping ? ' escaping' : ''}`}
            style={{ '--sway': secretEscaping ? (Math.random() >= 0.5 ? 1 : -1) : 1 } as React.CSSProperties}
            onClick={handleSecretClick}
          >
            <span className="secret-seal">{secretOpenNow ? '💌' : '❓'}</span>
          </button>
          <p className="secret-hint-label">
            {secretOpenNow ? SECRET_AVAILABLE_LABEL : SECRET_ESCAPING_LABEL}
          </p>
          {secretPatience && (
            <p className="secret-patience" role="status">
              {SECRET_PATIENCE_MSG}
            </p>
          )}
        </div>
      )}

      {/* Mensaje del regalo secreto (aún pendiente de contenido final) */}
      {secretBoxOpen && (
        <SecretDialog onClose={() => setSecretBoxOpen(false)} />
      )}

      {/* Scrollable content */}
      <div
        onScroll={handleScroll}
        className="main-scroll relative z-10 h-full"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* ── Hero ── */}
        <section className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16 relative">
          <Sparkles count={10} />

          {/* Title — siempre visible, sin planeta de fondo */}
          <div className="text-center" style={{ animation: 'titleReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}>
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

          {/* ── Elige un regalo ── */}
          <div className="text-center" style={{ animation: 'fadeInUp 0.8s 0.35s both' }}>
            <h2 className="hub-heading">🎁 Elige un regalo</h2>
            <p className="hub-progress">
              Completa cada regalo para desbloquear el siguiente · {completedCount} de {GIFT_META.length}
            </p>
          </div>

          {/* ── Grid de regalos ── */}
          <div className="gifts-grid">
            {GIFT_META.map((g, i) => (
              <GiftSlot
                key={g.id}
                meta={g}
                unlocked={isUnlocked(g.id)}
                completed={completedGifts[g.id]}
                delay={0.15 + i * 0.12}
                onClick={handleOpenGift}
              />
            ))}
          </div>

          {/* ── Acciones ── */}
          <div className="hub-actions">
            <button type="button" onClick={handleClearProgress} className="gift-cta-ghost">
              🗑️ Borrar progreso
            </button>
          </div>
        </section>

        <div className="h-24" />
      </div>

      <MusicControls
        musicOn={musicOn}
        onToggle={toggleMusic}
        onToggleMute={toggleMute}
        volume={volume}
        onVolumeChange={handleVolume}
        trackTitle={playlistTracks[currentTrack]?.title ?? 'Música'}
        currentTime={currentTime}
        duration={duration}
        onSeek={seekTo}
        onPrev={prevTrack}
        onNext={nextTrack}
      />

      {openGift !== null && (
        <GiftShell
          meta={getGiftMeta(openGift)}
          completed={completedGifts[openGift]}
          completable={openGift === 5 ? quizBest > 0 : true}
          onClose={() => setOpenGift(null)}
          onComplete={() => completeGift(openGift)}
        >
          <GiftPlaceholderBody
            id={openGift}
            tracks={playlistTracks}
            onPickTrack={handlePickTrack}
            activeTrack={currentTrack}
            isPlaying={musicOn}
            quizBest={quizBest}
            onQuizFinish={handleQuizFinish}
          />
        </GiftShell>
      )}
    </div>
  )
}
