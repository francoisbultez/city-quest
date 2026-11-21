import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { bestBadge } from '../../lib/cities'
import { routeKm } from '../../lib/route'
import type { EarnedBadge, Session } from '../../lib/session'
import type { Route } from '../../types'
import { Badge } from '../Badge'

const TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const startIcon = L.divIcon({ className: '', html: '<div class="pin">1</div>', iconSize: [44, 44], iconAnchor: [22, 22] })

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

  return (
    <main className="preview">
      <div className="preview-map">
        <MapContainer center={[first.lat, first.lng]} zoom={15} zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false}>
          <TileLayer url={TILES} subdomains="abcd" maxZoom={20} />
          <Marker position={[first.lat, first.lng]} icon={startIcon} interactive={false} />
        </MapContainer>
        <button className="round on-map" onClick={onBack} aria-label="Back">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span className="chip start-chip">Start: {startName}</span>
      </div>

      <div className="preview-body">
        <div className="preview-title">
          <Badge size={72} route={route} />
          <div>
            <span className="label">{[route.city, route.kind].filter(Boolean).join(' · ')}</span>
            <h1>{route.name}</h1>
          </div>
        </div>
        <p className="preview-text">{route.tagline}. The stops stay secret until you solve the riddle that leads to each one.</p>

        <div className="preview-stats">
          <div><b>{route.stops.length}</b><span>secret stops</span></div>
          <div><b>{routeKm(route.stops).toFixed(1)} km</b><span>walking</span></div>
          <div><b>{route.duration}</b><span>with lessons</span></div>
        </div>

        {best && (
          <p className="best">
            <span className="star" aria-hidden="true">★</span> Your best: {best.stars} {best.stars === 1 ? 'star' : 'stars'}, {best.points} points.{best.stars < 3 ? ' Go for 3?' : ''}
          </p>
        )}
        {route.author && route.author.name !== 'City Quest' && <p className="by">Route by {route.author.name}</p>}

        <div className="preview-cta">
          <div className="segmented" role="group" aria-label="How to play">
            <button className={mode === 'solo' ? 'on' : ''} aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>Solo</button>
            <button className={mode === 'team' ? 'on' : ''} aria-pressed={mode === 'team'} onClick={() => setMode('team')}>Together</button>
          </div>
          {mode === 'team' ? (
            <button className="btn primary" onClick={onTogether}>{team ? `Back to your team · ${team}` : 'Start or join a team'}</button>
          ) : inProgress ? (
            <>
              <button className="btn primary" onClick={onResume}>Continue · stop {session!.index + 1} of {route.stops.length}</button>
              <button className="btn quiet" onClick={onStart}>Start again</button>
            </>
          ) : (
            <button className="btn primary" onClick={onStart}>Start at {route.start}</button>
          )}
        </div>
      </div>
    </main>
  )
}
