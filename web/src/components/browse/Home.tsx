import { useEffect, useRef, useState } from 'react'
import { badgesIn, inSentence, type City, routeStatus } from '../../lib/cities'
import type { EarnedBadge, Session } from '../../lib/session'
import type { Route } from '../../types'
import { IconChevron, IconMedal, IconPin, IconUsers } from '../icons'
import { Cover } from './Cover'
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
  const n = city.routes.length
  const current = city.routes[Math.min(active, n - 1)]
  const playing = session && session.screen !== 'end' && playingRoute ? session : null
  const earned = badgesIn(city, badges)

  // Open on the route played or picked last.
  useEffect(() => {
    const el = rail.current?.children[start] as HTMLElement | undefined
    if (el && rail.current) rail.current.scrollLeft = el.offsetLeft - rail.current.offsetLeft - 20
  }, [start, city.key])

  const onScroll = () => {
    const el = rail.current
    if (!el || !el.children.length) return
    const w = (el.children[0] as HTMLElement).offsetWidth + 14
    setActive(Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / w))))
  }

  return (
    <main className="home browse enter">
      <header className="home-head">
        <button className="city-btn" onClick={onCities} aria-label={`Change city, now ${city.name}`}>
          <span className="pin"><IconPin size={17} /></span>
          {city.name}
          <IconChevron dir="down" size={15} />
        </button>
        <span className="count-pill" aria-label={`${badges.length} ${badges.length === 1 ? 'badge' : 'badges'}`}>
          <IconMedal /> {badges.length}
        </span>
      </header>

      <div className="hello">
        <h1>Explore {city.name}</h1>
        <p>
          {n} {n === 1 ? 'treasure hunt' : 'treasure hunts'}
          {earned > 0 ? ` · ${earned} of ${n} badges earned` : ' on foot, with a badge to earn'}
        </p>
      </div>

      {playing && playingRoute && (
        <button className="resume-card" onClick={onResume}>
          <Cover route={playingRoute} className="thumb" />
          <span className="txt">
            <span className="eyebrow">Continue</span>
            <b>{playingRoute.name}</b>
            <span className="bar" aria-hidden="true"><i style={{ width: `${(100 * playing.index) / playingRoute.stops.length}%` }} /></span>
            <small>Stop {playing.index + 1} of {playingRoute.stops.length} · {playingRoute.city}</small>
          </span>
          <IconChevron />
        </button>
      )}
      {team && (
        <button className="resume-card team" onClick={onTeam}>
          <span className="thumb icon"><IconUsers size={22} /></span>
          <span className="txt">
            <span className="eyebrow">Together</span>
            <b>Back to your team · {team}</b>
          </span>
          <IconChevron />
        </button>
      )}

      <div className="rail-head">
        <h2>{n === 1 ? 'The route' : 'Routes'}</h2>
        {n > 1 && <button className="see-all" onClick={onSeeAll}>See all {n}</button>}
      </div>

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
        {current && <button className="btn primary" onClick={() => onOpen(current)}>Play {inSentence(current.name)}</button>}
        <button className="text-btn" onClick={onJoinTeam}>Have a team code? <b>Join a team</b></button>
      </div>
    </main>
  )
}
