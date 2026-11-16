import { describe, expect, it } from 'vitest'
import { cluePoints, maxScore, MIN_POINTS, rankFor, warmth } from './score'

describe('cluePoints', () => {
  it('gives 150 for a perfect answer', () => {
    expect(cluePoints({ wrongs: 0, hinted: false })).toEqual({ points: 150, perfect: true })
  })
  it('takes off for hints and wrong answers', () => {
    expect(cluePoints({ wrongs: 0, hinted: true }).points).toBe(60)
    expect(cluePoints({ wrongs: 1, hinted: false }).points).toBe(80)
    expect(cluePoints({ wrongs: 1, hinted: true }).points).toBe(40)
  })
  it('never goes below the floor, so finishing always pays', () => {
    expect(cluePoints({ wrongs: 10, hinted: true }).points).toBe(MIN_POINTS)
  })
})

describe('rankFor', () => {
  it('ranks by share of the maximum score', () => {
    expect(rankFor(maxScore(8), 8).title).toBe('Master Cartographer')
    expect(rankFor(maxScore(8) * 0.7, 8).title).toBe('Royal Surveyor')
    expect(rankFor(maxScore(8) * 0.4, 8).title).toBe('Map Apprentice')
    expect(rankFor(0, 8).title).toBe('Curious Wanderer')
  })
})

describe('warmth', () => {
  it('is full inside the zone', () => {
    expect(warmth(10, 50)).toEqual({ level: 1, label: 'You’re here!' })
  })
  it('gets warmer as you get closer', () => {
    const far = warmth(1200, 50)
    const mid = warmth(300, 50)
    const near = warmth(70, 50)
    expect(far.level).toBeLessThan(mid.level)
    expect(mid.level).toBeLessThan(near.level)
    expect(near.label).toBe('Hot')
    expect(far.label).toBe('Cold')
  })
})
