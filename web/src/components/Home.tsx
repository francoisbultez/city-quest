import { useState } from 'react'
import { routeKm } from '../lib/route'
import type { EarnedBadge, Session } from '../lib/session'
import type { Route } from '../types'
import { Badge, Stars } from './Badge'

interface Props {
  route: Route
  badges: EarnedBadge[]
  session: Session | null
  onStart: () => void
  onResume: () => void
  /** Code of the team this phone is in, if any. */
  team: string | null
  onTogether: () => void
  initialMode?: 'solo' | 'team'
}

export function Home({ route, badges, session, onStart, onResume, team, onTogether, initialMode = 'solo' }: Props) {
  const [mode, setMode] = useState<'solo' | 'team'>(initialMode)
  const earned = badges.find((b) => b.routeId === route.id && b.mode === mode)
  const inProgress = session && session.routeId === route.id && session.screen !== 'end'
  const startName = route.stops[0].place.name.split(',').pop()!.trim()

  return (
    <main className="home">
      <header className="home-head">
        <span className="brand"><span className="dot" aria-hidden="true" />City Quest</span>
        <span className="chip">{badges.length} {badges.length === 1 ? 'badge' : 'badges'}</span>
      </header>

      <section className="route-card">
        <span className="label">{earned ? 'Your badge' : 'Earn this badge'}</span>
        <Badge size={150} mode={mode} line={route.badgeLine} locked={false} />
        {earned && <Stars count={earned.stars} size={24} />}
        <h1>{route.city} · {route.name}</h1>
        <p>{earned ? `Best score: ${earned.points} points. Go for ${earned.stars < 3 ? 'more stars' : 'a perfect run'}?` : route.tagline}</p>
        <div className="chips">
          <span className="chip">{routeKm(route.stops).toFixed(1)} km</span>
          <span className="chip">~2 h</span>
          <span className="chip">up to 3 stars</span>
        </div>
      </section>

      <div className="modes" role="group" aria-label="How to play">
        <button className={mode === 'solo' ? 'mode on' : 'mode'} aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></svg>
          <span><b>Solo</b><small>Just you</small></span>
        </button>
        <button className={mode === 'team' ? 'mode on' : 'mode'} aria-pressed={mode === 'team'} onClick={() => setMode('team')}>
          <svg aria-hidden="true" width="28" height="26" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="8" r="3.5" /><circle cx="18" cy="9" r="3" /><path d="M3 20c1-3.5 3.5-5.5 6-5.5s5 2 6 5.5M15 15c2.5 0 5 1.5 6 5" /></svg>
          <span><b>Together</b><small>2–4 phones</small></span>
        </button>
      </div>

      <div className="home-cta">
        {mode === 'team' ? (
          <button className="btn primary" onClick={onTogether}>{team ? `Back to your team · ${team}` : 'Start or join a team'}</button>
        ) : inProgress ? (
          <>
            <button className="btn primary" onClick={onResume}>Continue · stop {session!.index + 1} of {route.stops.length}</button>
            <button className="btn quiet" onClick={onStart}>Start again</button>
          </>
        ) : (
          <button className="btn primary" onClick={onStart}>Start at the {startName}</button>
        )}
      </div>
    </main>
  )
}
