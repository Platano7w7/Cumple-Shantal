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
  { id: 1, emoji: '🎵', title: 'Playlist para ti p causa', tagline: 'Elige la canción o buscala tu mismo.' },
  { id: 2, emoji: '📒', title: 'Los viernes de chismesito', tagline: 'Notas y polaroids de nuestros viernes.' },
  { id: 3, emoji: '🎮', title: 'El inicio del besto duo del mundo', tagline: 'Momentos en la grieta o en roblox.' },
  { id: 4, emoji: '🧠', title: 'Haber otro examen jiji', tagline: '5 preguntas · 20 puntos. ¿haber si es cierto que somos amigos?' },
]

export function getGiftMeta(id: GiftId): GiftMeta {
  return GIFT_META.find(m => m.id === id) ?? GIFT_META[0]
}