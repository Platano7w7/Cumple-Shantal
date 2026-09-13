// ── Contenido de la experiencia (editable) ──────────────────────────────────
// Este archivo es el único lugar donde editar textos, canciones y preguntas.

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
// Mensajes de bienvenida y cierre del Regalo 1 (los saltos de línea se respetan).
export const PLAYLIST_INTRO = '✨ Mira ✨\n\nEstas son tus canciones favoritas ❤️'
export const PLAYLIST_CLOSING =
  '✨ Pero si hoy quieres escuchar otra canción,\ntambién puedes buscarla aquí.'
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

// ── Carta de cumpleaños (mensaje final) ──────────────────────────────────────
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
    paragraphs: ['Para Shantal:'],
  },
  // ── Mensaje principal ──
  {
    style: 'principal',
    paragraphs: [
      'Hoy quería escribirte unas palabras porque es tu cumpleaños y porque siento que una amistad como la nuestra merece algo más que un simple “feliz cumpleaños”.',
      'Primero que nada, feliz cumpleaños, amistad. Espero que hoy tengas un día increíble, que recibas mucho cariño, que te consientan bastante y que puedas disfrutar cada momento.Me alegra mucho haberte conocido y que con el tiempo nuestra amistad haya podido convertirse en algo tan bonito. Hemos compartido risas, conversaciones, momentos buenos y otros no tan buenos, pero cada uno de ellos ha dejado algún recuerdo que seguramente algún día recordaremos con una sonrisa.',
'Quiero que sepas que te aprecio muchísimo, amistad. Espero que este nuevo año de vida venga acompañado de muchas cosas buenas, nuevos sueños, experiencias increíbles y, sobre todo, mucha felicidad. Te deseo de corazón que puedas conseguir todo aquello que te propongas y que nunca te falten motivos para seguir sonriendo.
Y obviamente, no podía faltar la participación de un pequeño animal, bueno de pequeño no tiene nada. Así que hoy recibiste un mensaje de alguien especial:.',
    ],
  },
  // ── Mensaje de Gordo Lui (bloque independiente: no simplificar) ──
  {
    label: '💬 Mensaje sopresa',
    style: 'gordo',
    paragraphs: [
      'Hola, amistad. Soy Gordo Lui y me informo danilo que hoy cumples años. No sé exactamente qué se sentira cumplir años ya que danilo maldito no me festeja, pero aparentemente hay comida, así que me parece una excelente idea y espero que me sobres para seguir engordando junto a mi dueño.” 😼
“Quería desearte un feliz cumpleaños y decirte que eres una muy buena humana. Gracias por quererme, me dijeron que eres mi fan numero 1, jaja god. Avesces puede ser que muerda o arañe a danilo pero es por su bien lo estoy adiestrando para que se comporte bonito miau.”
“Espero que tengas muchos regalos, muchos abrazos y un día muy bonito.” 
“Feliz cumpleaños, amistad. Te quiero mucho... pero no tanto como quiero dormir todo el día. '
'Y recuerda, Shantal: si algún día sientes que nadie te entiende, yo probablemente tampoco te entienda, pero tendras una foto mia dormido sacada sin mi consentimiento para poder alegrarte un poco',
    ],
  },
  // ── Mensaje final de Danilo ──
  {
    style: 'final',
    paragraphs: [
      'Volviendo conmigo osea Danilo xd, amistad, espero que tengas un cumpleaños muy bonito y que este nuevo año de tu vida esté lleno de momentos que valga la pena recordar y ojala no mas traumas con tus pacientes.',
      'Gracias por ser tú, por tu forma de ser y por formar parte de mi vida social. Espero que nuestra amistad siga teniendo muchos capítulos más, muchas risas, conversaciones y momentos que podamos recordar en el futuro.',
    ],
  },
  // ── Despedida ──
  {
  style: 'despedida',
  paragraphs: [
    'Feliz cumpleaños número 21 ',
    'Con cariño, Danilo.',
  ],
},
  {
    style: 'sign',
    paragraphs: [' 🎂❤️'],
  },
]

// Cierre del capítulo: prepara a Shantal para el Examen de amistad (se muestra al
// final del Regalo 3, Los inicios).
export const LETTER_CLOSING =
  'Y con esto, este capítulo queda cerrado...\nSolo falta una última cosa:\nsaber cuánto me conoces de verdad.'

// ── G4: Examen de amistad ───────────────────────────────────────────────────
export interface QuizOption { label: string; feedback?: string }
export interface QuizQuestion {
  prompt: string
  options: QuizOption[]
  correct: number | null   // índice de la opción correcta; null = no suma puntaje
  points: number
  allCorrect?: boolean     // true = cualquier opción es correcta y suma puntos
}
export const QUIZ_TOTAL = 25

// ── Respuestas definitivas de las preguntas sí/no ────────────────────────────
//    0 = primera opción ("Sí") · 1 = segunda opción ("No")
export const QUIZ_CAFE_SIN_AZUCAR: number | null = 0 // Sí = correcta · No = incorrecta
export const QUIZ_TOMA_GASEOSA: number | null = 1    // No = correcta · Sí = incorrecta

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
      { label: 'Marzo', feedback: '¡Correcto! Ninguna opción estaba mal 💖' },
      { label: 'Abril', feedback: '¡Correcto! Ninguna opción estaba mal 💖' },
      { label: 'Febrero', feedback: '¡Correcto! Ninguna opción estaba mal 💖' },
    ],
    correct: null,
    points: 5,
    allCorrect: true,
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
    min: 25,
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

// ── Mensaje secreto final (la carta de cumpleaños) ───────────────────────────
export const SECRET_GIFT_MIN_SCORE = 12

export const SECRET_BANNER_TITLE = 'Has desbloqueado un regalo secreto'
export const SECRET_BANNER_SUB = 'Busca la carta colgante en el cielo de tu mundo ✨'

export const SECRET_AVAILABLE_LABEL = 'Ya se deja atrapar ✨'