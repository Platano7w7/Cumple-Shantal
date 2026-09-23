// Re-exports central de todo el contenido editable.
// Importa desde aquí:  import { PLAYLIST } from '@/content'
// (o directamente de un archivo específico, p. ej. '@/content/letter').

export { GIFT_META, getGiftMeta } from './hub'
export type { GiftId, GiftMeta } from './hub'

export { floatingMessages } from './messages'

export { PLAYLIST_INTRO, PLAYLIST_CLOSING, PLAYLIST } from './playlist'
export type { PlaylistTrack } from './playlist'

export { FRIDAY_OPENING, FRIDAY_NOTES, FRIDAY_CLOSING } from './friday'
export type { FridayNote } from './friday'

export { GAME_OPENING, GAME_MOMENTS, GAME_CLOSING, LETTER_CLOSING } from './inicios'
export type { GameMoment } from './inicios'

export { LETTER_BLOCKS, SECRET_BANNER_TITLE, SECRET_BANNER_SUB, SECRET_AVAILABLE_LABEL } from './letter'
export type { LetterBlock, LetterBlockStyle } from './letter'

export {
  QUIZ_TOTAL,
  QUIZ_CAFE_SIN_AZUCAR,
  QUIZ_TOMA_GASEOSA,
  QUIZ_QUESTIONS,
  QUIZ_RESULTS,
  SECRET_GIFT_MIN_SCORE,
} from './quiz'
export type { QuizOption, QuizQuestion, QuizResult } from './quiz'