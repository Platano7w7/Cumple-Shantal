import { useState } from 'react'

export interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  zoomDur: number
}

// Genera un campo de estrellas estable (aleatorio solo en la primera renderización).
export function useStars(count: number): Star[] {
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