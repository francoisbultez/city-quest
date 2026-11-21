import { useState } from 'react'
import { routeKm } from '../../lib/route'
import type { Session } from '../../lib/session'
import { formatTripDate, type Trip } from '../../lib/trips'
import type { Route } from '../../types'
import { Badge } from '../Badge'
import { IconChevron, IconClock, IconExternal, IconFlag, IconUsers, IconWalk, Stars } from '../icons'
import { Cover } from './Cover'

interface Props {
  route: Route
  lastTrip?: Trip
  session: Session | null
  team: string | null
  onBack: () => void
  onStart: () => void
  onResume: () => void
  onTogether: () => void
}

/** "Can I do this now?": where it starts and ends, how long, when to go, what the walking is like. */
export function RoutePreview({ route, lastTrip, session, team, onBack, onStart, onResume, onTogether }: Props) {
  const [mode, setMode] = useState<'solo' | 'team'>(team ? 'team' : 'solo')
  const first = route.stops[0].place
  const inProgress = session && session.routeId === route.id && session.screen !== 'end'
  const startName = route.start.replace(/^the /, '')
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${first.lat},${first.lng}&travelmode=walking`
  const facts = [
    { icon: <IconClock size={18} />, title: `About ${route.duration.replace(/^~/, '')}`, text: `${routeKm(route.stops).toFixed(1)} km at an easy pace, stories included` },
    route.bestTime && { icon: <IconSun />, title: route.bestTime.title, text: route.bestTime.text },
    route.terrain && { icon: <IconWalk size={18} />, title: route.terrain.title, text: route.terrain.text },
    route.goodFor?.includes('kids') && { icon: <IconUsers size={18} />, title: 'Good with kids', text: 'Short legs between stops, lots to spot' },
  ].filter((f): f is { icon: React.JSX.Element; title: string; text: string | undefined } => !!f)

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
          <p>{route.tagline}. The stops stay secret until you solve each riddle.</p>
        </div>

        <section className="journey" aria-label="Where it starts and ends">
          <div className="ends">
            <span className="line" aria-hidden="true"><i className="a" /><i className="dots" /><i className="b" /></span>
            <span className="places">
              <span><b>Starts: {startName.charAt(0).toUpperCase() + startName.slice(1)}</b>{route.startTransit && <small>{route.startTransit}</small>}</span>
              <span>
                <b>Ends: {route.ends?.name ?? 'a surprise'}</b>
                <small>{route.ends ? route.ends.transit ?? `${route.stops.length} stops later` : 'The last stop stays secret'}</small>
              </span>
            </span>
            <a className="directions" href={directions} target="_blank" rel="noreferrer">Directions <IconExternal /></a>
          </div>
          <div className="facts-grid">
            {facts.map((f) => (
              <div key={f.title}>
                <span className="fact-icon" aria-hidden="true">{f.icon}</span>
                <span><b>{f.title}</b>{f.text && <small>{f.text}</small>}</span>
              </div>
            ))}
          </div>
        </section>

        {lastTrip && (
          <p className="played-line">
            <Stars n={lastTrip.stars} /> You played this on {formatTripDate(lastTrip.date, false)}
          </p>
        )}
        {route.author && route.author.name !== 'City Quest' && <p className="by">Route by {route.author.name}</p>}
        <p className="secret"><IconFlag size={14} /> {route.stops.length} secret stops</p>
      </div>

      <div className="preview-cta">
        <div className="segmented" role="group" aria-label="Who is playing">
          <button className={mode === 'solo' ? 'on' : ''} aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>One phone</button>
          <button className={mode === 'team' ? 'on' : ''} aria-pressed={mode === 'team'} onClick={() => setMode('team')}>Each on their phone</button>
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

const IconSun = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
)
