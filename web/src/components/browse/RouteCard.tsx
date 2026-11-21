import { routeKm } from '../../lib/route'
import type { Route } from '../../types'
import { Stars } from '../icons'
import { Cover } from './Cover'

/** A route as a visitor sees it: how long, how far, where it starts, what it's good for. */
export function RouteCard({ route, played, distanceKm, onOpen }: { route: Route; played?: { stars: number }; distanceKm?: number; onOpen: () => void }) {
  const start = route.startTransit ? `Starts at ${route.startTransit.split(',')[0]}` : `Starts at ${route.start}`
  return (
    <button className="visit-card" onClick={onOpen} aria-label={`${route.name}: ${route.tagline}`}>
      <span className="photo">
        <Cover route={route} />
        <span className="pill on-photo">{route.duration.replace(/^~/, '')} · {routeKm(route.stops).toFixed(1)} km</span>
        {played && (
          <span className="pill on-photo played">
            <Stars n={played.stars} /> Played
          </span>
        )}
      </span>
      <span className="body">
        <b className="name">{route.name}</b>
        <span className="tagline">{route.tagline}</span>
        <span className="tags">
          <span className="tag">{distanceKm !== undefined ? `${distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`} from you` : start}</span>
          {route.highlight && <span className="tag good">{route.highlight}</span>}
        </span>
      </span>
    </button>
  )
}
