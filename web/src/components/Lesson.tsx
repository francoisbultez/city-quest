import { useEffect, useRef, useState } from 'react'
import { CHECK_BONUS } from '../lib/game'
import { lessonScript } from '../lib/lessonScript'
import { speak, speechSupported } from '../lib/speech'
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
  /** The route's language, for the read-aloud voice. */
  lang?: string
  /** The local language, for the words section, e.g. { code: "es", name: "Spanish" }. */
  localLanguage?: { code: string; name: string }
}

export function Lesson({ stop, index, total, result, picked, spotted, onCheck, onSpot, actionLabel, onAction, onBack, lang = 'en', localLanguage }: Props) {
  const l = stop.lesson
  const answered = picked !== undefined
  const right = picked === l.check?.answer

  // A new lesson starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stop.id])

  // Read the lesson aloud with the phone's built-in voice.
  const [canListen] = useState(speechSupported)
  const [playing, setPlaying] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  useEffect(() => () => stopRef.current?.(), [])
  const toggleListen = () => {
    if (playing) {
      stopRef.current?.()
      return
    }
    setPlaying(true)
    stopRef.current = speak(lessonScript(stop), {
      lang,
      onEnd: () => {
        setPlaying(false)
        stopRef.current = null
      },
    })
  }
  const act = (fn?: () => void) => () => {
    stopRef.current?.()
    fn?.()
  }

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
        <button className="back" onClick={act(onBack)} aria-label="Back to my badge">←</button>
      )}

      <header className="lesson-head">
        <div className="tags">
          <span className="chip">Stop {index + 1} of {total}</span>
          <span className="chip">2-minute read</span>
          {canListen && (
            <button className={playing ? 'chip listen on' : 'chip listen'} onClick={toggleListen} aria-pressed={playing}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24">{playing ? <><rect x="5" y="4" width="5" height="16" rx="1.5" /><rect x="14" y="4" width="5" height="16" rx="1.5" /></> : <path d="M7 4.5v15l13-7.5z" />}</svg>
              {playing ? 'Stop' : 'Listen'}
            </button>
          )}
        </div>
        <h1>{l.title}</h1>
        {l.subtitle && <p>{l.subtitle}</p>}
      </header>

      {l.image && (
        <figure className="lesson-photo">
          <img src={l.image.src} alt={l.image.alt} loading="eager" decoding="async" style={{ objectPosition: l.image.position ?? '50% 50%' }} />
          <figcaption>
            Photo: {l.image.credit.artist} ·{' '}
            {l.image.credit.licenseUrl ? <a href={l.image.credit.licenseUrl} target="_blank" rel="noreferrer">{l.image.credit.license}</a> : l.image.credit.license}
            {' · '}
            <a href={l.image.credit.page} target="_blank" rel="noreferrer">{l.image.credit.site ?? 'Source'}</a>
          </figcaption>
        </figure>
      )}

      {l.numbers && l.numbers.length > 0 && <div className="numbers">
        {l.numbers.map((n, i) => (
          <div key={n.label}>
            <b className={i === 0 ? 'accent' : ''}>{n.value}</b>
            <span>{n.label}</span>
          </div>
        ))}
      </div>}

      {l.story && l.story.length > 0 && (
        <section className="story">
          <h2>The story</h2>
          {l.story.map((p) => (
            <p key={p.lead}><b>{p.lead}</b> {p.text}</p>
          ))}
        </section>
      )}

      {l.timeline && l.timeline.length > 0 && (
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

      {l.context && (
        <section className="context">
          <span className="label">In context</span>
          <h3>{l.context.title}</h3>
          <p>{l.context.text}</p>
        </section>
      )}

      {l.lookCloser && l.lookCloser.length > 0 && <section>
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
      </section>}

      {l.words && l.words.length > 0 && (
        <section>
          <h2>{localLanguage ? `${localLanguage.name} words` : 'Local words'}</h2>
          <dl className="words">
            {l.words.map((w) => (
              <div key={w.word}>
                <dt lang={localLanguage?.code}>{w.word}</dt>
                <dd>{w.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {l.think && (
        <section className="think">
          <span className="label">Think about it</span>
          <p>{l.think}</p>
        </section>
      )}

      {l.check && <section>
        <div className="check-head">
          <h2>Quick check</h2>
          <span className={answered ? (right ? 'bonus won' : 'bonus') : 'bonus'}>{answered ? (right ? `+${CHECK_BONUS} earned` : 'No bonus') : `+${CHECK_BONUS}`}</span>
        </div>
        <p className="check-q">{l.check.question}</p>
        <div className={l.check.options.some((o) => o.length > 12) ? 'check-options stacked' : 'check-options'}>
          {l.check.options.map((o) => {
            const state = !answered ? '' : o === l.check!.answer ? ' right' : o === picked ? ' wrong' : ' dim'
            return (
              <button key={o} className={`check-option${state}`} disabled={answered} onClick={() => onCheck(o)}>
                {o}
              </button>
            )
          })}
        </div>
        {answered && <p className={right ? 'check-msg right' : 'check-msg'} role="status">{right ? 'Right! You were paying attention.' : `The answer is ${l.check.answer}.`}</p>}
      </section>}

      <section className="sources">
        {l.sources && l.sources.length > 0 && <span>Sources</span>}
        <p>
          {(l.sources ?? []).map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
            </span>
          ))}
        </p>
        {stop.verification.status === 'draft' && <p>Not verified on site yet</p>}
      </section>

      <div className="lesson-cta">
        <button className="btn primary" onClick={act(onAction)}>{actionLabel}</button>
      </div>
    </main>
  )
}

