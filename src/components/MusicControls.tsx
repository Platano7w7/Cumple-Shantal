import type { CSSProperties, KeyboardEvent } from 'react'

// ── Music player (track info + progress + transport + volume) ───────────────
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Tamaño del reproductor global de música ─────────────────────────────────
// Única fuente de verdad para el tamaño del reproductor global.
// Edita aquí para cambiar su tamaño; el ancho se limita al 92% del viewport.
const MUSIC_PLAYER_WIDTH = 460  // px
const MUSIC_PLAYER_HEIGHT = 140 // px (altura mínima)

function MusicControls({
  musicOn, onToggle, onToggleMute, volume, onVolumeChange,
  trackTitle, currentTime, duration, onSeek, onPrev, onNext, elevated,
}: {
  musicOn: boolean
  onToggle: () => void
  onToggleMute: () => void
  volume: number
  onVolumeChange: (v: number) => void
  trackTitle: string
  currentTime: number
  duration: number
  onSeek: (t: number) => void
  onPrev: () => void
  onNext: () => void
  elevated?: boolean
}) {
  const fill = `${Math.round(volume * 100)}%`
  const dur = Math.max(duration || 0, 0.001)
  const pos = Math.min(Math.max(currentTime || 0, 0), dur)
  const progFill = `${dur > 0.001 ? Math.min(100, (pos / dur) * 100) : 0}%`

  // Navegación por teclado cuando el foco está sobre el contenedor del
  // reproductor: espacio = play/pause, ←/→ = ±5s, ↑/↓ = volumen.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement
    if (t.closest('input, button')) return
    if (e.key === ' ') {
      e.preventDefault()
      onToggle()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onSeek(pos - 5)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onSeek(pos + 5)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      onVolumeChange(Math.min(1, Math.max(0, volume + 0.05)))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onVolumeChange(Math.min(1, Math.max(0, volume - 0.05)))
    }
  }

  return (
    <div
      className={'player-pill' + (elevated ? ' player-pill-elevated' : '')}
      style={{
        width: `min(${MUSIC_PLAYER_WIDTH}px, 92vw)`,
        minHeight: `${MUSIC_PLAYER_HEIGHT}px`,
      }}
      role="region"
      aria-label="Reproductor de música"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="player-info">
        <span className="player-track">🎵 {trackTitle}</span>
        <span className="player-time">
          {formatTime(pos)} / {formatTime(dur)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={dur}
        step={0.1}
        value={pos}
        onChange={e => onSeek(parseFloat(e.target.value))}
        aria-label="Progreso de la canción"
        className="player-progress"
        style={{ '--fill': progFill } as CSSProperties}
      />

      <div className="player-controls">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Canción anterior"
          title="Canción anterior"
          className="player-button"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={musicOn ? 'Pausar canción' : 'Reproducir canción'}
          aria-pressed={musicOn}
          title={musicOn ? 'Pausar' : 'Reproducir'}
          className="player-button player-button-main"
        >
          {musicOn ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Siguiente canción"
          title="Siguiente canción"
          className="player-button"
        >
          ⏭
        </button>

        <span className="player-sep" aria-hidden="true" />

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={volume > 0 ? 'Silenciar música' : 'Activar sonido'}
          aria-pressed={volume === 0}
          title={volume > 0 ? 'Silenciar' : 'Activar sonido'}
          className="player-button"
        >
          {volume > 0 ? '🔊' : '🔇'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volumen de la música"
          className="volume-slider"
          style={{ '--fill': fill } as CSSProperties}
        />
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  )
}

export default MusicControls