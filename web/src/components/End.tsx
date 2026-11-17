import { useEffect, useState } from 'react'
import { confetti } from '../lib/fx'
import { bestStreak, formatDuration, maxPoints, starsFor, totalPoints } from '../lib/game'
import { routeKm } from '../lib/route'
import type { Session } from '../lib/session'
import type { Route } from '../types'
import { Badge, Stars } from './Badge'

const STEPS_PER_KM = 1400

export function End({ route, session, onHome }: { route: Route; session: Session; onHome: () => void }) {
  const total = route.stops.length
  const points = totalPoints(session.results)
  const stars = starsFor(points, total)
  const firstTry = session.results.filter((r) => r.perfect).length
  const km = routeKm(route.stops)
  const elapsed = (session.finishedAt ?? session.startedAt) - session.startedAt
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => confetti({ x: 0.5, y: 0.25 }), 250)
    return () => clearTimeout(t)
  }, [])

  const share = async () => {
    const text = `I earned the ${route.city} · ${route.name} badge on City Quest: ${stars} of 3 stars, ${points} points.`
    const url = window.location.origin + window.location.pathname
    try {
      if (navigator.share) await navigator.share({ title: `${route.city} · ${route.name}`, text, url })
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
    <main className="end">
      <span className="unlocked">New badge unlocked</span>
      <div className="badge-hero">
        <Badge size={200} line={route.badgeLine} />
      </div>
      <Stars count={stars} />
      <h1>{route.city} · {route.name}</h1>
      <p className="sub">Solo · {stars} of 3 stars · completed today</p>

      <div className="stats">
        <div><span>Points</span><b className="accent" data-testid="final-score">{points}</b><small>of {maxPoints(total)}</small></div>
        <div><span>First try</span><b>{firstTry}/{total}</b><small>best streak: {bestStreak(session.results)}</small></div>
        <div><span>Walked</span><b>{km.toFixed(1)}<i>{"\u00a0"}km</i></b><small>about {(Math.round((km * STEPS_PER_KM) / 100) * 100).toLocaleString('en')} steps</small></div>
        <div><span>Time</span><b>{formatDuration(elapsed)}</b><small>{total} places found</small></div>
      </div>

      <div className="end-actions">
        <button className="btn primary" onClick={share}>Share my badge</button>
        <button className="btn quiet" onClick={onHome}>Back to start</button>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
