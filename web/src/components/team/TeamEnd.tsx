import { useEffect } from 'react'
import { confetti } from '../../lib/fx'
import { awardsFor } from '../../lib/team/logic'
import { teamTrip } from '../../lib/team/trip'
import type { TeamGame } from '../../lib/team/types'
import type { Route } from '../../types'
import { StoryList } from '../StoryList'
import { SouvenirActions, SouvenirCard } from '../Souvenir'

interface Props {
  route: Route
  game: TeamGame
  me: string
  points: number
  onReview: (index: number) => void
  onHome: () => void
}

/** End of a Together hunt: the shared souvenir, your award, the stories. */
export function TeamEnd({ route, game, me, points, onReview, onHome }: Props) {
  const trip = teamTrip(route, game, points)
  const firstTime = Object.values(game.results ?? {}).filter((r) => r.perfect).length
  const award = awardsFor(game, route.stops)[me]
  const colors = route.theme?.colors
  useEffect(() => {
    const t = setTimeout(() => confetti({ x: 0.5, y: 0.2 }, colors), 250)
    return () => clearTimeout(t)
  }, [colors])

  return (
    <main className="end souvenir-screen team-end">
      <span className="unlocked">Team badge unlocked</span>
      <h1>Your {route.city} souvenir</h1>
      <SouvenirCard route={route} trip={trip} />
      <p className="score-line">
        <b data-testid="final-score">{points}</b> team points · agreed first time {firstTime}/{route.stops.length}
      </p>
      {award && (
        <section className="award" data-testid="award">
          <span>Your award</span>
          <b>{award.title}</b>
          <small>{award.line}</small>
        </section>
      )}
      <SouvenirActions route={route} trip={trip} />
      <StoryList route={route} onOpen={onReview} />
      <button className="btn quiet" onClick={onHome}>Back to {route.city}</button>
    </main>
  )
}
