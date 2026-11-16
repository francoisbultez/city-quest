import { useEffect, useRef, useState } from 'react'
import { buzz, confetti, wrongLine } from '../lib/fun'
import { distanceM, MAX_GPS_SLACK_M, normalize } from '../lib/route'
import { cluePoints, HINT_COST, warmth } from '../lib/score'
import { load, reportClue, save } from '../lib/storage'
import { useGeolocation, type Position } from '../lib/useGeolocation'
import type { ClueNode, Hunt } from '../types'
import { Modal } from './Modal'
import { RouteMap } from './RouteMap'
import { Stamp } from './Stamp'
import { totalScore, type Progress } from '../lib/progress'

interface Props {
  hunt: Hunt
  nodes: ClueNode[]
  progress: Progress
  onProgress: (p: Progress) => void
  onQuit: () => void
}

const REASONS = ['Can’t find it', 'Answer looks wrong', 'Covered or closed', 'Other']
const KEYS = 'ABCDEF'

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`
}

/** `?test` in the URL turns on test mode (remembered on this device; `?test=off` turns it off). */
function readTestMode(): boolean {
  const param = new URLSearchParams(window.location.search).get('test')
  if (param !== null) save('cq.testMode', param !== 'off')
  return load('cq.testMode', false)
}

/** Counts up to `value` when it changes. */
function useCountUp(value: number) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 700)
      setShown(Math.round(a + (value - a) * (1 - (1 - k) ** 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return shown
}

export function Play({ hunt, nodes, progress, onProgress, onQuit }: Props) {
  const gps = useGeolocation()
  const [testMode] = useState(readTestMode)
  const [fakePos, setFakePos] = useState<Position | null>(null)
  const pos = fakePos ?? gps.pos
  const error = gps.error

  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'leave' | 'report' | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [details, setDetails] = useState('')

  const node = nodes[progress.index]
  const dist = pos ? distanceM(pos, node.place) : null
  const inside = dist !== null && dist <= node.place.radiusM + Math.min(pos!.accuracy, MAX_GPS_SLACK_M)
  const heat = dist !== null ? (inside ? warmth(0, 1) : warmth(dist, node.place.radiusM)) : null
  const isLast = progress.index === nodes.length - 1
  const score = useCountUp(totalScore(progress))
  const earned = progress.earned[node.id]

  const go = (patch: Partial<Progress>) => onProgress({ ...progress, ...patch })

  // A small buzz the moment you arrive.
  const wasInside = useRef(false)
  useEffect(() => {
    if (inside && !wasInside.current && progress.phase === 'travel') buzz(60)
    wasInside.current = inside
  }, [inside, progress.phase])

  const check = (value: string) => {
    const q = node.question
    const ok = q.kind === 'choice' ? value === q.answer : q.answers.some((a) => normalize(a) === normalize(value))
    if (ok) {
      setWrong(null)
      const result = cluePoints({ wrongs: progress.wrongs, hinted: progress.hinted })
      go({ phase: 'solved', earned: { ...progress.earned, [node.id]: result } })
      confetti()
      buzz([30, 40, 30])
    } else {
      setWrong(value)
      buzz(120)
      go({ wrongs: progress.wrongs + 1 })
    }
  }

  const next = () => {
    setAnswer('')
    setWrong(null)
    go({ index: progress.index + 1, phase: 'travel', wrongs: 0, hinted: false })
  }

  const sendReport = () => {
    const text = [reason, details.trim()].filter(Boolean).join(': ')
    if (!text) return
    reportClue({ huntId: hunt.id, nodeId: node.id, reason: text, at: new Date().toISOString() })
    setDialog(null)
    setReason(null)
    setDetails('')
    setToast('Thanks! Report saved on this phone.')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <main className="play">
      <RouteMap nodes={nodes} current={progress.index} pos={pos} />

      <header className="topbar">
        <button className="icon-btn" onClick={() => setDialog('leave')} aria-label="Leave hunt">✕</button>
        <div className="step-pill">
          <span>Clue {progress.index + 1} / {nodes.length}</span>
          <span className="dots" aria-hidden="true">
            {nodes.map((n, i) => (
              <i key={n.id} className={i < progress.index ? 'done' : i === progress.index ? 'now' : ''} />
            ))}
          </span>
        </div>
        <div className="score-pill" aria-label={`${totalScore(progress)} points`}>
          <span className="star" aria-hidden="true">★</span><b data-testid="score">{score}</b>
        </div>
      </header>

      <section className="sheet" key={`${node.id}-${progress.phase}`}>
        <div className="sheet-head">
          <div className="meta">
            <span className="stop-no">Stop {progress.index + 1}</span>
            {node.verification.status === 'draft' && <span className="badge">Not verified on site yet</span>}
          </div>
          <h2>{node.title}</h2>
        </div>

        {progress.phase === 'travel' && (
          <>
            <p className="lead">{node.lead}</p>
            <div className={inside ? 'geo here' : 'geo'}>
              <div className="geo-row">
                <div>
                  {inside ? (
                    <strong>You’re here!</strong>
                  ) : dist !== null ? (
                    <strong>{formatDistance(dist)} away</strong>
                  ) : (
                    <strong>Finding you…</strong>
                  )}
                  <span>{inside ? 'Open the clue and look around' : dist !== null ? 'Walk to the circle on the map' : error ?? 'Allow location to track your walk'}</span>
                </div>
                {heat && <span className={`heat ${inside ? 'heat-found' : `heat-${heat.label.toLowerCase()}`}`}>{inside ? 'Found it' : heat.label}</span>}
              </div>
              <div className="meter" aria-hidden="true" style={{ ['--fill' as string]: `${(heat?.level ?? 0.03) * 100}%` }}>
                <span />
              </div>
            </div>
            <button className="primary" disabled={!inside} onClick={() => go({ phase: 'question' })}>
              {inside ? 'Open the clue' : 'Get closer to open the clue'}
            </button>
            <button className="link" onClick={() => go({ phase: 'question' })}>
              GPS not working? I’m there
            </button>
            {testMode && (
              <button className="test-btn" onClick={() => setFakePos({ lat: node.place.lat, lng: node.place.lng, accuracy: 5 })}>
                🧪 Teleport to this stop
              </button>
            )}
          </>
        )}

        {progress.phase === 'question' && (
          <>
            <p className="prompt">{node.question.prompt}</p>
            {node.question.kind === 'choice' ? (
              <div className="options">
                {node.question.options.map((o, i) => (
                  <button key={o} className={wrong === o ? 'option shake' : 'option'} onClick={() => check(o)}>
                    <span className="key" aria-hidden="true">{KEYS[i]}</span>
                    {o}
                  </button>
                ))}
              </div>
            ) : (
              <form
                className="answer"
                onSubmit={(e) => {
                  e.preventDefault()
                  check(answer)
                }}
              >
                <input id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" autoFocus autoComplete="off" />
                <button className="primary" type="submit">Check</button>
              </form>
            )}
            {wrong !== null && <p className="warn" role="status">{wrongLine(progress.wrongs - 1)}</p>}
            {progress.hinted ? (
              <p className="hint"><span aria-hidden="true">💡</span>{node.hint}</p>
            ) : (
              <button className="link hint-btn" onClick={() => go({ hinted: true, hintsUsed: progress.hintsUsed + 1 })}>
                Need a hint? <small>−{HINT_COST} pts</small>
              </button>
            )}
          </>
        )}

        {progress.phase === 'solved' && earned && (
          <div className="success">
            <div className="success-top">
              <Stamp node={node} index={progress.index} perfect={earned.perfect} size={104} />
              <div>
                <span className="points-pop">+{earned.points}</span>
                <strong className="success-title">{earned.perfect ? 'Perfect!' : 'Solved!'}</strong>
                <span className="success-sub">Stamp collected</span>
              </div>
            </div>
            <p className="reveal">{node.reveal}</p>
            <button className="primary" onClick={isLast ? () => go({ index: nodes.length }) : next}>
              {isLast ? 'Finish the hunt' : 'Next clue →'}
            </button>
          </div>
        )}

        <button className="link subtle" onClick={() => setDialog('report')}>Report a problem with this clue</button>
      </section>

      {dialog === 'leave' && (
        <Modal title="Leave this hunt?" onClose={() => setDialog(null)}>
          <p>Your progress and points on this phone will be lost.</p>
          <div className="actions">
            <button className="primary danger" onClick={onQuit}>Yes, leave</button>
            <button className="secondary" onClick={() => setDialog(null)}>Keep playing</button>
          </div>
        </Modal>
      )}

      {dialog === 'report' && (
        <Modal title="What’s wrong with this clue?" onClose={() => setDialog(null)}>
          <div className="reasons">
            {REASONS.map((r) => (
              <button key={r} className={reason === r ? 'on' : ''} aria-pressed={reason === r} onClick={() => setReason(reason === r ? null : r)}>
                {r}
              </button>
            ))}
          </div>
          <textarea id="report-details" placeholder="Details (optional), e.g. the plaque is covered by a stage" value={details} onChange={(e) => setDetails(e.target.value)} />
          <div className="actions">
            <button className="primary" disabled={!reason && !details.trim()} onClick={sendReport}>Send report</button>
            <button className="secondary" onClick={() => setDialog(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
