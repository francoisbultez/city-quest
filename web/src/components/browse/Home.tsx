import { useState } from 'react'
import { bestBadge, durationMinutes, type City } from '../../lib/cities'
import { distanceM } from '../../lib/route'
import type { EarnedBadge, Session } from '../../lib/session'
import { useApproxPosition } from '../../lib/useApproxPosition'
import type { Route } from '../../types'
import { IconChevron, IconPin, IconUsers } from '../icons'
import { Cover } from './Cover'
import { RouteCard } from './RouteCard'

type Filter = 'short' | 'near' | 'kids' | 'sunset'

interface Props {
  city: City
  badges: EarnedBadge[]
  session: Session | null
  /** Route of the solo game in progress, if any. */
  playingRoute?: Route
  team: string | null
  onCities: () => void
  onOpen: (route: Route) => void
  onResume: () => void
  onTeam: () => void
}

/** Pick today's walk: practical cards, quick filters, and the hunt you paused. */
export function Home({ city, badges, session, playingRoute, team, onCities, onOpen, onResume, onTeam }: Props) {
  const [filter, setFilter] = useState<Filter | null>(null)
  const geo = useApproxPosition()
  const playing = session && session.screen !== 'end' && playingRoute ? session : null
  const routes = city.routes
  const short = (r: Route) => (durationMinutes(r.duration) ?? Infinity) <= 120
  // Only offer filters that actually split this city's routes.
  const filters: { id: Filter; label: string }[] = []
  if (routes.length > 1) {
    if (routes.some(short) && !routes.every(short)) filters.push({ id: 'short', label: 'Under 2 h' })
    if (geo.state !== 'unavailable') filters.push({ id: 'near', label: 'Near me' })
    if (routes.some((r) => r.goodFor?.includes('kids'))) filters.push({ id: 'kids', label: 'With kids' })
    if (routes.some((r) => r.goodFor?.includes('sunset'))) filters.push({ id: 'sunset', label: 'Sunset' })
  }
  const startKm = (r: Route) => (geo.pos ? distanceM(geo.pos, r.stops[0].place) / 1000 : undefined)
  let shown = routes
  if (filter === 'short') shown = routes.filter(short)
  if (filter === 'kids') shown = routes.filter((r) => r.goodFor?.includes('kids'))
  if (filter === 'sunset') shown = routes.filter((r) => r.goodFor?.includes('sunset'))
  if (filter === 'near' && geo.pos) shown = [...routes].sort((a, b) => startKm(a)! - startKm(b)!)

  const pick = (f: Filter) => {
    if (filter === f) return setFilter(null)
    setFilter(f)
    if (f === 'near' && !geo.pos) geo.request()
  }

  return (
    <main className="home browse with-tabs enter">
      <header className="home-head">
        <button className="city-btn" onClick={onCities} aria-label={`Change city, now ${city.name}`}>
          <span className="pin"><IconPin size={17} /></span>
          {city.name}
          <IconChevron dir="down" size={15} />
        </button>
        <span className="brand"><span className="dot" aria-hidden="true" />City Quest</span>
      </header>

      <div className="hello">
        <h1>What shall we explore today?</h1>
        <p>Treasure hunts on foot through {city.name}. Pick one that fits your {routes.length > 1 ? 'afternoon' : 'day'}.</p>
      </div>

      {playing && playingRoute && (
        <button className="resume-card" onClick={onResume}>
          <Cover route={playingRoute} className="thumb" />
          <span className="txt">
            <span className="eyebrow">Pick up where you left off</span>
            <b>Continue {playingRoute.name.replace(/^The /, 'the ')}</b>
            <small>Stop {playing.index + 1} of {playingRoute.stops.length}{playingRoute.city !== city.name ? ` · ${playingRoute.city}` : ''}</small>
          </span>
          <IconChevron />
        </button>
      )}
      {team && (
        <button className="resume-card team" onClick={onTeam}>
          <span className="thumb icon"><IconUsers size={22} /></span>
          <span className="txt">
            <span className="eyebrow">Each on their phone</span>
            <b>Back to your team · {team}</b>
          </span>
          <IconChevron />
        </button>
      )}

      {filters.length > 0 && (
        <div className="filters" role="group" aria-label="Filter hunts">
          <button className={filter === null ? 'on' : ''} aria-pressed={filter === null} onClick={() => setFilter(null)}>All</button>
          {filters.map((f) => (
            <button key={f.id} className={filter === f.id ? 'on' : ''} aria-pressed={filter === f.id} onClick={() => pick(f.id)}>{f.label}</button>
          ))}
        </div>
      )}
      {filter === 'near' && geo.state === 'denied' && <p className="hint-line">Location is off, so hunts can’t be sorted by distance.</p>}

      <div className="visit-list">
        {shown.map((r) => {
          const b = bestBadge(r.id, badges)
          return <RouteCard key={r.id} route={r} played={b && { stars: b.stars }} distanceKm={filter === 'near' ? startKm(r) : undefined} onOpen={() => onOpen(r)} />
        })}
        {shown.length === 0 && <p className="empty">No hunt matches that here yet.</p>}
      </div>
    </main>
  )
}
