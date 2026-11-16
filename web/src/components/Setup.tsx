import { useMemo, useState } from 'react'
import { buildRoute } from '../lib/route'
import type { Hunt, Pace, Settings } from '../types'

// The core story needs ~80 min. Shorter options come once the hunt has more optional nodes.
const BUDGETS = [95, 120]
const PACES: { id: Pace; label: string }[] = [
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'normal', label: 'Normal' },
  { id: 'brisk', label: 'Brisk' },
]

export function Setup({ hunt, onStart }: { hunt: Hunt; onStart: (s: Settings, nodeIds: string[]) => void }) {
  const [settings, setSettings] = useState<Settings>({ budgetMin: 120, pace: 'normal', stepFreeOnly: false })
  const route = useMemo(() => buildRoute(hunt.nodes, settings), [hunt, settings])
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  return (
    <main className="screen setup">
      <p className="eyebrow">{hunt.city} · Treasure hunt</p>
      <h1>{hunt.title}</h1>
      <p className="tagline">{hunt.tagline}</p>
      <p className="intro">{hunt.intro}</p>

      <section className="card">
        <h2>Plan your route</h2>

        <label className="field-label">How much time do you have?</label>
        <div className="chips">
          {BUDGETS.map((b) => (
            <button key={b} className={b === settings.budgetMin ? 'chip on' : 'chip'} onClick={() => set({ budgetMin: b })}>
              {b === 95 ? "About 1.5 h" : "2 h or more"}
            </button>
          ))}
        </div>

        <label className="field-label">Walking pace</label>
        <div className="chips">
          {PACES.map((p) => (
            <button key={p.id} className={p.id === settings.pace ? 'chip on' : 'chip'} onClick={() => set({ pace: p.id })}>
              {p.label}
            </button>
          ))}
        </div>

        <label className="toggle">
          <input type="checkbox" checked={settings.stepFreeOnly} onChange={(e) => set({ stepFreeOnly: e.target.checked })} />
          Step-free route (wheelchair, buggy)
        </label>

        <div className="summary">
          <strong>{route.nodes.length} stops</strong> · about {route.minutes} min
          {!route.fits && <p className="warn">The core story needs about {route.minutes} min, so this is the shortest version.</p>}
        </div>

        <button className="primary" onClick={() => onStart(settings, route.nodes.map((n) => n.id))}>
          Start the hunt
        </button>
        <p className="fine">Start at the Puerta del Sol. Your location stays on your device.</p>
      </section>
    </main>
  )
}
