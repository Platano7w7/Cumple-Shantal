// ── Regalo 4: Examen de amistad ─────────────────────────────────────────────
// 5 preguntas · 25 puntos. Aquí se editan las preguntas y los resultados.

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

// ── Umbral que desbloquea la carta final ────────────────────────────────────
// Puntaje mínimo del examen para que aparezca la carta colgante en el hub.
export const SECRET_GIFT_MIN_SCORE = 12