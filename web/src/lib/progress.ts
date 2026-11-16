export type Phase = 'travel' | 'question' | 'solved'

export interface Progress {
  index: number
  phase: Phase
  hintsUsed: number
  /** Points earned per solved node. */
  earned: Record<string, { points: number; perfect: boolean }>
  /** Wrong answers and hint use on the current clue (kept across reloads). */
  wrongs: number
  hinted: boolean
}

export const totalScore = (p: Progress) => Object.values(p.earned).reduce((s, e) => s + e.points, 0)

export const freshProgress = (): Progress => ({ index: 0, phase: 'travel', hintsUsed: 0, earned: {}, wrongs: 0, hinted: false })
