import { useEffect } from 'react'
import { confetti } from '../lib/fx'
import type { Session } from '../lib/session'
import type { Trip } from '../lib/trips'
import type { Route } from '../types'
import { StoryList } from './StoryList'
import { SouvenirActions, SouvenirCard } from './Souvenir'

/** End of a solo hunt: the souvenir first, then the stories to read again. */
export function End({ route, session, points, trip, onHome, onReview }: { route: Route; session: Session; points: number; trip: Trip; onHome: () => void; onReview: (index: number) => void }) {
  const firstTry = session.results.filter((r) => r.perfect).length
  const colors = route.theme?.colors
  useEffect(() => {
    const t = setTimeout(() => confetti({ x: 0.5, y: 0.2 }, colors), 250)
    return () => clearTimeout(t)
  }, [colors])

  return (
    <main className="end souvenir-screen">
      <span className="unlocked">You did it</span>
      <h1>Your {route.city} souvenir</h1>
      <SouvenirCard route={route} trip={trip} />
      <p className="score-line">
        <b data-testid="final-score">{points}</b> points · {firstTry} of {route.stops.length} first try
      </p>
      <SouvenirActions route={route} trip={trip} />
      <StoryList route={route} onOpen={onReview} />
      <button className="btn quiet" onClick={onHome}>Back to {route.city}</button>
    </main>
  )
}
