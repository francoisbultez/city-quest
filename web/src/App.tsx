import { useEffect, useMemo, useState } from 'react'
import { Play } from './components/Play'
import { Setup } from './components/Setup'
import { Stamp } from './components/Stamp'
import { hunts } from './content/madrid-bear'
import { confetti } from './lib/fun'
import { maxScore, rankFor } from './lib/score'
import { freshProgress, totalScore } from './lib/progress'
import { load, save } from './lib/storage'
import type { Progress } from './lib/progress'
import type { Settings } from './types'

interface Session {
  huntId: string
  settings: Settings
  nodeIds: string[]
  progress: Progress
}

const KEY = 'cq.session'

/** Sessions saved by older versions lack the scoring fields. */
function loadSession(): Session | null {
  const s = load<Session | null>(KEY, null)
  return s ? { ...s, progress: { ...freshProgress(), ...s.progress } } : null
}

function Finish({ session, onRestart }: { session: Session; onRestart: () => void }) {
  const hunt = hunts.find((h) => h.id === session.huntId) ?? hunts[0]
  const nodes = session.nodeIds.map((id) => hunt.nodes.find((n) => n.id === id)!).filter(Boolean)
  const score = totalScore(session.progress)
  const rank = rankFor(score, nodes.length)
  const perfect = Object.values(session.progress.earned).filter((e) => e.perfect).length
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => {
    const t = setTimeout(() => confetti({ x: 0.5, y: 0.35 }), 300)
    return () => clearTimeout(t)
  }, [])

  const share = async () => {
    const text = `I scored ${score} points and earned “${rank.title}” on ${hunt.title}, a treasure hunt through ${hunt.city}.`
    const url = window.location.origin + window.location.pathname
    try {
      if (navigator.share) await navigator.share({ title: hunt.title, text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setToast('Copied. Paste it anywhere.')
        setTimeout(() => setToast(null), 2500)
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <main className="finish">
      <section className="rank-card">
        <span className="label">Hunt complete</span>
        <div className="big-score"><b data-testid="final-score">{score}</b><span>/ {maxScore(nodes.length)} pts</span></div>
        <h1>{rank.title}</h1>
        <p>{rank.line}</p>
      </section>

      <section className="passport">
        <div className="passport-head">
          <h2>Your stamps</h2>
          <span>{nodes.length} / {nodes.length}</span>
        </div>
        <div className="stamp-grid">
          {nodes.map((n, i) => (
            <Stamp key={n.id} node={n} index={i} perfect={session.progress.earned[n.id]?.perfect} size={76} />
          ))}
        </div>
      </section>

      <div className="stats">
        <div><strong>{nodes.length}</strong><span>clues solved</span></div>
        <div><strong>{perfect}</strong><span>perfect</span></div>
        <div><strong>{session.progress.hintsUsed}</strong><span>hints used</span></div>
      </div>

      <p className="outro">{hunt.outro}</p>

      <div className="actions">
        <button className="primary" onClick={share}>Share my score</button>
        <button className="secondary" onClick={onRestart}>Back to start</button>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession)
  const update = (s: Session | null) => {
    setSession(s)
    save(KEY, s)
  }

  const hunt = hunts.find((h) => h.id === session?.huntId) ?? hunts[0]
  const nodes = useMemo(
    () => (session ? session.nodeIds.map((id) => hunt.nodes.find((n) => n.id === id)!).filter(Boolean) : []),
    [session, hunt],
  )

  if (!session) {
    return <Setup hunt={hunt} onStart={(settings, nodeIds) => update({ huntId: hunt.id, settings, nodeIds, progress: freshProgress() })} />
  }

  if (session.progress.index >= nodes.length) {
    return <Finish session={session} onRestart={() => update(null)} />
  }

  return (
    <Play
      hunt={hunt}
      nodes={nodes}
      progress={session.progress}
      onProgress={(progress) => update({ ...session, progress })}
      onQuit={() => update(null)}
    />
  )
}
