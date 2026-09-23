// ── Regalo 1: Playlist para Shantal ────────────────────────────────────────
// Añade o elimina canciones aquí. El `file` es relativo a public/assets/audio/
// (coloca el mp3 allí para que se reproduzca). `note` es opcional.

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