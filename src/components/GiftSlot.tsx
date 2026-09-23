// ── Tarjeta de regalo del hub ────────────────────────────────────────────────
import { useState } from 'react'
import type { GiftMeta, GiftId } from '../content/hub'
import { GIFT_META } from '../content/hub'

function GiftSlot({
  meta, unlocked, completed, delay, onClick,
}: {
  meta: GiftMeta
  unlocked: boolean
  completed: boolean
  delay: number
  onClick: (id: GiftId) => void
}) {
  const [shaking, setShaking] = useState(false)

  const statusLabel = completed ? 'Completado' : unlocked ? 'Disponible' : 'Bloqueado'
  const stateClass = completed ? 'is-completed' : unlocked ? 'is-unlocked' : 'is-locked'
  const tagline = completed ? 'Ya lo abriste ✨' : unlocked ? 'Toca para descubrir ✨' : 'Completa el anterior para desbloquear'

  const handleClick = () => {
    if (unlocked) {
      onClick(meta.id)
      return
    }
    setShaking(true)
    window.setTimeout(() => setShaking(false), 550)
  }

  return (
    <div
      className={`gift-slot ${stateClass} ${shaking ? 'is-shaking' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`Regalo ${meta.id} de ${GIFT_META.length}. ${statusLabel}`}
      style={{
        animation: `fadeInUp 0.6s ${delay}s both`,
      }}
    >
      <div className="gift-emoji" aria-hidden="true">
        🎁
      </div>
      <div className="gift-indicator" aria-hidden="true">
        {completed ? '✓' : unlocked ? '🔓' : '🔒'}
      </div>
      <h3 className="gift-title">Regalo {meta.id}</h3>
      <p className="gift-tagline">{tagline}</p>
      <div className="gift-status">
        {completed ? 'Completado ✨' : unlocked ? 'Abrir' : 'Bloqueado — completa el anterior'}
      </div>
    </div>
  )
}

export default GiftSlot