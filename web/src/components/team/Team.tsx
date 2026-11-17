import { useEffect, useRef, useState } from 'react'
import { CHECK_BONUS, currentStreak, starsFor } from '../../lib/game'
import { awardBadge, type EarnedBadge } from '../../lib/session'
import { listNames, orderedResults, teamPoints } from '../../lib/team/logic'
import type { Room } from '../../lib/team/types'
import { useTeam } from '../../lib/team/useTeam'
import { routeById } from '../../content/routes'
import { Lesson } from '../Lesson'
import { Modal } from '../Modal'
import type { Mate } from '../RouteMap'
import { Walk } from '../Walk'
import { TeamEnd } from './TeamEnd'
import { TeamLobby } from './TeamLobby'
import { TeamQuiz } from './TeamQuiz'

interface Props {
  room: Room
  /** Leave the team screens; `left` is true when the player quit the team. */
  onExit: (left: boolean) => void
  onBadges: (b: EarnedBadge[]) => void
}

export function Team({ room, onExit, onBadges }: Props) {
  const { game, me, present, isLeader, actions } = useTeam(room)
  const route = routeById(game?.routeId)
  const [pause, setPause] = useState(false)
  const [review, setReview] = useState<number | null>(null)
  const awarded = useRef(false)

  const total = route.stops.length
  const points = game ? teamPoints(game, route.stops, CHECK_BONUS) : 0

  // Each phone keeps its own copy of the team badge.
  useEffect(() => {
    if (!game || game.screen !== 'end' || awarded.current) return
    awarded.current = true
    onBadges(awardBadge({ routeId: route.id, mode: 'team', stars: starsFor(points, total), points, date: new Date(game.finishedAt ?? room.now()).toISOString() }))
  }, [game, points, total, route.id, room, onBadges])

  const leave = () => {
    actions.leave()
    onExit(true)
  }

  if (game === undefined) return <main className="team-loading"><p>Connecting to your team…</p></main>
  if (game === null || !game.players?.[me]) {
    return (
      <main className="team-loading">
        <p>{game === null ? 'This team doesn’t exist any more.' : 'You’re no longer in this team.'}</p>
        <button className="btn primary" onClick={() => onExit(true)}>Back to start</button>
      </main>
    )
  }

  if (game.status === 'lobby') {
    return <TeamLobby route={route} game={game} me={me} present={present} isLeader={isLeader} onStart={actions.start} onLeave={leave} />
  }

  const stop = route.stops[game.index]
  const isLast = game.index === total - 1
  const spottedFor = (id: string) => Object.keys(game.spotted ?? {}).filter((k) => k.startsWith(id + ':')).map((k) => Number(k.split(':')[1]))
  const mates: Mate[] = Object.entries(game.players)
    .filter(([id]) => id !== me && present.includes(id))
    .map(([id, p]) => ({ id, name: p.name, color: p.color, pos: p.pos ?? null }))

  let screen
  if (game.screen === 'walk') {
    screen = <Walk key={stop.id} stops={route.stops} index={game.index} points={points} onArrive={actions.arrive} onPause={() => setPause(true)} mates={mates} onPosition={actions.position} />
  } else if (game.screen === 'quiz') {
    screen = <TeamQuiz key={stop.id} game={game} stop={stop} total={total} points={points} me={me} present={present} onVote={actions.vote} onHint={actions.hint} />
  } else if (game.screen === 'lesson') {
    const results = orderedResults(game, route.stops)
    const r = game.results?.[stop.id]
    const ready = !!game.ready?.[me]
    const waitingFor = present.filter((id) => !game.ready?.[id]).map((id) => game.players[id].name)
    screen = (
      <Lesson
        key={stop.id}
        stop={stop}
        index={game.index}
        total={total}
        result={r && { earned: r.points, perfect: r.perfect, streak: currentStreak(results), points }}
        picked={game.checks?.[stop.id]}
        spotted={spottedFor(stop.id)}
        onCheck={(o) => actions.check(stop.id, o)}
        onSpot={(i) => actions.spot(stop.id, i)}
        actionLabel={ready ? `Waiting for ${listNames(waitingFor)}` : isLast ? 'See our badge' : 'Next riddle'}
        onAction={actions.ready}
      />
    )
  } else if (review !== null) {
    const rs = route.stops[review]
    screen = (
      <Lesson
        key={rs.id}
        stop={rs}
        index={review}
        total={total}
        picked={game.checks?.[rs.id]}
        spotted={spottedFor(rs.id)}
        onCheck={(o) => actions.check(rs.id, o)}
        onSpot={(i) => actions.spot(rs.id, i)}
        actionLabel="Back to our badge"
        onAction={() => setReview(null)}
        onBack={() => setReview(null)}
      />
    )
  } else {
    screen = <TeamEnd route={route} game={game} me={me} points={points} onReview={setReview} onHome={() => onExit(true)} />
  }

  return (
    <>
      {screen}
      {pause && (
        <Modal title="Paused" onClose={() => setPause(false)}>
          <p className="modal-note">Team code <b>{game.code}</b> · {present.length} of {Object.keys(game.players).length} online</p>
          <div className="actions">
            <button className="btn primary" onClick={() => setPause(false)}>Resume</button>
            <button className="btn soft" onClick={() => onExit(false)}>Back to home (stay in the team)</button>
            <button className="btn danger-text" onClick={leave}>Leave the team</button>
          </div>
        </Modal>
      )}
    </>
  )
}
