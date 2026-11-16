export const BASE_POINTS = 100
export const PERFECT_BONUS = 50
export const HINT_COST = 40
export const WRONG_COST = 20
export const MIN_POINTS = 30

/** Points for one solved clue. */
export function cluePoints({ wrongs, hinted }: { wrongs: number; hinted: boolean }): { points: number; perfect: boolean } {
  const perfect = wrongs === 0 && !hinted
  if (perfect) return { points: BASE_POINTS + PERFECT_BONUS, perfect }
  return { points: Math.max(MIN_POINTS, BASE_POINTS - wrongs * WRONG_COST - (hinted ? HINT_COST : 0)), perfect }
}

export function maxScore(clues: number): number {
  return clues * (BASE_POINTS + PERFECT_BONUS)
}

const RANKS = [
  { min: 0.85, title: 'Master Cartographer', line: 'Inés would have hired you on the spot.' },
  { min: 0.6, title: 'Royal Surveyor', line: 'Sharp eyes, steady feet. The palace is impressed.' },
  { min: 0.35, title: 'Map Apprentice', line: 'You found the route. Next time, find it faster.' },
  { min: 0, title: 'Curious Wanderer', line: 'You took the scenic route, and that counts too.' },
]

export function rankFor(score: number, clues: number) {
  const ratio = clues ? score / maxScore(clues) : 0
  return RANKS.find((r) => ratio >= r.min)!
}

/** Warmer/colder meter: 0 (far) → 1 (inside the zone). */
export function warmth(distanceM: number, radiusM: number): { level: number; label: string } {
  if (distanceM <= radiusM) return { level: 1, label: 'You’re here!' }
  const level = Math.max(0.05, Math.min(0.95, 1 - Math.log10(distanceM / radiusM) / Math.log10(30)))
  const label = level > 0.75 ? 'Hot' : level > 0.5 ? 'Warm' : level > 0.25 ? 'Cool' : 'Cold'
  return { level, label }
}
