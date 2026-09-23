// ── Regalo 2: Los viernes ───────────────────────────────────────────────────
// Notas y recuerdos de los viernes compartidos.

export interface FridayNote { emoji: string; title: string; text: string; sign?: string }

export const FRIDAY_OPENING =
  'Los viernes eran sagrados. Nuestro pequeño refugio de la semana.'

export const FRIDAY_NOTES: FridayNote[] = [
  {
    emoji: '📅',
    title: 'El plan perfecto',
    text: 'Solo vernos y ponernos al día. Era simple, pero era exactamente lo que esperaba toda la semana.',
  },
  {
    emoji: '💬',
    title: 'Conversaciones que no terminaban',
    text: 'Hablamos de nuestros días, de nuestros planes, de esa persona que nos hacía enojar… y se nos iban las horas.',
    sign: '— y no queríamos que acabara',
  },
  {
    emoji: '☕',
    title: 'El tiempo compartido',
    text: 'Un poco de música, muchas risas y mucho tiempo juntos. No necesitábamos nada más para ser felices.',
  },
  {
    emoji: '📚',
    title: 'Verte cumplir tus sueños',
    text: 'Cada viernes me contabas algo de tu esfuerzo. Me encanta verte perseguir lo que tanto quieres lograr.',
  },
  {
    emoji: '🤝',
    title: 'Lo que se cimentó en los viernes',
    text: 'Sin darnos cuenta, esos viernes se volvieron el cimiento de nuestra amistad.',
  },
]

export const FRIDAY_CLOSING =
  'Nada hubiera sido igual sin nuestros viernes. Gracias por ser parte de cada uno. ✨'