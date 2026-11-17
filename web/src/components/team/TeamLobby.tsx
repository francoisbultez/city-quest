import { useState } from 'react'
import { MAX_PLAYERS, sortedPlayers } from '../../lib/team/logic'
import type { TeamGame } from '../../lib/team/types'
import type { Route } from '../../types'
import { Avatar } from './Avatar'

interface Props {
  route: Route
  game: TeamGame
  me: string
  present: string[]
  isLeader: boolean
  onStart: () => void
  onLeave: () => void
}

export function TeamLobby({ route, game, me, present, isLeader, onStart, onLeave }: Props) {
  const players = sortedPlayers(game)
  const host = game.players[game.hostId]?.name
  const [toast, setToast] = useState<string | null>(null)

  const invite = async () => {
    const url = `${window.location.origin}${window.location.pathname}?team=${game.code}`
    const text = `Join my City Quest team: code ${game.code}`
    try {
      if (navigator.share) await navigator.share({ title: 'City Quest', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setToast('Invite copied. Paste it anywhere.')
        setTimeout(() => setToast(null), 2500)
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <main className="team-lobby">
      <header className="join-head">
        <button className="pill" onClick={onLeave}>Leave</button>
        <span className="chip">Together · {route.name}</span>
      </header>

      <section className="invite">
        <h1>{game.hostId === me ? 'Invite your team' : 'You’re on the team!'}</h1>
        <p className="sub">Friends open City Quest, tap Together and type this code</p>
        <div className="code-tiles" aria-label={`Team code ${game.code.split('').join(' ')}`} data-testid="team-code">
          {game.code.split('').map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <button className="btn quiet" onClick={invite}>Share the invite</button>
      </section>

      <section className="team-list">
        <h2>Your team · {players.length} of {MAX_PLAYERS}</h2>
        <ul>
          {players.map(([id, p]) => (
            <li key={id} className={present.includes(id) ? '' : 'away'}>
              <Avatar name={p.name} color={p.color} />
              <span>{p.name}{id === me ? ' (you)' : ''}</span>
              {id === game.hostId && <small>started the team</small>}
            </li>
          ))}
          {Array.from({ length: MAX_PLAYERS - players.length }, (_, i) => (
            <li key={`free${i}`} className="free"><span className="avatar empty" aria-hidden="true">+</span><span>Free</span></li>
          ))}
        </ul>
      </section>

      <section className="rule">
        <h2>The one rule</h2>
        <p>Everyone sees the same clue. Answer together: it only counts when you all agree.</p>
        <ol>
          <li>Follow the riddle on the map</li>
          <li>Stick together, you’ll see each other</li>
          <li>Vote on the answer, then lock it in</li>
        </ol>
      </section>

      <div className="home-cta">
        {isLeader ? (
          <button className="btn primary" onClick={onStart}>{players.length > 1 ? 'We’re ready' : 'Start without waiting'}</button>
        ) : (
          <p className="waiting">Waiting for {host ?? 'the team'} to start…</p>
        )}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
