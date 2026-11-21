import { useState } from 'react'
import { badgesIn, routeStatus, type City } from '../../lib/cities'
import type { EarnedBadge, Session } from '../../lib/session'
import type { Route } from '../../types'
import { IconChevron } from '../icons'
import { RouteCard } from './RouteCard'

const FILTERS_FROM = 4

/** Every route in a city, with filters by type once there are enough to need them. */
export function CityRoutes({ city, badges, session, onOpen, onBack }: { city: City; badges: EarnedBadge[]; session: Session | null; onOpen: (r: Route) => void; onBack: () => void }) {
  const kinds = [...new Set(city.routes.map((r) => r.kind).filter((k): k is string => !!k))]
  const [kind, setKind] = useState<string | null>(null)
  const shown = city.routes.filter((r) => !kind || r.kind === kind)
  const n = city.routes.length
  return (
    <main className="home browse enter">
      <header className="sub-head">
        <button className="round" onClick={onBack} aria-label="Back">
          <IconChevron dir="left" size={18} />
        </button>
        <div>
          <h1>{city.name}</h1>
          <p>{n} {n === 1 ? 'route' : 'routes'} · {badgesIn(city, badges)} of {n} {n === 1 ? 'badge' : 'badges'} earned</p>
        </div>
      </header>

      {n >= FILTERS_FROM && kinds.length > 1 && (
        <div className="filters" role="group" aria-label="Filter routes">
          {[null, ...kinds].map((k) => (
            <button key={k ?? 'all'} className={kind === k ? 'on' : ''} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k ?? 'All'}
            </button>
          ))}
        </div>
      )}

      <div className="route-list">
        {shown.map((r) => (
          <RouteCard key={r.id} compact route={r} status={routeStatus(r, badges, session)} onOpen={() => onOpen(r)} />
        ))}
      </div>
    </main>
  )
}
