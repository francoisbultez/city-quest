import { describe, expect, it } from 'vitest'
import { distanceM, MAX_GPS_SLACK_M } from '../lib/route'
import { routes } from './madrid-sol'

// Guards against content mistakes that would break a route in the street.
describe.each(routes)('route $id', (route) => {
  it('has unique stop ids', () => {
    const ids = route.stops.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: has exactly one right answer among 4 distinct options', (_, s) => {
    expect(s.options).toHaveLength(4)
    expect(new Set(s.options).size).toBe(4)
    expect(s.options.filter((o) => o === s.answer)).toHaveLength(1)
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: has all the texts the screens need', (_, s) => {
    for (const field of ['riddle', 'whereHint', 'look', 'question', 'hint', 'fact'] as const) {
      expect(s[field].trim().length, field).toBeGreaterThan(3)
    }
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: place is in central Madrid', (_, s) => {
    expect(s.place.lat).toBeGreaterThan(40.38)
    expect(s.place.lat).toBeLessThan(40.46)
    expect(s.place.lng).toBeGreaterThan(-3.75)
    expect(s.place.lng).toBeLessThan(-3.66)
    expect(s.place.radiusM).toBeGreaterThanOrEqual(30)
    expect(s.place.radiusM).toBeLessThanOrEqual(150)
  })

  it('has no leg longer than 1.5 km', () => {
    for (let i = 1; i < route.stops.length; i++) {
      expect(distanceM(route.stops[i - 1].place, route.stops[i].place)).toBeLessThan(1500)
    }
  })

  it('never counts you as at the next stop while you are still at the previous one', () => {
    for (let i = 1; i < route.stops.length; i++) {
      const a = route.stops[i - 1].place
      const b = route.stops[i].place
      expect(distanceM(a, b), `${route.stops[i - 1].id} -> ${route.stops[i].id}`).toBeGreaterThan(b.radiusM + MAX_GPS_SLACK_M)
    }
  })
})
