import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { bestBadge } from '../../lib/cities'
import { routeKm } from '../../lib/route'
import type { EarnedBadge, Session } from '../../lib/session'
import type { Route } from '../../types'
import { Badge } from '../Badge'
import { IconChevron, IconClock, IconExternal, IconFlag, IconWalk, Stars } from '../icons'
import { Cover } from './Cover'

const TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const startIcon = L.divIcon({ className: '', html: '<div class="pin small">1</div>', iconSize: [32, 32], iconAnchor: [16, 16] })

interface Props {
  route: Route
  badges: EarnedBadge[]
  session: Session | null
  team: string | null
  onBack: () => void
  onStart: () => void
  onResume: () => void
  onTogether: () => void
}

/** What a route is before you start it. Only the start is shown: the stops stay secret. */
export function RoutePreview({ route, badges, session, team, onBack, onStart, onResume, onTogether }: Props) {
  const [mode, setMode] = useState<'solo' | 'team'>(team ? 'team' : 'solo')
  const first = route.stops[0].place
  const best = bestBadge(route.id, badges)
  const inProgress = session && session.routeId === route.id && session.screen !== 'end'
  const startName = route.start.replace(/^the /, '')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${first.lat},${first.lng}`

  return (
    <main className="preview enter">
      <div className="hero">
        <Cover route={route} />
        <button className="round on-photo" onClick={onBack} aria-label="Back">
          <IconChevron dir="left" size={18} />
        </button>
        <div className="hero-badge"><Badge size={84} route={route} /></div>
      </div>

      <div className="preview-body">
        <div className="preview-title">
          <span className="eyebrow">{[route.city, route.kind].filter(Boolean).join(' · ')}</span>
          <h1>{route.name}</h1>
          <p>{route.tagline}</p>
        </div>

        <div className="preview-stats">
          <div><IconWalk size={18} /><b>{routeKm(route.stops).toFixed(1)} km</b><span>on foot</span></div>
          <div><IconClock size={18} /><b>{route.duration.replace(/^~/, '')}</b><span>with lessons</span></div>
          <div><IconFlag size={18} /><b>{route.stops.length}</b><span>secret stops</span></div>
        </div>

        {best && (
          <div className="best">
            <Stars n={best.stars} />
            <span>Your best: <b>{best.points} points</b>{best.stars < 3 ? '. Go for 3 stars?' : '. A perfect run!'}</span>
          </div>
        )}

        <section className="start-card">
          <div className="start-map" aria-hidden="true">
            <MapContainer center={[first.lat, first.lng]} zoom={15} zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false} boxZoom={false}>
              <TileLayer url={TILES} subdomains="abcd" maxZoom={20} />
              <Marker position={[first.lat, first.lng]} icon={startIcon} interactive={false} />
            </MapContainer>
          </div>
          <div className="start-txt">
            <span className="eyebrow">Where it starts</span>
            <b>{startName.charAt(0).toUpperCase() + startName.slice(1)}</b>
            <a href={mapsUrl} target="_blank" rel="noreferrer">Open in maps <IconExternal /></a>
          </div>
        </section>
        <p className="secret">The other stops stay secret: each riddle leads you to the next one.</p>
        {route.author && route.author.name !== 'City Quest' && <p className="by">Route by {route.author.name}</p>}
      </div>

      <div className="preview-cta">
        <div className="segmented" role="group" aria-label="How to play">
          <button className={mode === 'solo' ? 'on' : ''} aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>Solo</button>
          <button className={mode === 'team' ? 'on' : ''} aria-pressed={mode === 'team'} onClick={() => setMode('team')}>Together</button>
        </div>
        {mode === 'team' ? (
          <button className="btn primary" onClick={onTogether}>{team ? `Back to your team · ${team}` : 'Start or join a team'}</button>
        ) : inProgress ? (
          <div className="two">
            <button className="btn soft" onClick={onStart}>Start again</button>
            <button className="btn primary" onClick={onResume}>Continue · stop {session!.index + 1}</button>
          </div>
        ) : (
          <button className="btn primary" onClick={onStart}>Start at {route.start}</button>
        )}
      </div>
    </main>
  )
}
