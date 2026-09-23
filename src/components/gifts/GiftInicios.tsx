import AnimatedOnScroll from '../effects/AnimatedOnScroll'
import MomentCard from '../MomentCard'
import { GAME_CLOSING, GAME_MOMENTS, GAME_OPENING, LETTER_CLOSING } from '../../content'

// ── Regalo 3: Los inicios — recorrido por el comienzo de la amistad ──────────
function GiftInicios() {
  return (
    <div>
      <p className="gift-opening" style={{ animation: 'fadeInUp 0.6s 0.15s both' }}>
        {GAME_OPENING}
      </p>

      <div className="memory-timeline" aria-label="Recorrido por los inicios de la amistad">
        {GAME_MOMENTS.map((m, i) => (
          <AnimatedOnScroll key={i} delay={i * 0.08}>
            <div className="memory-entry">
              <span className="memory-dot" aria-hidden="true">
                {i + 1}
              </span>
              <MomentCard emoji={m.emoji} title={m.title} text={m.text} delay={0} />
            </div>
          </AnimatedOnScroll>
        ))}
      </div>

      <p className="gift-closing" style={{ animation: 'fadeInUp 0.7s 0.2s both' }}>
        {GAME_CLOSING}
      </p>

      <p
        className="gift-closing"
        style={{ whiteSpace: 'pre-line', animation: 'fadeInUp 0.7s 0.3s both' }}
      >
        {'✨ ✨ ✨\n\n'}
        {LETTER_CLOSING}
      </p>
    </div>
  )
}

export default GiftInicios