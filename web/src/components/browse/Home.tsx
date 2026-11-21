import { useEffect, useRef, useState } from 'react'
import { badgesIn, type City, routeStatus } from '../../lib/cities'
import { avatarColor } from '../../lib/profile'
import type { EarnedBadge, Session } from '../../lib/session'
import type { Route } from '../../types'
import { IconChevron, IconPin, IconUser, IconUsers } from '../icons'
import { Cover } from './Cover'
import { RouteCard } from './RouteCard'
import { Steps } from './Steps'

interface Props {
  city: City
  badges: EarnedBadge[]
  session: Session | null
  /** Route of the solo game in progress, if any. */
  playingRoute?: Route
  /** Route to show first in the carousel. */
  focusId?: string
  team: string | null
  name: string
  onCities: () => void
  onSeeAll: () => void
  onOpen: (route: Route) => void
  onResume: () => void
  onTeam: () => void
  onYou: () => void
}

export function Home({ city, badges, session, playingRoute, focusId, team, name, onCities, onSeeAll, onOpen, onResume, onTeam, onYou }: Props) {
  const n = city.routes.length
  const playing = session && session.screen !== 'end' && playingRoute ? session : null
  const earned = badgesIn(city, badges)
  // Someone who has played before sees their progress first; a newcomer sees what the app is.
  const returning = badges.length > 0 || !!playing || !!team

  return (
    <main className="home browse with-tabs enter">
      <header className="home-head">
        <button className="city-btn" onClick={onCities} aria-label={`Change city, now ${city.name}`}>
          <span className="pin"><IconPin size={17} /></span>
          {city.name}
          <IconChevron dir="down" size={15} />
        </button>
        {name ? (
          <button className="avatar-btn" style={{ background: avatarColor(name) }} onClick={onYou} aria-label={`You: ${name}`}>
            {name.slice(0, 1).toUpperCase()}
          </button>
        ) : (
          <button className="avatar-btn empty" onClick={onYou} aria-label="You">
            <IconUser size={20} />
          </button>
        )}
      </header>

      {returning ? (
        <div className="hello">
          <h1>{name ? `Hola, ${name}` : 'Welcome back'}</h1>
          <p>
            {earned === n
              ? `${city.name} complete: you earned every badge here.`
              : earned > 0
                ? `${earned} of ${n} ${city.name} badges. ${n - earned === 1 ? 'One more' : `${n - earned} more`} to complete the city.`
                : `${n} ${n === 1 ? 'hunt' : 'hunts'} to play in ${city.name}.`}
          </p>
          <div className="city-progress" aria-hidden="true">
            <span className="bar"><i style={{ width: `${(100 * earned) / n}%` }} /></span>
            <b>{earned}/{n}</b>
          </div>
        </div>
      ) : (
        <div className="hello">
          <h1>Treasure hunts through {city.name}</h1>
          <p>Follow riddles across the city, answer what you see, earn the badge.</p>
          <Steps compact />
        </div>
      )}

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
        <h2>{returning ? `${city.name} hunts` : 'Pick your hunt'}</h2>
        {n > 1 && <button className="see-all" onClick={onSeeAll}>See all {n}</button>}
      </div>

      {returning ? (
        <div className="route-list tight">
          {city.routes.map((r) => (
            <RouteCard key={r.id} compact route={r} status={routeStatus(r, badges, session)} onOpen={() => onOpen(r)} />
          ))}
        </div>
      ) : (
        <Carousel city={city} focusId={focusId} badges={badges} session={session} onOpen={onOpen} />
      )}
    </main>
  )
}

function Carousel({ city, focusId, badges, session, onOpen }: { city: City; focusId?: string; badges: EarnedBadge[]; session: Session | null; onOpen: (r: Route) => void }) {
  const rail = useRef<HTMLDivElement>(null)
  const n = city.routes.length
  const start = Math.max(0, city.routes.findIndex((r) => r.id === focusId))
  const [active, setActive] = useState(start)

  // Open on the route picked last.
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
    <>
      <div className="rail" ref={rail} onScroll={onScroll} role="list">
        {city.routes.map((r, i) => (
          <div role="listitem" key={r.id}>
            <RouteCard route={r} status={routeStatus(r, badges, session)} onOpen={() => onOpen(r)} tag={i === 0 && n > 1 ? 'Best first hunt' : undefined} />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="dots" aria-hidden="true">
          {city.routes.map((r, i) => <i key={r.id} className={i === active ? 'on' : ''} />)}
        </div>
      )}
    </>
  )
}
