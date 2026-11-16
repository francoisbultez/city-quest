import { describe, expect, it } from 'vitest'
import { madridBear } from '../content/madrid-bear'
import { buildRoute, distanceM, normalize, routeMinutes } from './route'

const nodes = madridBear.nodes

describe('distanceM', () => {
  it('is zero for the same point', () => {
    expect(distanceM(nodes[0].place, nodes[0].place)).toBe(0)
  })
  it('matches the Sol → Templo de Debod straight-line distance (~1.45 km)', () => {
    const d = distanceM(nodes[0].place, nodes.at(-1)!.place)
    expect(d).toBeGreaterThan(1350)
    expect(d).toBeLessThan(1550)
  })
})

describe('normalize', () => {
  it('ignores accents, case, punctuation and extra spaces', () => {
    expect(normalize('  Kilómetro   CERO! ')).toBe('kilometro cero')
  })
})

describe('buildRoute', () => {
  it('keeps every stop when there is plenty of time', () => {
    const r = buildRoute(nodes, { budgetMin: 600, pace: 'normal', stepFreeOnly: false })
    expect(r.nodes).toHaveLength(nodes.length)
    expect(r.fits).toBe(true)
  })

  it('never drops a priority-1 (story) stop, even with no time', () => {
    const r = buildRoute(nodes, { budgetMin: 1, pace: 'normal', stepFreeOnly: false })
    const core = nodes.filter((n) => n.priority === 1).map((n) => n.id)
    expect(r.nodes.map((n) => n.id)).toEqual(core)
    expect(r.fits).toBe(false)
  })

  it('drops optional (priority 3) stops before priority 2 stops', () => {
    const full = routeMinutes(nodes, 'normal')
    const r = buildRoute(nodes, { budgetMin: full - 1, pace: 'normal', stepFreeOnly: false })
    expect(r.nodes.find((n) => n.priority === 3)).toBeUndefined()
    expect(r.nodes.filter((n) => n.priority === 2).length).toBe(nodes.filter((n) => n.priority === 2).length)
  })

  it('keeps the story order', () => {
    const r = buildRoute(nodes, { budgetMin: 90, pace: 'normal', stepFreeOnly: false })
    const order = r.nodes.map((n) => nodes.indexOf(n))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('removes stops with stairs for a step-free route', () => {
    const r = buildRoute(nodes, { budgetMin: 600, pace: 'normal', stepFreeOnly: true })
    expect(r.nodes.every((n) => n.stepFree)).toBe(true)
    expect(r.nodes.find((n) => n.id === 'cuchilleros')).toBeUndefined()
  })

  it('a slower pace takes longer', () => {
    expect(routeMinutes(nodes, 'relaxed')).toBeGreaterThan(routeMinutes(nodes, 'brisk'))
  })

  it('always offers a route that fits the shortest budget in the UI (95 min), at any pace', () => {
    for (const pace of ['relaxed', 'normal', 'brisk'] as const) {
      expect(buildRoute(nodes, { budgetMin: 95, pace, stepFreeOnly: false }).fits).toBe(true)
    }
  })
})
