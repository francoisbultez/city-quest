import { isPerfect, stopPoints } from '../game'
import type { Stop } from '../../types'
import type { Patch, TeamGame, TeamPlayer } from './types'

export const PRESENCE_MS = 45_000
export const MAX_PLAYERS = 4
export const TEAM_COLORS = ['#ff4a2b', '#2f4bff', '#0f9f6e', '#8b6cff']

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I

export function makeCode(rand: () => number = Math.random): string {
  return Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)]).join('')
}

export const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)

export function sortedPlayers(g: TeamGame): [string, TeamPlayer][] {
  return Object.entries(g.players ?? {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt)
}

/** Players heard from recently. The current player always counts as present. */
export function presentIds(g: TeamGame, now: number, me?: string): string[] {
  return sortedPlayers(g)
    .filter(([id, p]) => id === me || now - p.seenAt < PRESENCE_MS)
    .map(([id]) => id)
}

/** The phone that makes the shared decisions: the host while present, otherwise the earliest joiner. */
export function leaderId(g: TeamGame, now: number, me?: string): string | undefined {
  const present = presentIds(g, now, me)
  return present.includes(g.hostId) ? g.hostId : present[0]
}

export function nextColor(g: TeamGame): string {
  const used = new Set(Object.values(g.players ?? {}).map((p) => p.color))
  return TEAM_COLORS.find((c) => !used.has(c)) ?? TEAM_COLORS[Object.keys(g.players ?? {}).length % TEAM_COLORS.length]
}

export type VoteState =
  | { kind: 'waiting'; agreed: number; total: number }
  | { kind: 'split'; agreed: number; total: number }
  | { kind: 'agreed'; option: number }

/** Have all present players voted the same option? */
export function voteState(g: TeamGame, present: string[]): VoteState {
  const votes = g.votes ?? {}
  const cast = present.filter((id) => votes[id] !== undefined)
  const counts = new Map<number, number>()
  for (const id of cast) counts.set(votes[id], (counts.get(votes[id]) ?? 0) + 1)
  const top = Math.max(0, ...counts.values())
  if (present.length > 0 && cast.length === present.length && counts.size === 1) return { kind: 'agreed', option: votes[cast[0]] }
  if (cast.length === present.length) return { kind: 'split', agreed: top, total: present.length }
  return { kind: 'waiting', agreed: top, total: present.length }
}

/** The patch the leader writes once the team agrees on an option. */
export function resolveAgreement(g: TeamGame, stop: Stop, option: number): Patch {
  if (stop.options[option] === stop.answer) {
    const points = stopPoints({ wrongs: g.wrongs, hinted: g.hinted })
    return {
      screen: 'lesson',
      votes: null,
      [`results/${stop.id}`]: { points, perfect: isPerfect({ wrongs: g.wrongs, hinted: g.hinted }) },
    }
  }
  return { votes: null, wrongs: g.wrongs + 1, [`tried/o${option}`]: true }
}

/** Patch for moving to the next stop (or the end). Idempotent: every phone computes the same one. */
export function advancePatch(g: TeamGame, total: number, now: number): Patch {
  if (g.index >= total - 1) return { screen: 'end', finishedAt: g.finishedAt ?? now, ready: null }
  return { screen: 'walk', index: g.index + 1, wrongs: 0, hinted: false, votes: null, tried: null, ready: null }
}

export const isTried = (g: TeamGame, option: number) => !!g.tried?.[`o${option}`]

export function orderedResults(g: TeamGame, stops: Stop[]) {
  return stops.filter((s) => g.results?.[s.id]).map((s) => ({ id: s.id, ...g.results![s.id] }))
}

export function teamPoints(g: TeamGame, stops: Stop[], checkBonus: number): number {
  const base = Object.values(g.results ?? {}).reduce((s, r) => s + r.points, 0)
  const bonus = stops.filter((s) => g.checks?.[s.id] !== undefined && g.checks[s.id] === s.lesson.check.answer).length * checkBonus
  return base + bonus
}

export interface Award {
  title: string
  line: string
}

/** One fun award per player, from what they did on the route. */
export function awardsFor(g: TeamGame, stops: Stop[]): Record<string, Award> {
  const ids = sortedPlayers(g).map(([id]) => id)
  const firstVotes = Object.fromEntries(ids.map((id) => [id, stops.filter((s) => g.stats?.[s.id]?.firstVoter === id).length]))
  const arrivals = Object.fromEntries(ids.map((id) => [id, stops.filter((s) => g.stats?.[s.id]?.arrivedBy === id).length]))
  const rightFirst = Object.fromEntries(
    ids.map((id) => [id, stops.filter((s) => { const p = g.stats?.[s.id]?.firstPicks?.[id]; return p !== undefined && s.options[p] === s.answer }).length]),
  )
  const kinds = [
    { score: rightFirst, title: 'Sharp eyes', line: (n: number) => `Your first pick was right at ${n} of ${stops.length} stops` },
    { score: firstVotes, title: 'Quick draw', line: (n: number) => `First to vote at ${n} ${n === 1 ? 'stop' : 'stops'}` },
    { score: arrivals, title: 'Trailblazer', line: (n: number) => `You found ${n} ${n === 1 ? 'stop' : 'stops'} first` },
  ]
  const out: Record<string, Award> = {}
  const taken = new Set<string>()
  // Strongest achievements first; each player and each award is used once.
  const pairs = kinds.flatMap((k) => ids.map((id) => ({ k, id, n: k.score[id] }))).filter((p) => p.n > 0).sort((a, b) => b.n - a.n)
  for (const { k, id, n } of pairs) {
    if (out[id] || taken.has(k.title)) continue
    out[id] = { title: k.title, line: k.line(n) }
    taken.add(k.title)
  }
  for (const id of ids) if (!out[id]) out[id] = { title: 'Team player', line: 'You helped the team agree on every answer' }
  return out
}

/** Everyone present has tapped "Next". */
export const allReady = (g: TeamGame, present: string[]) => present.length > 0 && present.every((id) => g.ready?.[id])

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'Player'

/** "Ana", "Ana and Tom", "Ana, Tom and Lucía". */
export function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** One line under the riddle on the walk screen: who is closest to the stop. */
export function teamNote(myDist: number | null, others: { name: string; dist: number | null }[]): string | null {
  const known = others.filter((o): o is { name: string; dist: number } => o.dist !== null)
  if (myDist === null || known.length === 0) return null
  const ahead = [...known].sort((a, b) => a.dist - b.dist)[0]
  if (ahead.dist >= myDist - 15) return 'Team together · you’re in front'
  const gap = Math.round((myDist - ahead.dist) / 10) * 10
  return `Team together · ${ahead.name} is ${gap} m ahead`
}

/** Option with the most votes, if one leads outright. */
export function leadingOption(g: TeamGame, present: string[]): { option: number; voters: string[] } | null {
  const by = new Map<number, string[]>()
  for (const id of present) {
    const v = g.votes?.[id]
    if (v !== undefined) by.set(v, [...(by.get(v) ?? []), id])
  }
  const sorted = [...by.entries()].sort((a, b) => b[1].length - a[1].length)
  if (!sorted.length || (sorted[1] && sorted[1][1].length === sorted[0][1].length)) return null
  return { option: sorted[0][0], voters: sorted[0][1] }
}
