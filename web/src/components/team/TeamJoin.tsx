import { useState } from 'react'
import { firstName, makeCode, MAX_PLAYERS, nextColor, normalizeCode, TEAM_COLORS } from '../../lib/team/logic'
import { addRouteFromUrl, findRoute, sourceUrlOf } from '../../engine/registry'
import { loadName, openRoom, roomExists } from '../../lib/team/room'
import type { Room, TeamGame } from '../../lib/team/types'
import type { Route } from '../../types'

interface Props {
  route: Route
  initialCode?: string
  onJoined: (room: Room) => void
  onBack: () => void
}

/** Start a team (get a code) or join one with a friend's code. */
export function TeamJoin({ route, initialCode = '', onJoined, onBack }: Props) {
  const [name, setName] = useState(loadName)
  const [code, setCode] = useState(normalizeCode(initialCode))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cleanName = firstName(name)
  const hasName = name.trim().length > 0

  const fail = (msg: string) => {
    setError(msg)
    setBusy(false)
  }

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      let c = makeCode()
      for (let i = 0; i < 5 && (await roomExists(c)); i++) c = makeCode()
      const room = await openRoom(c, cleanName)
      const t = room.now()
      const game: TeamGame = {
        code: c,
        routeId: route.id,
        ...(sourceUrlOf(route.id) ? { routeUrl: sourceUrlOf(route.id) } : {}),
        hostId: room.me,
        createdAt: t,
        status: 'lobby',
        players: { [room.me]: { name: cleanName, color: TEAM_COLORS[0], joinedAt: t, seenAt: t } },
        screen: 'walk',
        index: 0,
        wrongs: 0,
        hinted: false,
      }
      await room.create(game)
      onJoined(room)
    } catch {
      fail('Couldn’t reach the team server. Check your connection and try again.')
    }
  }

  const join = async () => {
    setBusy(true)
    setError(null)
    try {
      if (!(await roomExists(code))) return fail(`No team with the code ${code}. Check it with your friends.`)
      const room = await openRoom(code, cleanName)
      const game = await new Promise<TeamGame | null>((resolve) => {
        const off = room.subscribe((g) => {
          if (g === undefined) return
          queueMicrotask(() => off())
          resolve(g)
        })
      })
      if (!game) return fail(`No team with the code ${code}.`)
      // The team plays a route this phone doesn't have yet: download it first.
      if (!findRoute(game.routeId)) {
        if (!game.routeUrl) return fail('This team plays a route that isn’t on this phone.')
        try {
          await addRouteFromUrl(game.routeUrl)
        } catch {
          return fail('Couldn’t download the route this team is playing.')
        }
      }
      const players = game.players ?? {}
      if (!players[room.me]) {
        if (Object.keys(players).length >= MAX_PLAYERS) return fail('This team is full (4 players).')
        const t = room.now()
        await room.update({ [`players/${room.me}`]: { name: cleanName, color: nextColor(game), joinedAt: t, seenAt: t } })
      } else {
        await room.update({ [`players/${room.me}/name`]: cleanName, [`players/${room.me}/seenAt`]: room.now() })
      }
      onJoined(room)
    } catch {
      fail('Couldn’t reach the team server. Check your connection and try again.')
    }
  }

  return (
    <main className="team-join">
      <header className="join-head">
        <button className="pill icon" onClick={onBack} aria-label="Back">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span className="chip">Together · {route.name}</span>
      </header>

      <h1>Play as a team</h1>
      <p className="sub">Everyone sees the same clue on their own phone. An answer only counts when you all agree.</p>

      <label className="field">
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="e.g. Ana" autoComplete="given-name" maxLength={16} />
      </label>

      <section className="join-box">
        <h2>Join a friend</h2>
        <label className="field">
          <span>Team code</span>
          <input
            className="code-input"
            value={code}
            onChange={(e) => setCode(normalizeCode(e.target.value))}
            placeholder="ABCD"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={4}
            aria-label="Team code"
          />
        </label>
        <button className="btn primary" disabled={busy || !hasName || code.length !== 4} onClick={join}>Join the team</button>
      </section>

      <div className="or"><span>or</span></div>

      <button className="btn soft" disabled={busy || !hasName} onClick={create}>Start a new team</button>
      {!hasName && <p className="hint-line">Add your name first so your team knows who’s who.</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </main>
  )
}
