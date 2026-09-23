import { useStars } from '../../hooks/useStars'

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

export default StarField