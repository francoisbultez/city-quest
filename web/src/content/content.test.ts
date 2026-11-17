import { existsSync } from 'node:fs'
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
    for (const field of ['riddle', 'whereHint', 'look', 'question', 'hint'] as const) {
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

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: has a complete lesson', (_, s) => {
    const l = s.lesson
    expect(l.title.length).toBeGreaterThan(3)
    expect(l.recap.length).toBeGreaterThan(5)
    expect(l.story.length).toBeGreaterThanOrEqual(2)
    expect(l.lookCloser.length).toBeGreaterThanOrEqual(2)
    expect(l.words.length).toBeGreaterThanOrEqual(3)
    expect(l.think.endsWith('?')).toBe(true)
    expect(l.sources.length).toBeGreaterThanOrEqual(1)
    for (const src of l.sources) expect(src.url).toMatch(/^https:\/\//)
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: quick check has one right answer among 3', (_, s) => {
    const c = s.lesson.check
    expect(new Set(c.options).size).toBe(3)
    expect(c.options.filter((o) => o === c.answer)).toHaveLength(1)
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: lesson never gives away the quiz answer before you answer', (_, s) => {
    // The lesson only shows after answering, but the riddle and hints must not contain the answer.
    expect(s.riddle.toLowerCase()).not.toContain(s.answer.toLowerCase())
    expect(s.whereHint.toLowerCase()).not.toContain(s.answer.toLowerCase())
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: has a credited, free-licence photo that exists', (_, s) => {
    const img = s.lesson.image!
    expect(img, 'photo').toBeDefined()
    expect(existsSync(`public/${img.src}`), img.src).toBe(true)
    expect(img.alt.length).toBeGreaterThan(10)
    expect(img.credit.artist.length).toBeGreaterThan(1)
    expect(img.credit.license).toMatch(/^(CC BY|CC BY-SA|CC0|Public domain)/)
    expect(img.credit.page).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
  })

  it('timelines are in order', () => {
    for (const s of route.stops) {
      const years = s.lesson.timeline.map((t) => parseInt(t.year.replace(/\D/g, ''), 10)).filter((n) => !Number.isNaN(n) && n > 1000)
      expect(years, s.id).toEqual([...years].sort((a, b) => a - b))
    }
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
