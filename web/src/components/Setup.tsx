import { useMemo, useState } from 'react'
import { buildRoute, routeKm } from '../lib/route'
import { maxScore } from '../lib/score'
import type { Hunt, Pace, Settings } from '../types'

// The core story needs ~80 min. Shorter options come once the hunt has more optional nodes.
const BUDGETS: { min: number; label: string }[] = [
  { min: 95, label: 'About 1.5 h' },
  { min: 120, label: '2 h or more' },
]
const PACES: { id: Pace; label: string }[] = [
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'normal', label: 'Normal' },
  { id: 'brisk', label: 'Brisk' },
]

function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  return h ? `${h}h${String(m % 60).padStart(2, '0')}` : `${m}m`
}

export function Setup({ hunt, onStart }: { hunt: Hunt; onStart: (s: Settings, nodeIds: string[]) => void }) {
  const [settings, setSettings] = useState<Settings>({ budgetMin: 120, pace: 'normal', stepFreeOnly: false })
  const route = useMemo(() => buildRoute(hunt.nodes, settings), [hunt, settings])
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  return (
    <main className="setup">
      <header className="hero">
        <div className="shapes" aria-hidden="true">
          <i className="s-sun" />
          <i className="s-arch" />
          <i className="s-square" />
          <i className="s-dot" />
        </div>
        <span className="chip">{hunt.city} · City Quest</span>
        <h1>{hunt.title}</h1>
        <p className="tagline">{hunt.tagline}</p>
      </header>

      <div className="stickers" aria-label="Route at a glance">
        <span className="sticker s1"><b>{route.nodes.length}</b> stops</span>
        <span className="sticker s2"><b>{routeKm(route.nodes).toFixed(1)}</b> km</span>
        <span className="sticker s3"><b>{formatMinutes(route.minutes)}</b></span>
        <span className="sticker s4"><b>{maxScore(route.nodes.length)}</b> pts to win</span>
      </div>

      <section className="how">
        <div><span className="how-n n1">1</span><b>Walk</b><small>Follow the story to each stop</small></div>
        <div><span className="how-n n2">2</span><b>Look</b><small>The answer is only visible on the spot</small></div>
        <div><span className="how-n n3">3</span><b>Collect</b><small>Earn points and a stamp per stop</small></div>
      </section>

      <section className="story">
        <span className="label">The story</span>
        <p>{hunt.intro}</p>
      </section>

      <section className="plan">
        <h2>Plan your route</h2>

        <div className="field">
          <span className="label" id="time-label">Time you have</span>
          <div className="segmented" role="group" aria-labelledby="time-label">
            {BUDGETS.map((b) => (
              <button key={b.min} className={b.min === settings.budgetMin ? 'on' : ''} aria-pressed={b.min === settings.budgetMin} onClick={() => set({ budgetMin: b.min })}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label" id="pace-label">Walking pace</span>
          <div className="segmented" role="group" aria-labelledby="pace-label">
            {PACES.map((p) => (
              <button key={p.id} className={p.id === settings.pace ? 'on' : ''} aria-pressed={p.id === settings.pace} onClick={() => set({ pace: p.id })}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="switch">
          <span>
            Step-free route (wheelchair, buggy)
            <small>Skips stops with stairs</small>
          </span>
          <input id="step-free" type="checkbox" checked={settings.stepFreeOnly} onChange={(e) => set({ stepFreeOnly: e.target.checked })} />
        </label>

        <div className="summary" aria-live="polite">
          <strong>{route.nodes.length} stops</strong>
          <span>about {route.minutes} min · {routeKm(route.nodes).toFixed(1)} km</span>
          {!route.fits && <p className="warn">The core story needs about {route.minutes} min, so this is the shortest version.</p>}
        </div>
      </section>

      <div className="cta-bar">
        <div>
          <button className="primary" onClick={() => onStart(settings, route.nodes.map((n) => n.id))}>
            Start the hunt
          </button>
          <p className="fine">Starts at the Puerta del Sol · your location stays on your phone</p>
        </div>
      </div>
    </main>
  )
}
