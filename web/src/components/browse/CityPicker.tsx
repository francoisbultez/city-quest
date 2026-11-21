import { useState } from 'react'
import { comingSoon } from '../../engine/registry'
import { badgesIn, cityKey, kmFrom, nearestCity, type City } from '../../lib/cities'
import type { EarnedBadge } from '../../lib/session'
import { useApproxPosition } from '../../lib/useApproxPosition'
import { Badge } from '../Badge'

interface Props {
  cities: City[]
  current: City
  badges: EarnedBadge[]
  onPick: (c: City) => void
  onClose: () => void
  onAddRoute: () => void
}

const SEARCH_FROM = 7

function CityRow({ city, badges, km, here, onPick }: { city: City; badges: EarnedBadge[]; km?: number; here?: boolean; onPick: () => void }) {
  const n = city.routes.length
  const got = badgesIn(city, badges)
  const where = here ? 'You’re here' : city.region
  const dist = km !== undefined && !here ? `${km < 10 ? km.toFixed(1) : Math.round(km)} km away` : undefined
  return (
    <button className={here ? 'city-row here' : 'city-row'} onClick={onPick}>
      <Badge size={here ? 56 : 48} route={city.routes[0]} line={`${n} ${n === 1 ? 'ROUTE' : 'ROUTES'}`} label="" />
      <span className="txt">
        <b>{city.name}</b>
        <span>{[where, `${n} ${n === 1 ? 'route' : 'routes'}`, dist].filter(Boolean).join(' · ')}</span>
      </span>
      {got > 0 ? (
        <span className="got"><b>{got}/{n}</b><small>badges</small></span>
      ) : (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      )}
    </button>
  )
}

/** Choose where to play: near you first, then every city with routes, then what's coming. */
export function CityPicker({ cities, current, badges, onPick, onClose, onAddRoute }: Props) {
  const [q, setQ] = useState('')
  const geo = useApproxPosition()
  const near = nearestCity(cities, geo.pos)
  const match = (name: string) => cityKey(name).normalize('NFD').replace(/\p{M}/gu, '').includes(cityKey(q).normalize('NFD').replace(/\p{M}/gu, ''))
  const others = cities
    .filter((c) => c.key !== near?.key && match(c.name))
    .sort((a, b) => (geo.pos ? kmFrom(geo.pos, a) - kmFrom(geo.pos, b) : a.name.localeCompare(b.name)))
  const ready = new Set(cities.map((c) => c.key))
  const soon = comingSoon.filter((c) => !ready.has(cityKey(c.city)) && match(c.city))

  return (
    <main className="home browse picker">
      <header className="picker-head">
        <h1>Where are you playing?</h1>
        <button className="round" onClick={onClose} aria-label="Close">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>

      {cities.length + comingSoon.length >= SEARCH_FROM && (
        <label className="search">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <span className="sr-only">Search a city</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a city" />
        </label>
      )}

      {near && match(near.name) ? (
        <section>
          <h2 className="label">Near you</h2>
          <CityRow city={near} badges={badges} here onPick={() => onPick(near)} />
        </section>
      ) : (
        !q &&
        geo.state !== 'unavailable' && (
          <button className="locate" onClick={geo.request} disabled={geo.state === 'asking'}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></svg>
            {geo.state === 'asking' ? 'Finding you…' : geo.state === 'denied' ? 'Location is off. Pick a city below.' : geo.pos ? 'No routes near you yet' : 'Find the nearest city'}
          </button>
        )
      )}

      {others.length > 0 && (
        <section>
          <h2 className="label">{near ? 'More cities' : 'Ready to play'}</h2>
          <div className="city-list">
            {others.map((c) => (
              <CityRow key={c.key} city={c} badges={badges} km={geo.pos ? kmFrom(geo.pos, c) : undefined} onPick={() => onPick(c)} />
            ))}
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section>
          <h2 className="label">Coming soon</h2>
          <ul className="soon">
            {soon.map((c) => <li key={c.city}>{c.city}</li>)}
          </ul>
        </section>
      )}

      {q && !others.length && !soon.length && !(near && match(near.name)) && <p className="empty">No city called “{q}” yet.</p>}

      <button className="add-route" onClick={onAddRoute}>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
        <span><b>Got a route from a friend?</b><small>Paste its link to add it</small></span>
      </button>
      <span className="sr-only" aria-live="polite">{current.name} selected</span>
    </main>
  )
}
