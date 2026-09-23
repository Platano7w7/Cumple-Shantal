import type { ReactNode } from 'react'
import { useAnimatedOnScroll } from '../../hooks/useAnimatedOnScroll'

// ── AnimatedOnScroll wrapper ──────────────────────────────────────────────────
function AnimatedOnScroll({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
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

export default AnimatedOnScroll