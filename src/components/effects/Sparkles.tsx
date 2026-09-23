// ── Sparkle decoration ───────────────────────────────────────────────────────
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

export default Sparkles