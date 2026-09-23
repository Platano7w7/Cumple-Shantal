import { useState } from 'react'
import type { FormEvent } from 'react'

import { PLAYLIST_CLOSING, PLAYLIST_INTRO } from '../../content'
import type { PlaylistTrack } from '../../content'
import { searchYouTube } from '../../lib/youtube'
import type { YoutubeSearchResult, YoutubeVideo } from '../../lib/youtube'

export interface GiftPlaylistProps {
  tracks: PlaylistTrack[]
  onPickTrack: (i: number) => void
  activeTrack: number
  isPlaying: boolean
  youtubeQuery: string
  onYouTubeQueryChange: (q: string) => void
  onSelectVideo: (video: YoutubeVideo) => void
}

// ── Regalo 1: Playlist para Shantal — mixtape + buscador de YouTube ─────────
function GiftPlaylist({
  tracks, onPickTrack, activeTrack, isPlaying,
  youtubeQuery, onYouTubeQueryChange, onSelectVideo,
}: GiftPlaylistProps) {
  const currentIsPlaying = (i: number) => i === activeTrack && isPlaying

  const [results, setResults] = useState<YoutubeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    const q = youtubeQuery.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    try {
      const found = await searchYouTube(q)
      setResults(found)
      setSearched(true)
    } catch {
      setError(
        import.meta.env.VITE_YOUTUBE_API_KEY
          ? 'No se pudo buscar ahora. Inténtalo en un momento.'
          : 'Falta configurar VITE_YOUTUBE_API_KEY para poder buscar en YouTube.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p
        className="gift-opening"
        style={{ whiteSpace: 'pre-line', animation: 'fadeInUp 0.6s 0.15s both' }}
      >
        {PLAYLIST_INTRO}
      </p>

      <h3 className="gift-section-title" style={{ animation: 'fadeInUp 0.6s 0.2s both' }}>
        ❤️ Canciones para ti
      </h3>

      <div className="mixtape-list" aria-label="Playlist de canciones elegidas para ti">
        {tracks.map((t, i) => {
          const active = i === activeTrack
          return (
            <div key={i} className={`mixtape-track${active ? ' is-active' : ''}`}>
              <span className="mixtape-badge" aria-hidden="true">
                {currentIsPlaying(i) ? (
                  <span className="mixtape-eq"><i /><i /><i /></span>
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>

              <div className="mixtape-info">
                <span className="mixtape-title">
                  {(t.emoji ? t.emoji + ' ' : '')}{t.title}
                </span>
                {t.note && <span className="mixtape-note">{t.note}</span>}
              </div>

              {currentIsPlaying(i) ? (
                <span className="mixtape-now" role="status">💖 Sonando ahora</span>
              ) : (
                <button
                  type="button"
                  className="mixtape-play"
                  onClick={() => onPickTrack(i)}
                  aria-label={`Reproducir ${t.title}`}
                  title={`Reproducir ${t.title}`}
                >
                  ▶
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p
        className="gift-opening"
        style={{ whiteSpace: 'pre-line', animation: 'fadeInUp 0.6s 0.25s both' }}
      >
        {PLAYLIST_CLOSING}
      </p>

      <div className="gift-arrow-down" style={{ animation: 'fadeInUp 0.6s 0.3s both' }}>
        <span className="gift-arrow-icon" aria-hidden="true">👇</span>
      </div>

      <h3 className="gift-section-title" style={{ animation: 'fadeInUp 0.6s 0.35s both' }}>
        🔍 Buscar cualquier canción
      </h3>

      <form className="youtube-search-form" onSubmit={handleSearch}>
        <input
          className="youtube-search-input"
          type="text"
          value={youtubeQuery}
          onChange={e => onYouTubeQueryChange(e.target.value)}
          placeholder="Escribe una canción…"
          aria-label="Buscar una canción en YouTube"
        />
        <button
          type="submit"
          className="gift-cta-primary youtube-search-btn"
          disabled={loading || youtubeQuery.trim().length === 0}
        >
          {loading ? 'Buscando…' : '🎵 Buscar'}
        </button>
      </form>

      {error && (
        <p className="youtube-msg is-error" role="status">{error}</p>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <p className="youtube-msg" role="status">
          No encontré resultados para «{youtubeQuery.trim()}». Prueba con otra canción.
        </p>
      )}

      {results.length > 0 && (
        <ul className="youtube-results" aria-label="Resultados de la búsqueda">
          {results.map(video => (
            <li key={video.videoId}>
              <button
                type="button"
                className="youtube-result"
                onClick={() => onSelectVideo(video)}
                aria-label={`Reproducir: ${video.title}`}
              >
                <img className="youtube-thumb" src={video.thumb} alt="" loading="lazy" />
                <span className="youtube-result-info">
                  <span className="youtube-result-title">{video.title}</span>
                  <span className="youtube-result-channel">{video.channel}</span>
                </span>
                <span className="youtube-result-play" aria-hidden="true">▶</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GiftPlaylist