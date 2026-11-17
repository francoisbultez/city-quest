import { useEffect } from 'react'
import { CHECK_BONUS } from '../lib/game'
import type { Stop } from '../types'

interface Result {
  earned: number
  perfect: boolean
  streak: number
  points: number
}

interface Props {
  stop: Stop
  index: number
  total: number
  /** Shown after answering; absent when reopened from the recap. */
  result?: Result
  /** Option picked in the quick check, if answered. */
  picked?: string
  spotted: number[]
  onCheck: (option: string) => void
  onSpot: (i: number) => void
  /** Bottom button. */
  actionLabel: string
  onAction: () => void
  onBack?: () => void
}

export function Lesson({ stop, index, total, result, picked, spotted, onCheck, onSpot, actionLabel, onAction, onBack }: Props) {
  const l = stop.lesson
  const answered = picked !== undefined
  const right = picked === l.check.answer

  // A new lesson starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stop.id])

  return (
    <main className="lesson">
      {result ? (
        <div className="result-strip" role="status">
          <span className="result-check" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
          <div>
            <strong>{stop.answer}. {result.perfect ? 'Perfect!' : 'Correct!'} +{result.earned}</strong>
            <span>{result.streak >= 2 ? `${result.streak} in a row · ` : ''}{result.points} pts</span>
          </div>
        </div>
      ) : (
        <button className="back" onClick={onBack} aria-label="Back to my badge">←</button>
      )}

      <header className="lesson-head">
        <div className="tags">
          <span className="chip">Stop {index + 1} of {total}</span>
          <span className="chip">2-minute read</span>
        </div>
        <h1>{l.title}</h1>
        <p>{l.subtitle}</p>
      </header>

      <div className="numbers">
        {l.numbers.map((n, i) => (
          <div key={n.label}>
            <b className={i === 0 ? 'accent' : ''}>{n.value}</b>
            <span>{n.label}</span>
          </div>
        ))}
      </div>

      <section className="story">
        <h2>The story</h2>
        {l.story.map((p) => (
          <p key={p.lead}><b>{p.lead}</b> {p.text}</p>
        ))}
      </section>

      {l.timeline.length > 0 && (
        <section>
          <h2>Timeline</h2>
          <ol className="timeline">
            {l.timeline.map((t) => (
              <li key={t.year + t.text}>
                <b>{t.year}</b>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="context">
        <span className="label">In context</span>
        <h3>{l.context.title}</h3>
        <p>{l.context.text}</p>
      </section>

      <section>
        <h2>Look closer</h2>
        <p className="section-sub">You’re standing here. Tick what you spot.</p>
        <div className="spots">
          {l.lookCloser.map((s, i) => {
            const on = spotted.includes(i)
            return (
              <button key={s.title} className={on ? 'spot on' : 'spot'} aria-pressed={on} onClick={() => onSpot(i)}>
                <span className="box" aria-hidden="true">{on ? '✓' : ''}</span>
                <span><b>{s.title}</b> {s.text}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2>Spanish words</h2>
        <dl className="words">
          {l.words.map((w) => (
            <div key={w.es}>
              <dt lang="es">{w.es}</dt>
              <dd>{w.en}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="think">
        <span className="label">Think about it</span>
        <p>{l.think}</p>
      </section>

      <section>
        <div className="check-head">
          <h2>Quick check</h2>
          <span className={answered ? (right ? 'bonus won' : 'bonus') : 'bonus'}>{answered ? (right ? `+${CHECK_BONUS} earned` : 'No bonus') : `+${CHECK_BONUS}`}</span>
        </div>
        <p className="check-q">{l.check.question}</p>
        <div className={l.check.options.some((o) => o.length > 12) ? 'check-options stacked' : 'check-options'}>
          {l.check.options.map((o) => {
            const state = !answered ? '' : o === l.check.answer ? ' right' : o === picked ? ' wrong' : ' dim'
            return (
              <button key={o} className={`check-option${state}`} disabled={answered} onClick={() => onCheck(o)}>
                {o}
              </button>
            )
          })}
        </div>
        {answered && <p className={right ? 'check-msg right' : 'check-msg'} role="status">{right ? 'Right! You were paying attention.' : `The answer is ${l.check.answer}.`}</p>}
      </section>

      <section className="sources">
        <span>Sources</span>
        <p>
          {l.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
            </span>
          ))}
        </p>
        {stop.verification.status === 'draft' && <p>Not verified on site yet</p>}
      </section>

      <div className="lesson-cta">
        <button className="btn primary" onClick={onAction}>{actionLabel}</button>
      </div>
    </main>
  )
}
