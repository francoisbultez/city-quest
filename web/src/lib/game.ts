export const POINTS_PER_STOP = 100
export const HINT_COST = 40
export const WRONG_COST = 20
export const MIN_POINTS = 20
/** Bonus for answering a lesson's quick check correctly. */
export const CHECK_BONUS = 10

export function maxPoints(stops: number): number {
  return stops * POINTS_PER_STOP
}

/** Points for one stop. Finishing a stop always earns something. */
export function stopPoints({ wrongs, hinted }: { wrongs: number; hinted: boolean }): number {
  return Math.max(MIN_POINTS, POINTS_PER_STOP - wrongs * WRONG_COST - (hinted ? HINT_COST : 0))
}

/** A stop is perfect when answered first try without a hint. */
export function isPerfect({ wrongs, hinted }: { wrongs: number; hinted: boolean }): boolean {
  return wrongs === 0 && !hinted
}

/** 1 star for finishing, 2 from 75%, 3 from 87.5% of the maximum (600 / 700 out of 800). */
export function starsFor(points: number, stops: number): 1 | 2 | 3 {
  const ratio = points / maxPoints(stops)
  if (ratio >= 0.875) return 3
  if (ratio >= 0.75) return 2
  return 1
}

export interface StopResult {
  id: string
  points: number
  perfect: boolean
}

export function totalPoints(results: StopResult[]): number {
  return results.reduce((s, r) => s + r.points, 0)
}

/** Longest run of perfect answers. */
export function bestStreak(results: StopResult[]): number {
  let best = 0
  let run = 0
  for (const r of results) {
    run = r.perfect ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}

/** Current run of perfect answers, counting back from the latest stop. */
export function currentStreak(results: StopResult[]): number {
  let run = 0
  for (let i = results.length - 1; i >= 0 && results[i].perfect; i--) run++
  return run
}

export function formatDuration(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000))
  const h = Math.floor(min / 60)
  return h ? `${h}h ${String(min % 60).padStart(2, '0')}` : `${min} min`
}
