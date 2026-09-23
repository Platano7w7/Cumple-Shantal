// ── Contenedor del regalo abierto (overlay tipo carta) ───────────────────────
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { GiftMeta } from '../content/hub'

// Enfoca el primer elemento interactivo del panel, bloquea el Tab dentro del
// diálogo y devuelve el foco al elemento que estaba enfocado al abrirlo.
function useDialogFocusTrap(
  rootRef: React.RefObject<HTMLDivElement | null>,
): (e: ReactKeyboardEvent<HTMLDivElement>) => void {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = rootRef.current
    const first = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (panel && first) first.focus()
    return () => previous?.focus()
  }, [rootRef])

  return (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const panel = rootRef.current
    if (!panel) return
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function GiftShell({
  meta, completed, completable = true, wide = false, onClose, onComplete, children,
}: {
  meta: GiftMeta
  completed: boolean
  completable?: boolean // false = el regalo solo se puede cerrar (p. ej. quiz sin terminar)
  wide?: boolean // true = panel más ancho para secciones con mucho texto (viernes, inicios)
  onClose: () => void
  onComplete: () => void
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const handleTabKey = useDialogFocusTrap(panelRef)

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canCloseOnly = !completed && !completable

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={onClose}
      onKeyDown={handleTabKey}
    >
      <div
        ref={panelRef}
        className={`rounded-3xl p-8 ${wide ? 'max-w-4xl' : 'max-w-2xl'} w-full relative`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Regalo: ${meta.title}`}
        style={{
          background: 'linear-gradient(160deg, #1a0015, #0d000a)',
          border: '1px solid #ff2d7866',
          boxShadow: '0 0 60px #ff2d7855, 0 0 120px #ff2d7822',
          animation: 'letterUnfold 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="text-center mb-6">
          <span style={{ fontSize: 42, filter: 'drop-shadow(0 0 12px #ff2d78)' }}>{meta.emoji}</span>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#ff6ba8',
              fontSize: 24,
              fontWeight: 600,
              textShadow: '0 0 20px #ff2d78',
              marginTop: 10,
            }}
          >
            {meta.title}
          </h2>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#e8a0c0',
              fontSize: 13.5,
              fontWeight: 300,
              marginTop: 6,
              letterSpacing: '0.03em',
            }}
          >
            {meta.tagline}
          </p>
          <div
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, #ff2d7888, transparent)',
              margin: '14px 0',
            }}
          />
        </div>

        {children}

        <div className="text-center mt-8">
          {canCloseOnly ? (
            <button
              type="button"
              onClick={onClose}
              className="gift-cta-ghost"
              title="Cierra el examen sin marcarlo como completado. Termínalo para desbloquear el regalo secreto."
            >
              Cerrar ✨
            </button>
          ) : (
            <button
              type="button"
              onClick={completed ? onClose : onComplete}
              className="gift-cta-primary"
            >
              {completed ? 'Cerrar ✨' : 'Hecho ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GiftShell