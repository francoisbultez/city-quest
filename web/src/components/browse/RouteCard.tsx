import { routeKm } from '../../lib/route'
import type { RouteStatus } from '../../lib/cities'
import type { Route } from '../../types'
import { Badge } from '../Badge'
import { IconClock, IconFlag, IconWalk, Stars } from '../icons'
import { Cover } from './Cover'

export function StatusLine({ status }: { status: RouteStatus }) {
  if (status.kind === 'progress')
    return (
      <span className="status progress">
        <span className="bar" aria-hidden="true"><i style={{ width: `${(100 * (status.stop - 1)) / status.total}%` }} /></span>
        Stop {status.stop} of {status.total}
      </span>
    )
  if (status.kind === 'earned')
    return (
      <span className="status earned">
        <Stars n={status.stars} /> Best {status.points} pts
      </span>
    )
  return <span className="status new">New</span>
}

export function RouteFacts({ route }: { route: Route }) {
  return (
    <span className="facts">
      <span><IconWalk />{routeKm(route.stops).toFixed(1)} km</span>
      <span><IconClock />{route.duration.replace(/^~/, '')}</span>
      <span><IconFlag />{route.stops.length} stops</span>
    </span>
  )
}

/** A route as a card: a big photo card for the home carousel, a row for lists. */
export function RouteCard({ route, status, onOpen, compact = false, tag }: { route: Route; status: RouteStatus; onOpen: () => void; compact?: boolean; tag?: string }) {
  if (compact) {
    return (
      <button className="route-row" onClick={onOpen} aria-label={`${route.name}: ${route.tagline}`}>
        <Cover route={route} className="thumb" />
        <span className="txt">
          {route.kind && <span className="eyebrow">{route.kind}</span>}
          <b>{route.name}</b>
          <RouteFacts route={route} />
          <StatusLine status={status} />
        </span>
      </button>
    )
  }
  return (
    <button className="route-tile" onClick={onOpen} aria-label={`${route.name}: ${route.tagline}`}>
      <span className="photo">
        <Cover route={route} />
        {(tag ?? route.kind) && <span className={tag ? 'pill on-photo tag' : 'pill on-photo'}>{tag ?? route.kind}</span>}
        <span className="tile-badge"><Badge size={64} route={route} label="" /></span>
      </span>
      <span className="body">
        <b className="name">{route.name}</b>
        <span className="tagline">{route.tagline}</span>
        <span className="foot">
          <RouteFacts route={route} />
          <StatusLine status={status} />
        </span>
      </span>
    </button>
  )
}
