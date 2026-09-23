import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

import AnimatedOnScroll from '../effects/AnimatedOnScroll'
import { LETTER_BLOCKS } from '../../content'

// ── Mensaje final: la carta de cumpleaños (regalo secreto) ───────────────
export function GiftCarta() {
  const styleClass: Record<string, string> = {
    saludo: 'letter-block-saludo',
    gordo: 'letter-block-gordo',
    despedida: 'letter-block-despedida',
    sign: 'letter-block-sign',
  }

  return (
    <div>
      {LETTER_BLOCKS.map((section, s) => (
        <div
          key={s}
          className={section.style === 'gordo' ? 'letter-section letter-section-gordo' : 'letter-section'}
        >
          {section.label && (
            <div className="letter-section-label" style={{ animation: 'fadeInUp 0.5s both' }}>
              {section.label}
            </div>
          )}
          {section.paragraphs.map((p, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.1}>
              <div className={`letter-block ${styleClass[section.style] ?? ''}`.trim()}>
                {p}
              </div>
            </AnimatedOnScroll>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Diálogo del regalo secreto con trampa de foco y cierre con Escape ────────
export function SecretDialog({
  onClose,
}: {
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (panel && first) first.focus()
    return () => previous?.focus()
  }, [])

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const panel = panelRef.current
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

  return (
    <div
      className="secret-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Regalo secreto"
    >
      <div
        ref={panelRef}
        className="secret-card"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '88vh', overflowY: 'auto' }}
      >
        <span className="secret-card-envelope">💌</span>
        <h3 className="secret-card-title">Mensaje final</h3>
        <p className="secret-card-body">Te llegó una carta… léela despacio ✨</p>
        <GiftCarta />
        <div className="quiz-next-row">
          <button type="button" onClick={onClose} className="gift-cta-ghost">
            Cerrar ✨
          </button>
        </div>
      </div>
    </div>
  )
}