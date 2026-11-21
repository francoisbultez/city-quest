import { routeKm } from '../../lib/route'
import type { RouteStatus } from '../../lib/cities'
import type { Route } from '../../types'
import { Badge } from '../Badge'

function StatusLine({ status }: { status: RouteStatus }) {
  if (status.kind === 'progress') return <span className="status progress">In progress · stop {status.stop} of {status.total}</span>
  if (status.kind === 'earned')
    return (
      <span className="status earned">
        <span aria-label={`${status.stars} of 3 stars`}>{'★'.repeat(status.stars)}<i>{'★'.repeat(3 - status.stars)}</i></span> Your best: {status.points} points
      </span>
    )
  return <span className="status new">Not played yet</span>
}

/** A route as a card: big for the home carousel, compact for lists. */
export function RouteCard({ route, status, onOpen, compact = false }: { route: Route; status: RouteStatus; onOpen: () => void; compact?: boolean }) {
  const meta = [`${routeKm(route.stops).toFixed(1)} km`, route.duration, `${route.stops.length} stops`]
  if (compact) {
    return (
      <button className="route-row" onClick={onOpen}>
        <Badge size={72} route={route} label="" />
        <span className="txt">
          <span className="name">
            <b>{route.name}</b>
            {route.kind && <span className="kind">{route.kind}</span>}
          </span>
          <span className="tagline">{route.tagline}</span>
          <span className="meta">{meta.join(' · ')}</span>
          <StatusLine status={status} />
        </span>
      </button>
    )
  }
  return (
    <button className="route-tile" onClick={onOpen} aria-label={`${route.name}: ${route.tagline}`}>
      <span className="top">
        <Badge size={96} route={route} label="" />
        {route.kind && <span className="kind">{route.kind}</span>}
      </span>
      <span className="name">{route.name}</span>
      <span className="tagline">{route.tagline}</span>
      <span className="chips">
        {meta.map((m) => (
          <span key={m} className="chip">{m}</span>
        ))}
      </span>
      <StatusLine status={status} />
    </button>
  )
}
