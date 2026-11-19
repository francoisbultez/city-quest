import { useEffect, useRef, useState } from 'react'
import { buzz } from '../../lib/fx'
import { HINT_COST, WRONG_COST } from '../../lib/game'
import { isTried, leadingOption, listNames, voteState } from '../../lib/team/logic'
import type { TeamGame } from '../../lib/team/types'
import type { Stop } from '../../types'
import { Progress } from '../TopBar'
import { Avatar } from './Avatar'

const SECONDS = 30

interface Props {
  game: TeamGame
  stop: Stop
  total: number
  points: number
  me: string
  present: string[]
  onVote: (option: number) => void
  onHint: () => void
}

export function TeamQuiz({ game, stop, total, points, me, present, onVote, onHint }: Props) {
  const [left, setLeft] = useState(SECONDS)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  // Buzz when the team locks in a wrong answer.
  const wrongs = useRef(game.wrongs)
  useEffect(() => {
    if (game.wrongs > wrongs.current) buzz(120)
    wrongs.current = game.wrongs
  }, [game.wrongs])

  const votes = game.votes ?? {}
  const mine = votes[me]
  const name = (id: string) => game.players[id]?.name ?? 'Someone'
  const vs = voteState(game, present)
  const lead = leadingOption(game, present)
  const votersOf = (o: number) => present.filter((id) => votes[id] === o)
  // The most popular pick other than mine: offered as a one-tap switch.
  const rival = mine === undefined ? undefined : [0, 1, 2, 3].filter((o) => o !== mine && votersOf(o).length > 0).sort((a, b) => votersOf(b).length - votersOf(a).length)[0]

  let status: string
  let lock: { label: string; action?: () => void }
  if (vs.kind === 'agreed') {
    status = 'Everyone agrees'
    lock = { label: 'Locked in!' }
  } else if (mine === undefined && lead) {
    status = `${listNames(lead.voters.map(name))} picked ${stop.options[lead.option]}`
    lock = { label: `Go with ${stop.options[lead.option]}`, action: () => onVote(lead.option) }
  } else if (mine === undefined) {
    status = present.length > 1 ? 'Tap an answer. It locks when you all agree.' : 'Tap an answer to lock it in.'
    lock = { label: 'Locks when you all agree' }
  } else if (rival && (votersOf(rival).length >= votersOf(mine).length)) {
    status = `${listNames(votersOf(rival).map(name))} picked ${stop.options[rival]}`
    lock = { label: `Switch to ${stop.options[rival]}`, action: () => onVote(rival) }
  } else {
    const agree = present.filter((id) => votes[id] === mine)
    const others = present.filter((id) => votes[id] !== mine).map(name)
    status = `${agree.length} of ${present.length} agree · waiting for ${listNames(others)}`
    lock = { label: 'Locks when you all agree' }
  }

  const circumference = 2 * Math.PI * 17

  return (
    <main className="quiz team-quiz">
      <div className="quiz-top">
        <span className="chip">Stop {game.index + 1} · {stop.place.name.split(',')[0]}</span>
        <div className="timer" role="timer" aria-label={`${left} seconds left`}>
          <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" className="track" />
            <circle cx="20" cy="20" r="17" className="bar" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - left / SECONDS)} transform="rotate(-90 20 20)" />
          </svg>
          <span>{left}</span>
        </div>
      </div>
      <Progress total={total} done={game.index} current={game.index} />

      {stop.look && <span className="look">{stop.look}</span>}
      <h2>{stop.question}</h2>

      <div className="options">
        {stop.options.map((o, i) => {
          const tried = isTried(game, i)
          const voters = present.filter((id) => votes[id] === i)
          return (
            <button
              key={o}
              className={`option${tried ? ' tried' : ''}${mine === i ? ' mine' : ''}`}
              onClick={() => onVote(i)}
              disabled={tried || vs.kind === 'agreed'}
              aria-pressed={mine === i}
            >
              <span className="key" aria-hidden="true">{'ABCD'[i]}</span>
              <span className="label-text">{o}</span>
              {voters.length > 0 && (
                <span className="voters" aria-label={`Picked by ${listNames(voters.map(name))}`}>
                  {voters.map((id) => <Avatar key={id} name={name(id)} color={game.players[id].color} size={24} ring />)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="feedback" role="status">{game.wrongs > 0 && game.tried ? `Not quite. Look again (−${WRONG_COST})` : ''}</p>
      {game.hinted && <p className="hint-text"><b>Hint:</b> {stop.hint}</p>}

      <p className="vote-status" data-testid="vote-status">{status}</p>
      <button className={lock.action ? 'btn primary lock' : 'btn lock waiting'} onClick={lock.action} disabled={!lock.action}>{lock.label}</button>

      <div className="quiz-foot">
        {stop.hint ? (
        <button className="link" onClick={onHint} disabled={game.hinted}>
          {game.hinted ? 'Hint used' : <>Hint <span>−{HINT_COST}</span></>}
        </button>
        ) : <span />}
        <span className="points"><span className="star" aria-hidden="true">★</span> {points}</span>
      </div>
    </main>
  )
}
