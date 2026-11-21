import { useEffect, useRef, useState } from 'react'
import { badgesIn, inSentence, routeStatus, type City } from '../../lib/cities'
import type { EarnedBadge, Session } from '../../lib/session'
import type { Route } from '../../types'
import { RouteCard } from './RouteCard'

interface Props {
  city: City
  badges: EarnedBadge[]
  session: Session | null
  /** Route of the solo game in progress, if any. */
  playingRoute?: Route
  /** Route to show first in the carousel. */
  focusId?: string
  team: string | null
  onCities: () => void
  onSeeAll: () => void
  onOpen: (route: Route) => void
  onResume: () => void
  onTeam: () => void
  onJoinTeam: () => void
}

export function Home({ city, badges, session, playingRoute, focusId, team, onCities, onSeeAll, onOpen, onResume, onTeam, onJoinTeam }: Props) {
  const rail = useRef<HTMLDivElement>(null)
  const start = Math.max(0, city.routes.findIndex((r) => r.id === focusId))
  const [active, setActive] = useState(start)
  const current = city.routes[Math.min(active, city.routes.length - 1)]
  const playing = session && session.screen !== 'end' ? session : null
  const n = city.routes.length

  // Open on the route played or picked last.
  useEffect(() => {
    const el = rail.current?.children[start] as HTMLElement | undefined
    if (el && rail.current) rail.current.scrollLeft = el.offsetLeft - rail.current.offsetLeft - 20
  }, [start, city.key])

  const onScroll = () => {
    const el = rail.current
    if (!el || !el.children.length) return
    const w = (el.children[0] as HTMLElement).offsetWidth + 12
    setActive(Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / w))))
  }

  return (
    <main className="home browse">
      <header className="home-head">
        <button className="city-btn" onClick={onCities} aria-label={`Change city, now ${city.name}`}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          {city.name}
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <span className="chip">{badges.length} {badges.length === 1 ? 'badge' : 'badges'}</span>
      </header>

      {(playing || team) && (
        <div className="resume">
          {playing && playingRoute && (
            <button className="resume-card" onClick={onResume}>
              <b>Continue {inSentence(playingRoute.name)}</b>
              <span>{playingRoute.city} · stop {playing.index + 1} of {playingRoute.stops.length}</span>
            </button>
          )}
          {team && (
            <button className="resume-card" onClick={onTeam}>
              <b>Back to your team · {team}</b>
              <span>Together mode</span>
            </button>
          )}
        </div>
      )}

      <div className="rail-head">
        <h1>{n} {n === 1 ? 'route' : 'routes'} in {city.name}</h1>
        {n > 1 && <button className="link" onClick={onSeeAll}>See all</button>}
      </div>
      <p className="rail-sub">{badgesIn(city, badges)} of {n} {n === 1 ? 'badge' : 'badges'} earned here</p>

      <div className="rail" ref={rail} onScroll={onScroll} role="list">
        {city.routes.map((r) => (
          <div role="listitem" key={r.id}>
            <RouteCard route={r} status={routeStatus(r, badges, session)} onOpen={() => onOpen(r)} />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="dots" aria-hidden="true">
          {city.routes.map((r, i) => <i key={r.id} className={i === active ? 'on' : ''} />)}
        </div>
      )}

      <div className="home-cta">
        {current && <button className="btn primary" onClick={() => onOpen(current)}>Start {inSentence(current.name)}</button>}
        <button className="btn quiet" onClick={onJoinTeam}>Join a friend’s team</button>
      </div>
    </main>
  )
}
