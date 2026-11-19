import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { distanceM, MAX_GPS_SLACK_M } from '../lib/route'
import { builtInProblems, getRoutes } from './registry'
import { parseRoute } from './schema'

const routes = getRoutes()

describe('built-in routes', () => {
  it('every route folder is valid and loaded', () => {
    expect(builtInProblems).toEqual({})
    const folders = readdirSync('routes', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    expect(routes.map((r) => r.id).sort()).toEqual(folders.sort())
  })
})

describe('route format', () => {
  const minimal = {
    formatVersion: 1,
    id: 'tiny',
    city: 'Testville',
    name: 'Tiny Route',
    badgeLine: 'TINY',
    tagline: 'Two stops',
    start: 'the station',
    duration: '~30 min',
    stops: [
      { id: 'a', place: { name: 'A', lat: 40, lng: -3, radiusM: 40 }, riddle: 'Go to A', question: 'Colour?', options: ['Red', 'Blue'], answer: 'Red', lesson: { title: 'A' } },
      { id: 'b', place: { name: 'B', lat: 40.01, lng: -3, radiusM: 40 }, riddle: 'Go to B', question: 'Number?', options: ['1', '2', '3'], answer: '3', lesson: { title: 'B' } },
    ],
  }
  it('accepts a minimal route and fills defaults', () => {
    const r = parseRoute(minimal)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.route.language).toBe('en')
      expect(r.route.stops[0].verification.status).toBe('draft')
    }
  })
  it('explains mistakes with their location', () => {
    const bad = structuredClone(minimal)
    bad.stops[1].answer = '4'
    bad.stops[1].id = 'a'
    const r = parseRoute(bad)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors).toContain('stops.1.answer: answer must be one of the options')
      expect(r.errors).toContain('stops.1.id: stop id "a" is used twice')
    }
  })
  it('rejects links that are not https', () => {
    const bad = { ...minimal, author: { name: 'X', url: 'http://example.com' } }
    expect(parseRoute(bad).ok).toBe(false)
  })
})

// The quality bar for built-in routes: stricter than the format, which also accepts quick drafts.
describe.each(routes)('route $id', (route) => {
  it.each(route.stops.map((s) => [s.id, s] as const))('%s: has a complete lesson', (_, s) => {
    const l = s.lesson
    expect(l.subtitle, 'subtitle').toBeTruthy()
    expect(l.recap, 'recap').toBeTruthy()
    expect(l.story?.length ?? 0, 'story').toBeGreaterThanOrEqual(2)
    expect(l.lookCloser?.length ?? 0, 'lookCloser').toBeGreaterThanOrEqual(2)
    expect(l.words?.length ?? 0, 'words').toBeGreaterThanOrEqual(3)
    expect(l.think?.endsWith('?'), 'think ends with ?').toBe(true)
    expect(l.check?.options.length, 'quick check with 3 options').toBe(3)
    expect(l.sources?.length ?? 0, 'sources').toBeGreaterThanOrEqual(1)
    expect(s.whereHint && s.look && s.hint, 'whereHint, look and hint').toBeTruthy()
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: the riddle and location hint don’t give the answer away', (_, s) => {
    expect(s.riddle.toLowerCase()).not.toContain(s.answer.toLowerCase())
    expect((s.whereHint ?? '').toLowerCase()).not.toContain(s.answer.toLowerCase())
  })

  it.each(route.stops.map((s) => [s.id, s] as const))('%s: photo, if any, is credited and found', (_, s) => {
    const img = s.lesson.image
    if (!img) return // Some new stops are still waiting for a photo.
    expect(img.src, 'image file missing from the route folder').toBeTruthy()
    expect(img.credit.license).toMatch(/^(CC BY|CC BY-SA|CC0|Public domain)/)
  })

  it('timelines are in order', () => {
    for (const s of route.stops) {
      const years = (s.lesson.timeline ?? []).map((t) => parseInt(t.year.replace(/\D/g, ''), 10)).filter((n) => !Number.isNaN(n) && n > 1000)
      expect(years, s.id).toEqual([...years].sort((a, b) => a - b))
    }
  })

  it('is walkable: no leg longer than 1.5 km', () => {
    for (let i = 1; i < route.stops.length; i++) {
      expect(distanceM(route.stops[i - 1].place, route.stops[i].place), route.stops[i].id).toBeLessThan(1500)
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

describe('route.schema.json', () => {
  it('is up to date with the route format (run npm run route:schema)', async () => {
    const { readFileSync } = await import('node:fs')
    const { z } = await import('zod')
    const { RouteSchema } = await import('./schema')
    const onDisk = JSON.parse(readFileSync('routes/route.schema.json', 'utf8'))
    const { title: _t, description: _d, ...rest } = onDisk
    expect(rest).toEqual(JSON.parse(JSON.stringify(z.toJSONSchema(RouteSchema, { io: 'input', unrepresentable: 'any' }))))
  })
})
