// ── Contenido de la experiencia (editable) ──────────────────────────────────
// Este archivo es el único lugar donde editar textos, canciones y preguntas.

export type GiftId = 1 | 2 | 3 | 4 | 5

export interface GiftMeta {
  id: GiftId
  emoji: string
  title: string
  tagline: string
}

export const GIFT_META: GiftMeta[] = [
  { id: 3, emoji: '🎵', title: 'Playlist para Shantal', tagline: 'Elige la canción o déjala fluir.' },
  { id: 2, emoji: '📒', title: 'Los viernes', tagline: 'Notas y polaroids de nuestros viernes.' },
  { id: 1, emoji: '🎮', title: 'Los inicios', tagline: 'Momentos jugando: cómo empezó la amistad.' },
  { id: 4, emoji: '💌', title: 'Carta de cumpleaños', tagline: 'Una carta muy especial para ti.' },
  { id: 5, emoji: '🧠', title: 'Examen de amistad', tagline: '5 preguntas · 20 puntos. ¿Cuánto me conoces?' },
]

export function getGiftMeta(id: GiftId): GiftMeta {
  return GIFT_META.find(m => m.id === id) ?? GIFT_META[0]
}

// ── G1: Los inicios (el comienzo de la amistad) ──────────────────────────────
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

// ── G2: Los viernes (notas y tiempo compartido) ─────────────────────────────
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

// ── G3: Playlist (mixtape) ───────────────────────────────────────────────────
// Añade o elimina canciones aquí. Deja el índice en orden cronológico y
// agrega un `note` (opcional) con un mensajito para cada canción.
export interface PlaylistTrack { title: string; file: string; emoji?: string; note?: string }
// Mensaje de bienvenida del Regalo 3 (los saltos de línea se respetan).
export const PLAYLIST_INTRO =
  'Mira ✨\n' +
  'Aquí están tus {count} canciones favoritas que elegí para ti ❤️\n' +
  '\n' +
  'Pero si quieres escuchar cualquier otra canción,\n' +
  'también puedes buscarla aquí.'
export const PLAYLIST_SEARCH_HINT = 'Busca aquí'
export const PLAYLIST: PlaylistTrack[] = [
  {
    title: 'Busy Woman',
    file: 'assets/audio/cancion1.mp3',
  },
  {
    title: 'We Found Love',
    file: 'assets/audio/cancion2.mp3',
  },
  {
    title: "You Don't Own Me",
    file: 'assets/audio/cancion3.mp3',
  },
  {
    title: 'It Must Have Been Love',
    file: 'assets/audio/cancion4.mp3',
  },
  {
    title: 'Open Arms',
    file: 'assets/audio/cancion5.mp3',
  },
  {
    title: 'My One And Only love',
    file: 'assets/audio/cancion6.mp3',
  },
]

// ── G4: Carta de cumpleaños ──────────────────────────────────────────────────
// La carta está diseñada como bloques INDEPENDIENTES de contenido para poder
// editar cada sección sin tocar el código ni el resto del texto.
//
// Estructura de cada bloque:
//   label?       -> etiqueta opcional que se muestra como encabezado
//   paragraphs[] -> párrafos del bloque (cada uno se muestra por separado)
//   style        -> 'saludo' | 'principal' | 'gordo' | 'final' | 'despedida' | 'sign'
//
// Reemplaza el TEXTO de cada bloque (nunca lo simplifiques ni lo borres):
//   - saludo      → "Shantal:"
//   - principal   → párrafos principales de la carta
//   - gordo       → MENSaje COMPLETO de Gordo Lui (independiente)
//   - final       → mensaje final de Danilo
//   - despedida   → cierre de la carta
//   - sign        → la firma con emoji
export type LetterBlockStyle = 'saludo' | 'principal' | 'gordo' | 'final' | 'despedida' | 'sign'
export interface LetterBlock {
  label?: string
  paragraphs: string[]
  style: LetterBlockStyle
}

export const LETTER_BLOCKS: LetterBlock[] = [
  // ── Saludo ──
  {
    style: 'saludo',
    paragraphs: ['Shantal:'],
  },
  // ── Mensaje principal ──
  {
    style: 'principal',
    paragraphs: [
      'Espero que este cumpleaños esté lleno de momentos inolvidables.',
      'Gracias por las risas, por las rankeds, por los puzzles, por Roblox y por todos los buenos momentos compartidos.',
    ],
  },
  // ── Mensaje de Gordo Lui (bloque independiente: no simplificar) ──
  {
    label: '💬 Mensaje de Gordo Lui',
    style: 'gordo',
    paragraphs: [
      'Aquí irá el mensaje completo de Gordo Lui. (Texto definitivo pendiente de reemplazo.)',
    ],
  },
  // ── Mensaje final de Danilo ──
  {
    style: 'final',
    paragraphs: [
      'Me encanta molestarte, aunque seguramente ya lo sabes.',
      'Espero seguir creando nuevos recuerdos contigo y verte cumplir todas las metas que te propongas.',
    ],
  },
  // ── Despedida ──
  {
    style: 'despedida',
    paragraphs: ['Feliz cumpleaños número 21.'],
  },
  {
    style: 'sign',
    paragraphs: ['❤️'],
  },
]

// Cierre del capítulo: prepara a Shantal para el Examen de amistad.
export const LETTER_CLOSING =
  'Y con esto, este capítulo queda cerrado… Solo falta una última cosa: saber cuánto me conoces de verdad.'

// ── G5: Examen de amistad ───────────────────────────────────────────────────
export interface QuizOption { label: string; feedback?: string }
export interface QuizQuestion {
  prompt: string
  options: QuizOption[]
  correct: number | null   // índice de la opción correcta; null = no suma puntaje
  points: number
}
export const QUIZ_TOTAL = 20

// ── Respuestas definitivas pendientes ─────────────────────────────────────────
// Completa aquí las respuestas correctas de las preguntas que faltan:
//    0 = primera opción ("Sí") · 1 = segunda opción ("No")
export const QUIZ_CAFE_SIN_AZUCAR: number | null = null // TODO: responde 0 (Sí) o 1 (No)
export const QUIZ_TOMA_GASEOSA: number | null = null    // TODO: responde 0 (Sí) o 1 (No)

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    prompt: '¿Cuándo es mi cumpleaños?',
    options: [
      { label: '30 de julio', feedback: 'Bieeeen caaausa, yo me olvidaría :c' },
      { label: '31 de julio', feedback: 'Ve, no se supone que yo soy el de la memoria de abuelo' },
      { label: '14 de octubre', feedback: 'Ve, no se supone que yo soy el de la memoria de abuelo' },
    ],
    correct: 0,
    points: 5,
  },
  {
    prompt: '¿Cómo nos conocimos?',
    options: [
      { label: 'Jugando', feedback: 'Bien amistad viva el lol' },
      { label: 'Estudiando xddd', feedback: 'Waaaa que feo :c' },
      { label: 'Por gordo Lui', feedback: 'Bendito gordo lui hace magia por lo que veo' },
    ],
    correct: 0,
    points: 5,
  },
  {
    prompt: '¿Hace cuánto tiempo aproximadamente?',
    options: [
      { label: 'Marzo', feedback: 'Me matas pero no me acuerdo :c' },
      { label: 'Abril', feedback: 'Me matas pero no me acuerdo :c' },
      { label: 'Febrero', feedback: 'Me matas pero no me acuerdo :c' },
    ],
    correct: null,
    points: 0,
  },
  {
    prompt: '¿Me gusta el café sin azúcar?',
    options: [{ label: 'Sí' }, { label: 'No' }],
    correct: QUIZ_CAFE_SIN_AZUCAR,
    points: 5,
  },
  {
    prompt: '¿Tomo gaseosa?',
    options: [{ label: 'Sí' }, { label: 'No' }],
    correct: QUIZ_TOMA_GASEOSA,
    points: 5,
  },
]

// Mensajes del resultado según puntaje (se elige el mayor `min` <= puntaje).
export interface QuizResult { min: number; title: string; message: string }
export const QUIZ_RESULTS: QuizResult[] = [
  {
    min: 20,
    title: '🏆 Amistad nivel legendaria',
    message: '¡Perfecto! Me conoces incluso mejor que yo mismo. Eso se celebra con confeti.',
  },
  {
    min: 15,
    title: '🪐 Amistad nivel astronauta',
    message: 'Impresionante. Sabes más de mí de lo que creen todos los que me rodean.',
  },
  {
    min: 12,
    title: '💖 Excelente amistad',
    message: 'Muy bien… y como buena recompensa, hay algo secreto esperándote.',
  },
  {
    min: 0,
    title: '😂 Amistad en modo práctica',
    message: 'Uy, creo que nos faltan más partidas y más viernes juntos. Vuelve a intentarlo.',
  },
]

// ── Regalo secreto + desbloqueo por horario ──────────────────────────────────
export const SECRET_GIFT_MIN_SCORE = 12
export const SECRET_UNLOCK_HOUR = 20   // 8:00 PM, hora de Lima
export const SECRET_TIME_ZONE = 'America/Lima'

export const SECRET_BANNER_TITLE = 'Has desbloqueado un regalo secreto'
export const SECRET_BANNER_SUB = 'Busca la carta colgante en el cielo de tu mundo ✨'

export const SECRET_AVAILABLE_LABEL = 'Ya se deja atrapar ✨'
export const SECRET_ESCAPING_LABEL = 'Se escapa… vuelve después de las 8 PM 😏'

export const SECRET_PATIENCE_MSG =
  'Tienes que esperar para este mensaje, paciencia amistad aunque no tienes mucha ajsdjajaf'

// La carta aún no contiene el mensaje final (se añade en una fase posterior).
export const SECRET_PLACEHOLDER_TITLE = 'Mensaje final (pendiente)'
export const SECRET_PLACEHOLDER_BODY =
  'La carta se abrió. El verdadero mensaje final se coloca aquí en breve.'