import type { Route } from '../types'
import { distanceM } from './route'
import type { EarnedBadge, Session } from './session'

/** A city, derived from the routes that name it. Nothing about cities is written in code. */
export interface City {
  key: string
  name: string
  region?: string
  routes: Route[]
  /** Average of the routes' starting points. */
  center: { lat: number; lng: number }
}

export const cityKey = (name: string) => name.trim().toLocaleLowerCase('en')

/** Groups routes by their `city`, in the order the cities first appear. */
export function citiesFrom(routes: Route[]): City[] {
  const map = new Map<string, City>()
  for (const r of routes) {
    const key = cityKey(r.city)
    const c = map.get(key) ?? { key, name: r.city, region: r.region, routes: [], center: { lat: 0, lng: 0 } }
    c.region ??= r.region
    c.routes.push(r)
    map.set(key, c)
  }
  return [...map.values()].map((c) => ({
    ...c,
    center: {
      lat: c.routes.reduce((s, r) => s + r.stops[0].place.lat, 0) / c.routes.length,
      lng: c.routes.reduce((s, r) => s + r.stops[0].place.lng, 0) / c.routes.length,
    },
  }))
}

export const kmFrom = (pos: { lat: number; lng: number }, c: City) => distanceM(pos, c.center) / 1000

/** Within this distance of a city's routes, you count as "in" it. */
export const HERE_KM = 25

/** The city nearest to you, if you are in or close to one. */
export function nearestCity(cities: City[], pos: { lat: number; lng: number } | null): City | undefined {
  if (!pos || !cities.length) return undefined
  const best = [...cities].sort((a, b) => kmFrom(pos, a) - kmFrom(pos, b))[0]
  return kmFrom(pos, best) <= HERE_KM ? best : undefined
}

/** Routes in this city with a badge (solo or team). */
export const badgesIn = (c: City, badges: EarnedBadge[]) => c.routes.filter((r) => badges.some((b) => b.routeId === r.id)).length

/** Best badge for a route, preferring more stars. */
export const bestBadge = (routeId: string, badges: EarnedBadge[]) =>
  badges.filter((b) => b.routeId === routeId).sort((a, b) => b.stars - a.stars || b.points - a.points)[0]

export type RouteStatus =
  | { kind: 'progress'; stop: number; total: number }
  | { kind: 'earned'; stars: number; points: number }
  | { kind: 'new' }

export function routeStatus(route: Route, badges: EarnedBadge[], session: Session | null): RouteStatus {
  if (session && session.routeId === route.id && session.screen !== 'end') return { kind: 'progress', stop: session.index + 1, total: route.stops.length }
  const b = bestBadge(route.id, badges)
  return b ? { kind: 'earned', stars: b.stars, points: b.points } : { kind: 'new' }
}

/** "The Sol Route" → "the Sol Route", for sentences like "Start the Sol Route". */
export const inSentence = (name: string) => name.replace(/^The /, 'the ')
