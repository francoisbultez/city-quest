import { useEffect, useState } from 'react'
import { confetti } from '../../lib/fx'
import { CHECK_BONUS, maxPoints, starsFor } from '../../lib/game'
import { awardsFor, listNames, sortedPlayers } from '../../lib/team/logic'
import type { TeamGame } from '../../lib/team/types'
import type { Route } from '../../types'
import { Badge, Stars } from '../Badge'
import { Avatar } from './Avatar'

interface Props {
  route: Route
  game: TeamGame
  me: string
  points: number
  onReview: (index: number) => void
  onHome: () => void
}

export function TeamEnd({ route, game, me, points, onReview, onHome }: Props) {
  const total = route.stops.length
  const stars = starsFor(points, total)
  const players = sortedPlayers(game)
  const names = listNames(players.map(([, p]) => p.name))
  const firstTime = Object.values(game.results ?? {}).filter((r) => r.perfect).length
  const award = awardsFor(game, route.stops)[me]
  const [toast, setToast] = useState<string | null>(null)

  const colors = route.theme?.colors
  useEffect(() => {
    const t = setTimeout(() => confetti({ x: 0.5, y: 0.25 }, colors), 250)
    return () => clearTimeout(t)
  }, [colors])

  const share = async () => {
    const text = `Our team (${names}) earned the ${route.city} · ${route.name} badge on City Quest: ${stars} of 3 stars, ${points} points.`
    const url = window.location.origin + window.location.pathname
    try {
      if (navigator.share) await navigator.share({ title: `${route.city} · ${route.name}`, text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setToast('Copied. Paste it anywhere.')
        setTimeout(() => setToast(null), 2500)
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <main className="end team-end">
      <span className="unlocked">Team badge unlocked</span>
      <div className="badge-hero">
        <Badge size={200} mode="team" route={route} />
      </div>
      <Stars count={stars} />
      <h1>{route.city} · {route.name}</h1>
      <div className="team-row">
        <span className="avatars">{players.map(([id, p]) => <Avatar key={id} name={p.name} color={p.color} size={28} ring />)}</span>
        <span>Team · {names}</span>
      </div>

      <div className="stats two">
        <div><span>Team points</span><b className="accent" data-testid="final-score">{points}</b><small>of {maxPoints(total) + route.stops.filter((st) => st.lesson.check).length * CHECK_BONUS} with bonuses</small></div>
        <div><span>Agreed first time</span><b>{firstTime}/{total}</b><small>{total} places found</small></div>
      </div>

      {award && (
        <section className="award" data-testid="award">
          <span>Your award</span>
          <b>{award.title}</b>
          <small>{award.line}</small>
        </section>
      )}

      <section className="recap">
        <h2>{total} places you discovered</h2>
        <p>Tap one to read its story again</p>
        <ul>
          {route.stops.map((st, i) => (
            <li key={st.id}>
              <button onClick={() => onReview(i)}>
                {st.lesson.image ? (
                  <span className="thumb">
                    <img src={st.lesson.image.src} alt="" loading="lazy" />
                    <i>{i + 1}</i>
                  </span>
                ) : (
                  <span className="n">{i + 1}</span>
                )}
                <span className="txt"><b>{st.lesson.title}</b><small>{st.lesson.recap}</small></span>
                <span className="chev" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="end-actions">
        <button className="btn primary" onClick={share}>Share our badge</button>
        <button className="btn quiet" onClick={onHome}>Back to start</button>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
