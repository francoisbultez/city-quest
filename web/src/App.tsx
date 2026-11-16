import { useMemo, useState } from 'react'
import { Play, type Progress } from './components/Play'
import { Setup } from './components/Setup'
import { hunts } from './content/madrid-bear'
import { load, save } from './lib/storage'
import type { Settings } from './types'

interface Session {
  huntId: string
  settings: Settings
  nodeIds: string[]
  progress: Progress
}

const KEY = 'cq.session'

export default function App() {
  const [session, setSession] = useState<Session | null>(() => load<Session | null>(KEY, null))
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
    return (
      <Setup
        hunt={hunt}
        onStart={(settings, nodeIds) =>
          update({ huntId: hunt.id, settings, nodeIds, progress: { index: 0, phase: 'travel', hintsUsed: 0 } })
        }
      />
    )
  }

  if (session.progress.index >= nodes.length) {
    return (
      <main className="screen done">
        <p className="eyebrow">Hunt complete</p>
        <h1>{hunt.title}</h1>
        <p className="intro">{hunt.outro}</p>
        <div className="stats">
          <div><strong>{nodes.length}</strong><span>clues solved</span></div>
          <div><strong>{session.progress.hintsUsed}</strong><span>hints used</span></div>
        </div>
        <button className="primary" onClick={() => update(null)}>Back to start</button>
      </main>
    )
  }

  return (
    <Play
      hunt={hunt}
      nodes={nodes}
      progress={session.progress}
      onProgress={(progress) => update({ ...session, progress })}
      onQuit={() => {
        if (window.confirm('Leave this hunt? Your progress will be lost.')) update(null)
      }}
    />
  )
}
