import { useState } from 'react'
import { comingSoon } from '../../engine/registry'
import { badgesIn, cityKey, kmFrom, nearestCity, type City } from '../../lib/cities'
import type { EarnedBadge } from '../../lib/session'
import { useApproxPosition } from '../../lib/useApproxPosition'
import { IconChevron, IconClose, IconLink, IconLocate, IconSearch } from '../icons'
import { Cover } from './Cover'

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
  const dist = km !== undefined && !here ? `${km < 10 ? km.toFixed(1) : Math.round(km)} km away` : undefined
  return (
    <button className={here ? 'city-row here' : 'city-row'} onClick={onPick}>
      <Cover route={city.routes[0]} className="thumb" />
      <span className="txt">
        <span className="title">
          <b>{city.name}</b>
          {here && <span className="here-pill">You’re here</span>}
        </span>
        <span>{[city.region, dist].filter(Boolean).join(' · ')}</span>
        <span className="sub">
          {n} {n === 1 ? 'route' : 'routes'}
          {got > 0 && <> · <em>{got} of {n} badges</em></>}
        </span>
      </span>
      <IconChevron />
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
    <main className="home browse picker enter">
      <header className="picker-head">
        <h1>Where are you playing?</h1>
        <button className="round" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>
      </header>

      {cities.length + comingSoon.length >= SEARCH_FROM && (
        <label className="search">
          <IconSearch />
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
            <IconLocate />
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
          <h2 className="label">Coming soon · {soon.length}</h2>
          <ul className="soon">
            {soon.map((c) => <li key={c.city}>{c.city}</li>)}
          </ul>
        </section>
      )}

      {q && !others.length && !soon.length && !(near && match(near.name)) && <p className="empty">No city called “{q}” yet.</p>}

      <button className="add-route" onClick={onAddRoute}>
        <span className="link-icon"><IconLink /></span>
        <span><b>Got a route from a friend?</b><small>Paste its link to add it</small></span>
      </button>
      <span className="sr-only" aria-live="polite">{current.name} selected</span>
    </main>
  )
}
