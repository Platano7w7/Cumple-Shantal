import AnimatedOnScroll from '../effects/AnimatedOnScroll'
import { FRIDAY_CLOSING, FRIDAY_NOTES, FRIDAY_OPENING } from '../../content'

// ── Regalo 2: Los viernes — notas e intimidad de nuestro tiempo juntos ───────
function GiftViernes() {
  return (
    <div>
      <p className="gift-opening" style={{ animation: 'fadeInUp 0.6s 0.15s both' }}>
        {FRIDAY_OPENING}
      </p>

      <div className="friday-notes" aria-label="Notas de nuestros viernes">
        {FRIDAY_NOTES.map((n, i) => (
          <AnimatedOnScroll key={i} delay={i * 0.09}>
            <div className="friday-note">
              <span className="friday-note-emoji" aria-hidden="true">
                {n.emoji}
              </span>
              <div className="friday-note-body">
                <h4 className="friday-note-title">{n.title}</h4>
                <p className="friday-note-text">{n.text}</p>
                {n.sign && <p className="friday-note-sign">{n.sign}</p>}
              </div>
            </div>
          </AnimatedOnScroll>
        ))}
      </div>

      <p className="gift-closing" style={{ animation: 'fadeInUp 0.7s 0.2s both' }}>
        {FRIDAY_CLOSING}
      </p>
    </div>
  )
}

export default GiftViernes