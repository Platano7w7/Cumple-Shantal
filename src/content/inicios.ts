// ── Regalo 3: Los inicios ───────────────────────────────────────────────────
// Recorrido por el comienzo de la amistad.

export interface GameMoment { emoji: string; title: string; text: string }

export const GAME_OPENING =
  'Cada amistad tiene un punto donde todo empieza. La nuestra empezó con una partida…'

export const GAME_MOMENTS: GameMoment[] = [
  {
    emoji: '🎮',
    title: 'La primera partida',
    text: 'Todo comenzó en una partida de LoL. Desde entonces, jugar en dúo se volvió lo mejor de las rankeds.',
  },
  {
    emoji: '😂',
    title: 'Las primeras risas',
    text: 'Entre kills, throws y “casual” buenas jugadas, las risas nunca faltaron. Contigo hasta perder era divertido.',
  },
  {
    emoji: '🚀',
    title: 'Roblox y nuestras mil aventuras',
    text: 'El hospital de animales, ordenar la biblioteca, modelar en Dress To Impress… cada mundo tenía su propia historia.',
  },
  {
    emoji: '🧩',
    title: 'Subiendo de nivel',
    text: 'Empezamos con puzzles de 1000 piezas y ahora vamos por retos mucho más grandes. Como esta amistad.',
  },
  {
    emoji: '✨',
    title: 'El momento en que lo supe',
    text: 'Entre partidas y conversaciones entendí que no solo eras mi compañera de juego: eras mi mejor amiga.',
  },
]

export const GAME_CLOSING =
  'Y entre rankeds, puzzles y Roblox, descubrí la mejor parte de todo esto: tú. ❤️'

// Cierre del capítulo: prepara a Shantal para el Examen de amistad (se muestra al
// final del Regalo 3, Los inicios).
export const LETTER_CLOSING =
  'Y con esto, este capítulo queda cerrado...\nSolo falta una última cosa:\nsaber cuánto me conoces de verdad.'