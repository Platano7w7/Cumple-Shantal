// ── Persistencia local del progreso (localStorage) ──────────────────────────
// El progreso se guarda en el navegador para que Shantal pueda volver a
// abrir la página y continuar desde donde quedó.

import type { GiftId } from '../gift-content'

// Video de YouTube recordado del buscador del Regalo 3.
export interface YoutubeVideo {
  videoId: string
  title: string
  channel: string
  thumb: string
}

export interface SaveState {
  version: number
  completedGifts: GiftId[]
  quizBest: number
  pickedTrack: number
  volume: number
  youtubeQuery: string
  youtubeVideo: YoutubeVideo | null
}

export const STORAGE_KEY = 'cumple-shantal.save.v1'

export const DEFAULT_SAVE: SaveState = {
  version: 1,
  completedGifts: [],
  quizBest: 0,
  pickedTrack: 0,
  volume: 0.3,
  youtubeQuery: '',
  youtubeVideo: null,
}

export function loadSave(): SaveState {
  if (typeof window === 'undefined') return DEFAULT_SAVE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SAVE
    const parsed = JSON.parse(raw) as Partial<SaveState>
    if (parsed.version !== DEFAULT_SAVE.version) return DEFAULT_SAVE
    const youtubeVideo =
      parsed.youtubeVideo && typeof parsed.youtubeVideo.videoId === 'string'
        ? {
            videoId: parsed.youtubeVideo.videoId,
            title: typeof parsed.youtubeVideo.title === 'string' ? parsed.youtubeVideo.title : '',
            channel: typeof parsed.youtubeVideo.channel === 'string' ? parsed.youtubeVideo.channel : '',
            thumb: typeof parsed.youtubeVideo.thumb === 'string' ? parsed.youtubeVideo.thumb : '',
          }
        : null
    return {
      version: DEFAULT_SAVE.version,
      completedGifts: Array.isArray(parsed.completedGifts)
        ? parsed.completedGifts
            .filter((id): id is GiftId => id === 1 || id === 2 || id === 3 || id === 4)
            .filter((id, i, arr) => arr.indexOf(id) === i)
        : [],
      quizBest: typeof parsed.quizBest === 'number' ? parsed.quizBest : 0,
      pickedTrack: typeof parsed.pickedTrack === 'number' ? parsed.pickedTrack : 0,
      volume:
        typeof parsed.volume === 'number'
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_SAVE.volume,
      youtubeQuery: typeof parsed.youtubeQuery === 'string' ? parsed.youtubeQuery : '',
      youtubeVideo,
    }
  } catch {
    return DEFAULT_SAVE
  }
}

export function persistSave(save: SaveState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // Espacio agotado o almacenamiento bloqueado: se ignora silenciosamente.
  }
}

export function clearSave(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // noop
  }
}