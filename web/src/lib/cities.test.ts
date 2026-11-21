import { describe, expect, it } from 'vitest'
import { durationMinutes } from './cities'
import { withNames } from './trips'

describe('durationMinutes', () => {
  it.each([
    ['~2 h', 120],
    ['1.5 h', 90],
    ['~2.5 h', 150],
    ['90 min', 90],
    ['1 h 30', 90],
    ['a while', undefined],
  ])('%s → %s', (label, mins) => expect(durationMinutes(label)).toBe(mins))
})

describe('withNames', () => {
  it('joins names naturally', () => {
    expect(withNames([])).toBe('')
    expect(withNames(['Ana'])).toBe('Ana')
    expect(withNames(['Ana', 'Tom', 'Lucía'])).toBe('Ana, Tom & Lucía')
  })
})
