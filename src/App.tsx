import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import {
  GIFT_META,
  PLAYLIST,
  QUIZ_TOTAL,
  SECRET_AVAILABLE_LABEL,
  SECRET_BANNER_SUB,
  SECRET_BANNER_TITLE,
  SECRET_GIFT_MIN_SCORE,
  floatingMessages,
  getGiftMeta,
} from './content'
import type { GiftId, PlaylistTrack } from './content'
import { audioFileExists, resolveAudio } from './lib/audio'
import { loadSave, persistSave, clearSave } from './lib/persistence'
import type { SaveState } from './lib/persistence'
import type { YoutubeVideo } from './lib/youtube'

import GiftSlot from './components/GiftSlot'
import GiftShell from './components/GiftShell'
import MusicControls from './components/MusicControls'
import YoutubeGlobalPlayer from './components/YoutubeGlobalPlayer'
import StarField from './components/effects/StarField'
import FloatingParticles from './components/effects/FloatingParticles'
import FloatingMessages from './components/effects/FloatingMessages'
import ConfettiBurst from './components/effects/ConfettiBurst'
import Sparkles from './components/effects/Sparkles'
import GiftPlaylist from './components/gifts/GiftPlaylist'
import GiftViernes from './components/gifts/GiftViernes'
import GiftInicios from './components/gifts/GiftInicios'
import GiftQuiz from './components/gifts/GiftQuiz'
import { SecretDialog } from './components/gifts/GiftFinalLetter'

// El contenido editable (canciones, textos, preguntas, carta) vive en `src/content/`.
// Los componentes de cada regalo viven en `src/components/gifts/`.
// Los archivos de audio deben estar en `public/assets/audio/`.

// ── Progreso guardado en el navegador ─────────────────────────────────────────
const initialSave: SaveState = loadSave()

// ─────────────────────────────────────────────────────────────────────────────

// ── Próximo regalo según el orden del HUB (GIFT_META); encadena el desbloqueo. ─
function nextGiftAfter(id: GiftId): GiftId | null {
  const i = GIFT_META.findIndex(g => g.id === id)
  return GIFT_META[i + 1]?.id ?? null
}

export default function App() {
  const [musicOn,     setMusicOn]     = useState(false)
  // Se vuelve true en cuanto se elige una canción local; mantiene visible el
  // reproductor aunque esté pausada (para pausar/reanudar sin reabrir Regalo 1).
  const [localTrackSelected, setLocalTrackSelected] = useState(false)

  // Video de YouTube seleccionado en el Regalo 1. Vive aquí (a nivel global)
  // para que el reproductor siga sonando aunque se cierre el regalo.
  const [youtubeQuery,  setYoutubeQuery]  = useState(initialSave.youtubeQuery)
  const [youtubeVideo,  setYoutubeVideo]  = useState<YoutubeVideo | null>(initialSave.youtubeVideo)

  // Playlist efectiva: solo las canciones cuyo archivo de audio existe.
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(PLAYLIST.map(t => audioFileExists(t.file)))
      .then(exists => {
        if (cancelled) return
        const available = PLAYLIST.filter((_, i) => exists[i])
        setPlaylistTracks(available.length > 0 ? available : PLAYLIST)
      })
      .catch(() => {
        if (!cancelled) setPlaylistTracks(PLAYLIST)
      })
    return () => { cancelled = true }
  }, [])
  const [volume,      setVolume]      = useState(initialSave.volume)
  const [currentTrack,setCurrentTrack]= useState(initialSave.pickedTrack)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)

  // ── Progreso de los 4 regalos ──
  const [completedGifts, setCompletedGifts] = useState<Record<GiftId, boolean>>(() => {
    const base: Record<GiftId, boolean> = { 1: false, 2: false, 3: false, 4: false }
    for (const id of initialSave.completedGifts) base[id] = true
    return base
  })
  const [openGift,       setOpenGift]       = useState<GiftId | null>(null)
  const [unlockedBanner, setUnlockedBanner] = useState<GiftId | null>(null)

  // ── Quiz + mensaje secreto final ──
  const [quizBest,            setQuizBest]            = useState(() => Math.max(0, Math.min(QUIZ_TOTAL, initialSave.quizBest)))
  const [secretUnlockedBanner,setSecretUnlockedBanner]= useState(false)
  const [secretBoxOpen,       setSecretBoxOpen]       = useState(false)
  const quizBestRef = useRef(quizBest)
  const secretUnlockedRef = useRef(quizBest >= SECRET_GIFT_MIN_SCORE)

  const audioRef        = useRef<HTMLAudioElement | null>(null)
  const volumeRef       = useRef(initialSave.volume)
  const lastVolumeRef   = useRef(initialSave.volume > 0 ? initialSave.volume : 0.3)
  const currentTrackRef = useRef(initialSave.pickedTrack)
  const hubRef          = useRef<HTMLDivElement | null>(null)
  const timersRef       = useRef<ReturnType<typeof setTimeout>[]>([])

  // Parallax por scroll sin re-renderizar React: escribe solo la variable CSS.
  const handleScroll = useCallback(() => {
    if (hubRef.current) {
      const top = hubRef.current.querySelector<HTMLElement>('.main-scroll')?.scrollTop ?? 0
      hubRef.current.style.setProperty('--parallax-px', String(top))
    }
  }, [])

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  // ── Playlist helpers ──
  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current
    if (!audio || playlistTracks.length === 0) return
    const n = ((index % playlistTracks.length) + playlistTracks.length) % playlistTracks.length
    const track = playlistTracks[n]
    if (!track) return
    setLocalTrackSelected(true)
    currentTrackRef.current = n
    setCurrentTrack(n)
    setCurrentTime(0)
    setDuration(0)
    audio.src = resolveAudio(track.file)
    audio.volume = volumeRef.current
    audio.play().catch(() => {})
  }, [playlistTracks])

  // Elemento de audio único: al terminar avanza a la siguiente canción y al
  // llegar a la última vuelve a la primera (loop de playlist).
  useEffect(() => {
    const audio = new Audio()
    audio.loop = false
    audio.preload = 'auto'
    audio.volume = volumeRef.current
    audioRef.current = audio

    const onEnded = () => playTrack(currentTrackRef.current + 1)
    const onTimeUpdate = () => {
      setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0)
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const onError = () => {
      const track = playlistTracks[currentTrackRef.current]
      const src = audio.currentSrc || audio.src || '(sin fuente)'
      const code = audio.error?.code ?? null
      console.error(
        `[Música] Error al cargar la canción "${track?.title ?? 'desconocida'}"` +
          `${track ? ` (${track.file})` : ''}:`,
        { url: src, errorCode: code, mediaError: audio.error?.message ?? null }
      )
    }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
      try {
        audio.removeAttribute('src')
        audio.load()
      } catch { /* noop */ }
      audioRef.current = null
    }
  }, [playTrack])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio || playlistTracks.length === 0) return
    if (musicOn) {
      audio.pause()
      setMusicOn(false)
    } else {
      if (!audio.getAttribute('src')) {
        playTrack(currentTrackRef.current)
      } else {
        audio.volume = volumeRef.current
        audio.play().catch(() => {})
      }
      setMusicOn(true)
    }
  }, [musicOn, playTrack])

  const handleVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    volumeRef.current = clamped
    setVolume(clamped)
    if (clamped > 0) lastVolumeRef.current = clamped
    if (audioRef.current) audioRef.current.volume = clamped
  }, [])

  // Silenciar / restaurar el último volumen no nulo.
  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (volumeRef.current > 0) {
      lastVolumeRef.current = volumeRef.current
      volumeRef.current = 0
      setVolume(0)
      audio.volume = 0
    } else {
      const v = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.3
      volumeRef.current = v
      setVolume(v)
      audio.volume = v
    }
  }, [])

  // Salto a un momento concreto de la canción (click en la barra).
  const seekTo = useCallback((t: number) => {
    const audio = audioRef.current
    if (!audio) return
    if (!Number.isFinite(t)) return
    const clamped = Math.max(0, t)
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  // Anterior: wrap al final de la playlist. Siguiente: wrap al inicio.
  const prevTrack = useCallback(
    () => playTrack(currentTrackRef.current - 1),
    [playTrack]
  )
  const nextTrack = useCallback(
    () => playTrack(currentTrackRef.current + 1),
    [playTrack]
  )

  useEffect(() => () => clearAllTimers(), [])

  // ── Progreso de los regalos ──
  // El desbloqueo secuencial sigue el ORDEN del HUB (GIFT_META), no el id.
  const isUnlocked = useCallback(
    (id: GiftId) => {
      const i = GIFT_META.findIndex(g => g.id === id)
      for (let k = 0; k < i; k++) {
        if (!completedGifts[GIFT_META[k].id]) return false
      }
      return true
    },
    [completedGifts]
  )

  const completedCount = useMemo(
    () => GIFT_META.filter(g => completedGifts[g.id]).length,
    [completedGifts]
  )

  const handleOpenGift = useCallback((id: GiftId) => {
    setOpenGift(id)
    // La playlist desbloquea el siguiente regalo con solo visitarla
    // (además del botón "Hecho ✨" en caso de querer cerrarla antes).
    if (id === 1 && !completedGifts[1]) {
      setCompletedGifts(prev => ({ ...prev, 1: true }))
      const next = nextGiftAfter(id)
      if (next) {
        setUnlockedBanner(next)
        addTimer(() => setUnlockedBanner(null), 3600)
      }
    }
  }, [completedGifts])

  const handlePickTrack = useCallback((i: number) => {
    playTrack(i)
    setMusicOn(true)
  }, [playTrack])

  // Al reproducir un video de YouTube se pausa el audio local (sin reiniciarlo):
  // nunca deben sonar ambos a la vez. El usuario retoma la canción manualmente.
  const handleSelectYouTube = useCallback((video: YoutubeVideo) => {
    audioRef.current?.pause()
    setMusicOn(false)
    setYoutubeVideo(video)
  }, [])

  // Cerrar/quitar el video de YouTube NO reanuda la canción local: queda pausada.
  const handleClearYouTube = useCallback(() => {
    setYoutubeVideo(null)
  }, [])

  // Marca un regalo como completado; `unlockNext` encadena el desbloqueo
  // del siguiente regalo según el orden del HUB (el último no tiene siguiente).
  const markCompleted = useCallback((id: GiftId, unlockNext: boolean) => {
    setCompletedGifts(prev => ({ ...prev, [id]: true }))
    if (unlockNext) {
      const next = nextGiftAfter(id)
      if (next) {
        setUnlockedBanner(next)
        addTimer(() => setUnlockedBanner(null), 3600)
      }
    }
  }, [])

  const completeGift = useCallback((id: GiftId) => {
    setOpenGift(null)
    markCompleted(id, true)
  }, [markCompleted])

  // Al terminar el Examen de amistad: guarda el mejor puntaje, cierra el regalo 4
  // (sin desbloquear otro) y, si alcanzó el mínimo, revela la carta colgante.
  const handleQuizFinish = useCallback((score: number) => {
    const clamped = Math.max(0, Math.min(QUIZ_TOTAL, Math.floor(score)))
    setQuizBest(prev => Math.max(prev, clamped))
    const newBest = Math.max(quizBestRef.current, clamped)
    quizBestRef.current = newBest
    markCompleted(4, false)
    if (newBest >= SECRET_GIFT_MIN_SCORE && !secretUnlockedRef.current) {
      secretUnlockedRef.current = true
      setSecretUnlockedBanner(true)
      addTimer(() => setSecretUnlockedBanner(false), 4200)
    }
  }, [markCompleted])

  // La carta colgante se deja atrapar en cuanto el examen alcanza el mínimo.
  const handleSecretClick = useCallback(() => {
    setSecretBoxOpen(true)
  }, [])

  const handleClearProgress = useCallback(() => {
    if (!window.confirm('¿Seguro que quieres borrar todo el progreso?')) return
    clearSave()
    setCompletedGifts({ 1: false, 2: false, 3: false, 4: false })
    setQuizBest(0)
    quizBestRef.current = 0
    secretUnlockedRef.current = false
    setSecretUnlockedBanner(false)
    setSecretBoxOpen(false)
    setUnlockedBanner(null)
    setOpenGift(null)
    setYoutubeVideo(null)
    setYoutubeQuery('')
    setLocalTrackSelected(false)
  }, [])

  // ── Persistencia del progreso (con debounce) ──
  useEffect(() => {
    const save: SaveState = {
      ...loadSave(),
      version: 1,
      completedGifts: GIFT_META.filter(g => completedGifts[g.id]).map(g => g.id),
      quizBest,
      pickedTrack: currentTrack,
      volume,
      youtubeQuery,
      youtubeVideo,
    }
    const id = window.setTimeout(() => persistSave(save), 250)
    return () => window.clearTimeout(id)
  }, [completedGifts, quizBest, currentTrack, volume, youtubeQuery, youtubeVideo])

  // ── Shared background ──
  const spaceBg: React.CSSProperties = {
    background: 'radial-gradient(ellipse at 20% 50%, #1a003399 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #3300224d 0%, transparent 45%), radial-gradient(ellipse at 60% 80%, #220033aa 0%, transparent 40%), #05000d',
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HUB
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div ref={hubRef} className="relative w-full h-full overflow-hidden" style={spaceBg}>
      {/* Parallax background layers */}
      <StarField count={200} />
      <FloatingParticles />

      {/* Recuerdos flotando por el espacio (posiciones inteligentes) */}
      <FloatingMessages messages={floatingMessages} />

      {/* Banner de regalo desbloqueado */}
      {unlockedBanner !== null && (
        <div className="gift-unlock-layer" aria-live="polite">
          <ConfettiBurst />
          <div className="gift-banner" role="status">
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div className="gift-banner-title">Has desbloqueado un regalo nuevo</div>
              <div className="gift-banner-meta">
                {getGiftMeta(unlockedBanner).emoji} {getGiftMeta(unlockedBanner).title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner del regalo secreto recién desbloqueado */}
      {secretUnlockedBanner && (
        <div className="gift-unlock-layer" aria-live="polite">
          <ConfettiBurst />
          <div className="gift-banner" role="status">
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div className="gift-banner-title">{SECRET_BANNER_TITLE}</div>
              <div className="gift-banner-meta">{SECRET_BANNER_SUB}</div>
            </div>
          </div>
        </div>
      )}

      {/* Carta colgante del mensaje final (se desbloquea con el examen) */}
      {quizBest >= SECRET_GIFT_MIN_SCORE && (
        <div className="secret-hanger">
          <div className="secret-thread" aria-hidden="true" />
          <button
            type="button"
            aria-label="Carta colgante del regalo secreto"
            className="secret-letter"
            onClick={handleSecretClick}
          >
            <span className="secret-seal">💌</span>
          </button>
          <p className="secret-hint-label">{SECRET_AVAILABLE_LABEL}</p>
        </div>
      )}

      {/* Mensaje final: la carta de cumpleaños */}
      {secretBoxOpen && (
        <SecretDialog onClose={() => setSecretBoxOpen(false)} />
      )}

      {/* Scrollable content */}
      <div
        onScroll={handleScroll}
        className="main-scroll relative z-10 h-full"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* ── Hero ── */}
        <section className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16 relative">
          <Sparkles count={10} />

          {/* Title — siempre visible, sin planeta de fondo */}
          <div className="text-center" style={{ animation: 'titleReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}>
            <h1
              style={{
                fontFamily:            "'Cinzel', serif",
                fontWeight:            900,
                fontSize:              'clamp(28px, 6vw, 54px)',
                background:            'linear-gradient(135deg, #ffffff, #ff6ba8, #ff2d78, #ffffff)',
                backgroundSize:        '200% auto',
                WebkitBackgroundClip:  'text',
                WebkitTextFillColor:   'transparent',
                animation:             'shimmer 4s linear infinite',
                lineHeight:            1.2,
                marginBottom:          16,
              }}
            >
              Feliz Cumpleaños Shantal 🎂✨
            </h1>
            <p
              style={{
                fontFamily:    "'Poppins', sans-serif",
                color:         '#e8a0c0',
                fontSize:      'clamp(14px, 2.5vw, 18px)',
                fontWeight:    300,
                letterSpacing: '0.04em',
                textShadow:    '0 0 15px #ff2d7866',
                animation:     'subtitleReveal 0.8s 0.5s both',
              }}
            >
              21 años llenos de esfuerzo, dedicación y sueños por cumplir.
            </p>
          </div>

          {/* ── Elige un regalo ── */}
          <div className="text-center" style={{ animation: 'fadeInUp 0.8s 0.35s both' }}>
            <h2 className="hub-heading">🎁 Elige un regalo</h2>
            <p className="hub-progress">
              Completa cada regalo para desbloquear el siguiente · {completedCount} de {GIFT_META.length}
            </p>
          </div>

          {/* ── Grid de regalos ── */}
          <div className="gifts-grid">
            {GIFT_META.map((g, i) => (
              <GiftSlot
                key={g.id}
                meta={g}
                unlocked={isUnlocked(g.id)}
                completed={completedGifts[g.id]}
                delay={0.15 + i * 0.12}
                onClick={handleOpenGift}
              />
            ))}
          </div>

          {/* ── Acciones ── */}
          <div className="hub-actions">
            <button type="button" onClick={handleClearProgress} className="gift-cta-ghost">
              🗑️ Borrar progreso
            </button>
          </div>
        </section>

        <div className="h-24" />
      </div>

      {localTrackSelected && !youtubeVideo && (
        <MusicControls
          musicOn={musicOn}
          onToggle={toggleMusic}
          onToggleMute={toggleMute}
          volume={volume}
          onVolumeChange={handleVolume}
          trackTitle={playlistTracks[currentTrack]?.title ?? 'Música'}
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
          onPrev={prevTrack}
          onNext={nextTrack}
          elevated={openGift !== null}
        />
      )}

      {youtubeVideo && (
        <YoutubeGlobalPlayer video={youtubeVideo} onClear={handleClearYouTube} />
      )}

      {openGift !== null && (
        <GiftShell
          meta={getGiftMeta(openGift)}
          completed={completedGifts[openGift]}
          completable={openGift === 4 ? quizBest > 0 : true}
          onClose={() => setOpenGift(null)}
          onComplete={() => completeGift(openGift)}
        >
          {openGift === 1 && (
            <GiftPlaylist
              tracks={playlistTracks}
              onPickTrack={handlePickTrack}
              activeTrack={currentTrack}
              isPlaying={musicOn}
              youtubeQuery={youtubeQuery}
              onYouTubeQueryChange={setYoutubeQuery}
              onSelectVideo={handleSelectYouTube}
            />
          )}
          {openGift === 2 && <GiftViernes />}
          {openGift === 3 && <GiftInicios />}
          {openGift === 4 && (
            <GiftQuiz
              bestScore={quizBest}
              onFinish={handleQuizFinish}
              completed={completedGifts[4]}
            />
          )}
        </GiftShell>
      )}
    </div>
  )
}