import { describe, expect, it } from 'vitest'
import { solRoute } from '../content/madrid-sol'
import { distanceM, heatFor, isAtStop, routeKm } from './route'

const stops = solRoute.stops

describe('distanceM', () => {
  it('is zero for the same point', () => {
    expect(distanceM(stops[0].place, stops[0].place)).toBe(0)
  })
  it('matches the Sol → Templo de Debod straight-line distance (~1.45 km)', () => {
    const d = distanceM(stops[0].place, stops.at(-1)!.place)
    expect(d).toBeGreaterThan(1350)
    expect(d).toBeLessThan(1550)
  })
})

describe('routeKm', () => {
  it('is about 2.8 km for the Sol Route', () => {
    expect(routeKm(stops)).toBeGreaterThan(2.4)
    expect(routeKm(stops)).toBeLessThan(3.2)
  })
})

describe('isAtStop', () => {
  const s = stops[0]
  it('accepts a position at the stop', () => {
    expect(isAtStop({ lat: s.place.lat, lng: s.place.lng, accuracy: 10 }, s)).toBe(true)
  })
  it('rejects a position 300 m away', () => {
    expect(isAtStop({ lat: s.place.lat - 0.0027, lng: s.place.lng, accuracy: 10 }, s)).toBe(false)
  })
  it('forgives poor GPS only up to 50 m', () => {
    // 90 m away with 200 m accuracy: radius 50 + slack 50 = 100 → inside
    expect(isAtStop({ lat: s.place.lat - 0.00081, lng: s.place.lng, accuracy: 200 }, s)).toBe(true)
    // 120 m away: outside even with huge accuracy
    expect(isAtStop({ lat: s.place.lat - 0.00108, lng: s.place.lng, accuracy: 500 }, s)).toBe(false)
  })
})

describe('heatFor', () => {
  it('goes cold → hot as you get closer', () => {
    expect(heatFor(900)).toBe('cold')
    expect(heatFor(300)).toBe('cool')
    expect(heatFor(130)).toBe('warm')
    expect(heatFor(40)).toBe('hot')
  })
})
