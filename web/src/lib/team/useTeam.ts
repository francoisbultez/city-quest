import { useEffect, useRef, useState } from 'react'
import { distanceM } from '../route'
import type { Position } from '../useGeolocation'
import type { Stop } from '../../types'
import { advancePatch, allReady, leaderId, presentIds, resolveAgreement, voteState } from './logic'
import type { Patch, Room, TeamGame } from './types'

const HEARTBEAT_MS = 15_000

/** Live team game plus the actions a player can take. */
export function useTeam(room: Room, stops: Stop[]) {
  const me = room.me
  const [game, setGame] = useState<TeamGame | null | undefined>(undefined)
  const [now, setNow] = useState(() => room.now())
  const latest = useRef<TeamGame | null | undefined>(undefined)
  const sentPos = useRef<{ lat: number; lng: number; at: number } | null>(null)
  const resolved = useRef('')

  useEffect(
    () =>
      room.subscribe((g) => {
        latest.current = g
        setGame(g)
      }),
    [room],
  )

  // Heartbeat: tells teammates this phone is still here.
  useEffect(() => {
    const beat = () => {
      const t = room.now()
      setNow(t)
      if (latest.current?.players?.[me]) room.update({ [`players/${me}/seenAt`]: t })
    }
    const first = setTimeout(beat, 0)
    const iv = setInterval(beat, HEARTBEAT_MS)
    const tick = setInterval(() => setNow(room.now()), 5000)
    return () => {
      clearTimeout(first)
      clearInterval(iv)
      clearInterval(tick)
    }
  }, [room, me])

  const present = game ? presentIds(game, now, me) : []
  const isLeader = !!game && leaderId(game, now, me) === me

  // The leader's phone turns agreement into results, so it is written once.
  useEffect(() => {
    if (!game || !isLeader) return
    const stop = stops[game.index]
    let patch: Patch | null = null
    let key = ''
    if (game.screen === 'quiz') {
      const vs = voteState(game, present)
      if (vs.kind === 'agreed') {
        key = `q:${game.index}:${game.wrongs}:${vs.option}`
        patch = resolveAgreement(game, stop, vs.option)
      }
    } else if (game.screen === 'lesson' && allReady(game, present)) {
      key = `l:${game.index}`
      patch = advancePatch(game, stops.length, room.now())
    }
    if (patch && resolved.current !== key) {
      resolved.current = key
      room.update(patch)
    }
  })

  const update = (p: Patch) => room.update({ ...p, [`players/${me}/seenAt`]: room.now() })
  const stop = game ? stops[game.index] : undefined

  const actions = {
    start: () => update({ status: 'playing', screen: 'walk', startedAt: room.now() }),
    arrive: () => {
      if (!game || !stop || game.screen !== 'walk') return
      update({ screen: 'quiz', [`stats/${stop.id}/arrivedBy`]: me })
    },
    vote: (option: number) => {
      if (!game || !stop) return
      const st = game.stats?.[stop.id]
      const p: Patch = { [`votes/${me}`]: option }
      if (!st?.firstVoter) p[`stats/${stop.id}/firstVoter`] = me
      if (st?.firstPicks?.[me] === undefined) p[`stats/${stop.id}/firstPicks/${me}`] = option
      update(p)
    },
    hint: () => update({ hinted: true }),
    check: (stopId: string, option: string) => {
      if (game?.checks?.[stopId] === undefined) update({ [`checks/${stopId}`]: option })
    },
    spot: (stopId: string, i: number) => {
      const k = `${stopId}:${i}`
      update({ [`spotted/${k}`]: game?.spotted?.[k] ? null : true })
    },
    ready: () => update({ [`ready/${me}`]: game?.ready?.[me] ? null : true }),
    position: (p: Position) => {
      const t = room.now()
      const last = sentPos.current
      if (last && t - last.at < 20_000 && distanceM(last, p) < 8) return
      sentPos.current = { lat: p.lat, lng: p.lng, at: t }
      room.update({ [`players/${me}/pos`]: { lat: p.lat, lng: p.lng, acc: Math.round(p.accuracy), at: t }, [`players/${me}/seenAt`]: t })
    },
    leave: () => room.update({ [`players/${me}`]: null, [`votes/${me}`]: null, [`ready/${me}`]: null }),
  }

  return { game, me, now, present, isLeader, actions }
}
