import type { StopResult } from './game'
import { load, save } from './storage'

export type Screen = 'home' | 'walk' | 'quiz' | 'correct' | 'end'

export interface Session {
  routeId: string
  screen: Screen
  index: number
  /** Wrong answers and hint use on the current stop (kept across reloads). */
  wrongs: number
  hinted: boolean
  results: StopResult[]
  startedAt: number
  finishedAt?: number
}

export interface EarnedBadge {
  routeId: string
  mode: 'solo' | 'team'
  stars: 1 | 2 | 3
  points: number
  date: string
}

const SESSION_KEY = 'cq.solo'
const BADGES_KEY = 'cq.badges'

export const newSession = (routeId: string): Session => ({
  routeId,
  screen: 'walk',
  index: 0,
  wrongs: 0,
  hinted: false,
  results: [],
  startedAt: Date.now(),
})

export const loadSession = () => load<Session | null>(SESSION_KEY, null)
export const saveSession = (s: Session | null) => save(SESSION_KEY, s)

export const loadBadges = () => load<EarnedBadge[]>(BADGES_KEY, [])

/** Keeps the best result per route and mode. Returns the updated list. */
export function awardBadge(b: EarnedBadge): EarnedBadge[] {
  const others = loadBadges().filter((x) => !(x.routeId === b.routeId && x.mode === b.mode))
  const prev = loadBadges().find((x) => x.routeId === b.routeId && x.mode === b.mode)
  const best = prev && prev.points >= b.points ? prev : b
  const list = [...others, best]
  save(BADGES_KEY, list)
  return list
}
