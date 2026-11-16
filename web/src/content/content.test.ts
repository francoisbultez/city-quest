import { describe, expect, it } from 'vitest'
import { distanceM, MAX_GPS_SLACK_M } from '../lib/route'
import { hunts } from './madrid-bear'

// Guards against content mistakes that would break a hunt in the street.
describe.each(hunts)('hunt $id', (hunt) => {
  it('has unique node ids', () => {
    const ids = hunt.nodes.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('starts and ends with a story (priority 1) stop', () => {
    expect(hunt.nodes[0].priority).toBe(1)
    expect(hunt.nodes.at(-1)!.priority).toBe(1)
  })

  it.each(hunt.nodes.map((n) => [n.id, n] as const))('%s: answer is reachable', (_, n) => {
    const q = n.question
    if (q.kind === 'choice') {
      expect(q.options).toContain(q.answer)
      expect(new Set(q.options).size).toBe(q.options.length)
    } else {
      expect(q.answers.length).toBeGreaterThan(0)
    }
  })

  it.each(hunt.nodes.map((n) => [n.id, n] as const))('%s: place is sane', (_, n) => {
    // Central Madrid bounding box.
    expect(n.place.lat).toBeGreaterThan(40.38)
    expect(n.place.lat).toBeLessThan(40.46)
    expect(n.place.lng).toBeGreaterThan(-3.75)
    expect(n.place.lng).toBeLessThan(-3.66)
    expect(n.place.radiusM).toBeGreaterThanOrEqual(30)
    expect(n.place.radiusM).toBeLessThanOrEqual(150)
  })

  it('has no leg longer than 1.5 km between consecutive stops', () => {
    for (let i = 1; i < hunt.nodes.length; i++) {
      expect(distanceM(hunt.nodes[i - 1].place, hunt.nodes[i].place)).toBeLessThan(1500)
    }
  })

  it('never unlocks the next clue while you are still at the previous stop', () => {
    for (let i = 1; i < hunt.nodes.length; i++) {
      const a = hunt.nodes[i - 1].place
      const b = hunt.nodes[i].place
      // Standing at the centre of stop A with poor GPS must not count as being at stop B.
      expect(distanceM(a, b), `${hunt.nodes[i - 1].id} -> ${hunt.nodes[i].id}`).toBeGreaterThan(b.radiusM + MAX_GPS_SLACK_M)
      expect(distanceM(a, b)).toBeGreaterThan(a.radiusM + b.radiusM)
    }
  })
})
