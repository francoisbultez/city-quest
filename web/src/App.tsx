import { useState } from 'react'
import { Correct } from './components/Correct'
import { End } from './components/End'
import { Home } from './components/Home'
import { Modal } from './components/Modal'
import { Quiz } from './components/Quiz'
import { Walk } from './components/Walk'
import { routes } from './content/madrid-sol'
import { currentStreak, isPerfect, starsFor, stopPoints, totalPoints } from './lib/game'
import { awardBadge, loadBadges, loadSession, newSession, saveSession, type Session } from './lib/session'
import { reportClue } from './lib/storage'

const REASONS = ['Can’t find it', 'Answer looks wrong', 'Covered or closed', 'Other']

export default function App() {
  const route = routes[0]
  const [session, setSession] = useState<Session | null>(loadSession)
  const [badges, setBadges] = useState(loadBadges)
  const [atHome, setAtHome] = useState(true)
  const [pause, setPause] = useState<'menu' | 'report' | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const update = (s: Session | null) => {
    setSession(s)
    saveSession(s)
  }
  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  if (atHome || !session) {
    return (
      <Home
        route={route}
        badges={badges}
        session={session}
        onStart={() => {
          update(newSession(route.id))
          setAtHome(false)
        }}
        onResume={() => setAtHome(false)}
      />
    )
  }

  const s = session
  const stop = route.stops[s.index]
  const total = route.stops.length
  const points = totalPoints(s.results)
  const isLast = s.index === total - 1

  const leave = () => {
    setPause(null)
    update(null)
    setAtHome(true)
  }

  const sheet = pause && (
    <Modal title={pause === 'menu' ? 'Paused' : 'What’s wrong with this stop?'} onClose={() => setPause(null)}>
      {pause === 'menu' ? (
        <div className="actions">
          <button className="btn primary" onClick={() => setPause(null)}>Resume</button>
          <button className="btn soft" onClick={() => setPause('report')}>Report a problem with this stop</button>
          <button className="btn danger-text" onClick={leave}>Leave the route</button>
        </div>
      ) : (
        <>
          <div className="reasons">
            {REASONS.map((r) => (
              <button key={r} className={reason === r ? 'on' : ''} aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>
            ))}
          </div>
          <div className="actions">
            <button
              className="btn primary"
              disabled={!reason}
              onClick={() => {
                reportClue({ huntId: route.id, nodeId: stop.id, reason: reason!, at: new Date().toISOString() })
                setReason(null)
                setPause(null)
                flash('Thanks! Report saved on this phone.')
              }}
            >
              Send report
            </button>
            <button className="btn soft" onClick={() => setPause('menu')}>Back</button>
          </div>
        </>
      )}
    </Modal>
  )

  let screen
  if (s.screen === 'walk') {
    screen = <Walk key={stop.id} stops={route.stops} index={s.index} points={points} onArrive={() => update({ ...s, screen: 'quiz' })} onPause={() => setPause('menu')} />
  } else if (s.screen === 'quiz') {
    screen = (
      <Quiz
        key={stop.id}
        stop={stop}
        index={s.index}
        total={total}
        points={points}
        hinted={s.hinted}
        onHint={() => update({ ...s, hinted: true })}
        onWrong={() => update({ ...s, wrongs: s.wrongs + 1 })}
        onCorrect={() => {
          const result = { id: stop.id, points: stopPoints(s), perfect: isPerfect(s) }
          update({ ...s, screen: 'correct', results: [...s.results, result] })
        }}
      />
    )
  } else if (s.screen === 'correct') {
    const last = s.results[s.results.length - 1]
    screen = (
      <Correct
        stop={stop}
        index={s.index}
        total={total}
        earned={last.points}
        perfect={last.perfect}
        streak={currentStreak(s.results)}
        points={points}
        isLast={isLast}
        onNext={() => {
          if (!isLast) return update({ ...s, screen: 'walk', index: s.index + 1, wrongs: 0, hinted: false })
          const finishedAt = Date.now()
          setBadges(awardBadge({ routeId: route.id, mode: 'solo', stars: starsFor(points, total), points, date: new Date(finishedAt).toISOString() }))
          update({ ...s, screen: 'end', finishedAt })
        }}
      />
    )
  } else {
    screen = (
      <End
        route={route}
        session={s}
        onHome={() => {
          update(null)
          setAtHome(true)
        }}
      />
    )
  }

  return (
    <>
      {screen}
      {sheet}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}
