import type { YoutubeVideo } from '../lib/youtube'

// ── Tamaño del reproductor global de YouTube ────────────────────────────────
// Única fuente de verdad: YOUTUBE_PLAYER_WIDTH rige el contenedor y
// YOUTUBE_PLAYER_HEIGHT la altura del frame del video.
const YOUTUBE_PLAYER_WIDTH = 420  // px
const YOUTUBE_PLAYER_HEIGHT = 260 // px

// ── Reproductor global de YouTube ────────────────────────────────────────────
// Vive fuera del contenido del regalo: al seleccionar un video en el Regalo 1,
// se monta aquí y sigue reproduciéndose aunque se cierre el GiftShell.
function YoutubeGlobalPlayer({
  video,
  onClear,
}: {
  video: YoutubeVideo
  onClear: () => void
}) {
  return (
    <div
      className="youtube-global"
      style={{ width: `min(${YOUTUBE_PLAYER_WIDTH}px, 92vw)` }}
      aria-label="Reproductor de YouTube"
    >
      <div className="youtube-player-head">
        <span className="youtube-player-now" role="status">
          ► {video.title}
        </span>
        <button
          type="button"
          className="youtube-player-close"
          onClick={onClear}
          aria-label="Quitar video"
          title="Quitar video"
        >
          ✕
        </button>
      </div>
      <div
        className="youtube-player-frame"
        style={{ height: `${YOUTUBE_PLAYER_HEIGHT}px` }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export default YoutubeGlobalPlayer