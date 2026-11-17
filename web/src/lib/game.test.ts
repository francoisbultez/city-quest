import { describe, expect, it } from 'vitest'
import { bestStreak, currentStreak, formatDuration, isPerfect, maxPoints, starsFor, stopPoints, totalPoints } from './game'

describe('stopPoints', () => {
  it('gives 100 for a first-try answer without a hint', () => {
    expect(stopPoints({ wrongs: 0, hinted: false })).toBe(100)
  })
  it('takes 40 for a hint and 20 per wrong try', () => {
    expect(stopPoints({ wrongs: 0, hinted: true })).toBe(60)
    expect(stopPoints({ wrongs: 1, hinted: false })).toBe(80)
    expect(stopPoints({ wrongs: 2, hinted: true })).toBe(20)
  })
  it('never goes below 20, so finishing a stop always pays', () => {
    expect(stopPoints({ wrongs: 3, hinted: true })).toBe(20)
  })
})

describe('isPerfect', () => {
  it('only counts first try without a hint', () => {
    expect(isPerfect({ wrongs: 0, hinted: false })).toBe(true)
    expect(isPerfect({ wrongs: 1, hinted: false })).toBe(false)
    expect(isPerfect({ wrongs: 0, hinted: true })).toBe(false)
  })
})

describe('starsFor', () => {
  it('gives 1 star for finishing, 2 from 600, 3 from 700 out of 800', () => {
    expect(maxPoints(8)).toBe(800)
    expect(starsFor(160, 8)).toBe(1)
    expect(starsFor(599, 8)).toBe(1)
    expect(starsFor(600, 8)).toBe(2)
    expect(starsFor(699, 8)).toBe(2)
    expect(starsFor(700, 8)).toBe(3)
    expect(starsFor(800, 8)).toBe(3)
  })
})

describe('streaks', () => {
  const r = (perfect: boolean) => ({ id: 'x', points: perfect ? 100 : 60, perfect })
  const results = [r(true), r(true), r(false), r(true), r(true), r(true)]
  it('finds the best and current runs of perfect answers', () => {
    expect(bestStreak(results)).toBe(3)
    expect(currentStreak(results)).toBe(3)
    expect(currentStreak([...results, r(false)])).toBe(0)
  })
  it('totals points', () => {
    expect(totalPoints(results)).toBe(560)
  })
})

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(5 * 60000)).toBe('5 min')
    expect(formatDuration(112 * 60000)).toBe('1h 52')
  })
})
