import type { ClueNode, Pace, Settings } from '../types'

const WALK_KMH: Record<Pace, number> = { relaxed: 3.5, normal: 4.5, brisk: 5.5 }
/** Most GPS error we forgive when checking someone is at a stop. */
export const MAX_GPS_SLACK_M = 50

/** Streets are never a straight line. */
const DETOUR = 1.3

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function walkMinutes(a: ClueNode, b: ClueNode, pace: Pace): number {
  const km = (distanceM(a.place, b.place) * DETOUR) / 1000
  return (km / WALK_KMH[pace]) * 60
}

export function routeMinutes(nodes: ClueNode[], pace: Pace): number {
  let total = 0
  nodes.forEach((n, i) => {
    total += n.minutes
    if (i > 0) total += walkMinutes(nodes[i - 1], n, pace)
  })
  return Math.round(total)
}

/**
 * Builds a route that fits the player's time budget.
 * Keeps the story order, drops nodes that are not step-free when needed, then
 * drops the least important stops (priority 3, then 2) until the route fits.
 * Priority-1 nodes carry the story and are never dropped.
 */
export function buildRoute(all: ClueNode[], s: Settings): { nodes: ClueNode[]; minutes: number; fits: boolean } {
  let nodes = all.filter((n) => !s.stepFreeOnly || n.stepFree)

  while (routeMinutes(nodes, s.pace) > s.budgetMin) {
    // Drop the optional stop whose removal saves the most time.
    let best: { idx: number; saved: number } | null = null
    const current = routeMinutes(nodes, s.pace)
    nodes.forEach((n, idx) => {
      if (n.priority === 1) return
      const lowest = Math.max(...nodes.filter((x) => x.priority !== 1).map((x) => x.priority))
      if (n.priority !== lowest) return
      const saved = current - routeMinutes(nodes.filter((_, i) => i !== idx), s.pace)
      if (!best || saved > best.saved) best = { idx, saved }
    })
    if (!best) break
    const drop = (best as { idx: number }).idx
    nodes = nodes.filter((_, i) => i !== drop)
  }

  const minutes = routeMinutes(nodes, s.pace)
  return { nodes, minutes, fits: minutes <= s.budgetMin }
}

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
