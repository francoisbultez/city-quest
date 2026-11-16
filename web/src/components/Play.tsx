import { useState } from 'react'
import { distanceM, MAX_GPS_SLACK_M, normalize } from '../lib/route'
import { load, reportClue, save } from '../lib/storage'
import { useGeolocation, type Position } from '../lib/useGeolocation'
import type { ClueNode, Hunt } from '../types'
import { RouteMap } from './RouteMap'

export type Phase = 'travel' | 'question' | 'solved'

export interface Progress {
  index: number
  phase: Phase
  hintsUsed: number
}

interface Props {
  hunt: Hunt
  nodes: ClueNode[]
  progress: Progress
  onProgress: (p: Progress) => void
  onQuit: () => void
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`
}

/** `?test` in the URL turns on test mode (remembered on this device; `?test=off` turns it off). */
function readTestMode(): boolean {
  const param = new URLSearchParams(window.location.search).get('test')
  if (param !== null) save('cq.testMode', param !== 'off')
  return load('cq.testMode', false)
}

export function Play({ hunt, nodes, progress, onProgress, onQuit }: Props) {
  const gps = useGeolocation()
  const [testMode] = useState(readTestMode)
  const [fakePos, setFakePos] = useState<Position | null>(null)
  const pos = fakePos ?? gps.pos
  const error = gps.error
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const node = nodes[progress.index]
  const dist = pos ? distanceM(pos, node.place) : null
  const inside = dist !== null && dist <= node.place.radiusM + Math.min(pos!.accuracy, MAX_GPS_SLACK_M)
  const isLast = progress.index === nodes.length - 1

  const go = (patch: Partial<Progress>) => onProgress({ ...progress, ...patch })

  const check = (value: string) => {
    const q = node.question
    const ok =
      q.kind === 'choice' ? value === q.answer : q.answers.some((a) => normalize(a) === normalize(value))
    if (ok) {
      setWrong(false)
      go({ phase: 'solved' })
    } else {
      setWrong(true)
    }
  }

  const next = () => {
    setAnswer('')
    setShowHint(false)
    setWrong(false)
    go({ index: progress.index + 1, phase: 'travel' })
  }

  const report = () => {
    const reason = window.prompt('What is wrong with this clue? (e.g. statue covered, plaque missing)')
    if (!reason) return
    reportClue({ huntId: hunt.id, nodeId: node.id, reason, at: new Date().toISOString() })
    setToast('Thanks! Your report is saved on this phone and will be sent once we have a server.')
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <main className="screen play">
      <RouteMap nodes={nodes} current={progress.index} pos={pos} />

      <header className="topbar">
        <button className="ghost" onClick={onQuit} aria-label="Leave hunt">✕</button>
        <span>
          Clue {progress.index + 1} / {nodes.length}
        </span>
        <span className="progress">
          <span style={{ width: `${(progress.index / nodes.length) * 100}%` }} />
        </span>
      </header>

      <section className="sheet">
        <div className="sheet-head">
          <h2>{node.title}</h2>
          {node.verification.status === 'draft' && <span className="badge">Not verified on site yet</span>}
        </div>

        {progress.phase === 'travel' && (
          <>
            <p className="lead">{node.lead}</p>
            <div className="geo">
              {error && !pos && <span>{error}</span>}
              {dist !== null && (inside ? <strong>You’re here!</strong> : <span>{formatDistance(dist)} away</span>)}
            </div>
            <button className="primary" disabled={!inside} onClick={() => go({ phase: 'question' })}>
              {inside ? 'Open the clue' : 'Get closer to open the clue'}
            </button>
            <button className="link" onClick={() => go({ phase: 'question' })}>
              GPS not working? I’m there
            </button>
            {testMode && (
              <button
                className="test-btn"
                onClick={() => setFakePos({ lat: node.place.lat, lng: node.place.lng, accuracy: 5 })}
              >
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
                {node.question.options.map((o) => (
                  <button key={o} className="option" onClick={() => check(o)}>
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
                <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" autoFocus />
                <button className="primary" type="submit">Check</button>
              </form>
            )}
            {wrong && <p className="warn">Not quite. Look again.</p>}
            {showHint ? (
              <p className="hint">💡 {node.hint}</p>
            ) : (
              <button
                className="link"
                onClick={() => {
                  setShowHint(true)
                  go({ hintsUsed: progress.hintsUsed + 1 })
                }}
              >
                Need a hint?
              </button>
            )}
          </>
        )}

        {progress.phase === 'solved' && (
          <>
            <p className="reveal">✓ {node.reveal}</p>
            <button className="primary" onClick={isLast ? () => go({ index: nodes.length }) : next}>
              {isLast ? 'Finish the hunt' : 'Next clue'}
            </button>
          </>
        )}

        <button className="link subtle" onClick={report}>Report a problem with this clue</button>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
