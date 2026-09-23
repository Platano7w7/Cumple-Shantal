import { useRef, useState } from 'react'

import {
  QUIZ_QUESTIONS,
  QUIZ_RESULTS,
  QUIZ_TOTAL,
  SECRET_GIFT_MIN_SCORE,
} from '../../content'
import type { QuizQuestion, QuizResult } from '../../content'

export interface GiftQuizProps {
  bestScore: number
  onFinish: (score: number) => void
  completed?: boolean
}

// ── G4: Examen de amistad (experiencia interactiva tipo juego) ────────────────
function GiftQuiz({
  bestScore, onFinish, completed = false,
}: GiftQuizProps) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number[]>(() => Array(QUIZ_QUESTIONS.length).fill(-1))
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const firedRef = useRef(false)

  const q = QUIZ_QUESTIONS[step]
  const answered = selected[step]
  const answeredCount = selected.filter(s => s !== -1).length

  const computeScore = (sel: number[]) =>
    QUIZ_QUESTIONS.reduce((acc, question: QuizQuestion, i) => {
      const picked = sel[i]
      const scored =
        (question.allCorrect && picked !== -1) ||
        (question.correct !== null && picked === question.correct)
      return scored ? acc + question.points : acc
    }, 0)

  const handleAnswer = (opt: number) => {
    if (revealed) return
    setSelected(prev => {
      const next = [...prev]
      next[step] = opt
      return next
    })
    setRevealed(true)
  }

  const handleNext = () => {
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1)
      setRevealed(false)
    } else {
      const score = computeScore(selected)
      setFinalScore(score)
      setDone(true)
      if (!firedRef.current) {
        firedRef.current = true
        onFinish(score)
      }
    }
  }

  const isCorrectSel = Boolean(q.allCorrect) || (q.correct !== null && answered === q.correct)

  if (completed) {
    const result: QuizResult = QUIZ_RESULTS.find(r => bestScore >= r.min) ?? QUIZ_RESULTS[QUIZ_RESULTS.length - 1]
    return (
      <div className="quiz-result" style={{ animation: 'fadeInUp 0.6s both' }}>
        <p className="quiz-step">✅ Examen completado</p>
        <div className="quiz-score">
          <span className="quiz-score-num">{bestScore}</span>
          <span className="quiz-score-total">/ {QUIZ_TOTAL} pts</span>
        </div>
        <h3 className="quiz-result-title">{result.title}</h3>
        <p className="quiz-result-message">{result.message}</p>
        {bestScore >= SECRET_GIFT_MIN_SCORE && (
          <p className="quiz-secret-hint" style={{ animation: 'giftPopIn 0.7s 0.3s both' }}>
            Ya desbloqueaste la carta final 💌
          </p>
        )}
      </div>
    )
  }

  if (done) {
    const result: QuizResult = QUIZ_RESULTS.find(r => finalScore >= r.min) ?? QUIZ_RESULTS[QUIZ_RESULTS.length - 1]
    return (
      <div className="quiz-result" style={{ animation: 'fadeInUp 0.6s both' }}>
        <div className="quiz-score">
          <span className="quiz-score-num">{finalScore}</span>
          <span className="quiz-score-total">/ {QUIZ_TOTAL} pts</span>
        </div>
        <h3 className="quiz-result-title">{result.title}</h3>
        <p className="quiz-result-message">{result.message}</p>
        {finalScore >= SECRET_GIFT_MIN_SCORE && (
          <p className="quiz-secret-hint" style={{ animation: 'giftPopIn 0.7s 0.3s both' }}>
            🎁 Has desbloqueado un regalo secreto
          </p>
        )}
        <p className="quiz-best">
          Mejor puntaje general: {Math.max(bestScore, finalScore)}/{QUIZ_TOTAL} 🏆
        </p>
      </div>
    )
  }

  return (
    <div className="quiz-wrap">
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${(answeredCount / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>
      <div className="quiz-top">
        <span className="quiz-step">Pregunta {step + 1} de {QUIZ_QUESTIONS.length}</span>
        <span className="quiz-pick">{answeredCount} respondidas · {step + 1 === QUIZ_QUESTIONS.length ? 'es la última' : `faltan ${QUIZ_QUESTIONS.length - 1 - step}`}</span>
      </div>

      <div className="quiz-card">
        <p className="quiz-prompt">{q.prompt}</p>
        <div className="quiz-options">
          {q.options.map((opt, i) => {
            const chosen = answered === i
            const isCorrectOpt = Boolean(q.allCorrect) || i === q.correct
            let optState = ''
            if (chosen && !revealed) optState = 'quiz-option-chosen'
            else if (revealed) {
              optState = isCorrectOpt ? 'quiz-option-correct' : chosen ? 'quiz-option-wrong' : 'quiz-option-dim'
            }
            return (
              <button
                key={i}
                type="button"
                className={['quiz-option', optState].filter(Boolean).join(' ')}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {revealed && (
        <div className="quiz-feedback" style={{ animation: 'fadeInUp 0.4s both' }} role="status" aria-live="polite">
          <span className="quiz-feedback-icon">{isCorrectSel ? '🎉' : q.correct === null ? '💬' : '😅'}</span>
          <div>
            <p className="quiz-feedback-text">
              {q.options[answered]?.feedback ?? (isCorrectSel ? '¡Correcto!' : 'No era esa…')}
            </p>
            {(q.correct !== null || q.allCorrect) && (
              <p className="quiz-feedback-pts">
                {isCorrectSel ? `+${q.points} pts` : '0 pts'}
              </p>
            )}
          </div>
        </div>
      )}

      {revealed && (
        <div className="quiz-next-row">
          <button type="button" onClick={handleNext} className="gift-cta-ghost">
            {step === QUIZ_QUESTIONS.length - 1 ? 'Ver resultado 🧠' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  )
}

export default GiftQuiz