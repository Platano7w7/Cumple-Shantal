// ── Catálogo de regalos del hub ────────────────────────────────────────────
// El orden de esta lista define el desbloqueo secuencial (Regalo 1 → 2 → 3 → 4).

export type GiftId = 1 | 2 | 3 | 4

export interface GiftMeta {
  id: GiftId
  emoji: string
  title: string
  tagline: string
}

export const GIFT_META: GiftMeta[] = [
  { id: 1, emoji: '🎵', title: 'Playlist para Shantal', tagline: 'Elige la canción o déjala fluir.' },
  { id: 2, emoji: '📒', title: 'Los viernes', tagline: 'Notas y polaroids de nuestros viernes.' },
  { id: 3, emoji: '🎮', title: 'Los inicios', tagline: 'Momentos jugando: cómo empezó la amistad.' },
  { id: 4, emoji: '🧠', title: 'Examen de amistad', tagline: '5 preguntas · 25 puntos. ¿Cuánto me conoces?' },
]

export function getGiftMeta(id: GiftId): GiftMeta {
  return GIFT_META.find(m => m.id === id) ?? GIFT_META[0]
}