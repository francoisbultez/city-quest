import type { EarnedBadge } from './session'
import { load, save } from './storage'

/** One hunt you finished: a memory, not a score to beat. */
export interface Trip {
  id: string
  routeId: string
  /** ISO date the hunt was finished. */
  date: string
  mode: 'solo' | 'team'
  /** Who played (your name in solo if you set one; every teammate in Together). */
  names: string[]
  points: number
  stars: 1 | 2 | 3
  /** Walking time in ms, when known. */
  ms?: number
}

const KEY = 'cq.trips'

/** Trips, newest first. Older versions only kept badges: those become trips too. */
export function loadTrips(badges: EarnedBadge[] = load<EarnedBadge[]>('cq.badges', [])): Trip[] {
  const saved = load<Trip[] | null>(KEY, null)
  if (saved) return saved
  return badges.map((b) => ({ id: `${b.routeId}-${b.date}`, routeId: b.routeId, date: b.date, mode: b.mode, names: [], points: b.points, stars: b.stars })).sort((a, b) => b.date.localeCompare(a.date))
}

export function addTrip(t: Omit<Trip, 'id'>): Trip[] {
  const trip = { ...t, id: `${t.routeId}-${t.date}` }
  const trips = [trip, ...loadTrips().filter((x) => x.id !== trip.id)]
  save(KEY, trips)
  return trips
}

export const clearTrips = () => save(KEY, [])

export function formatTripDate(iso: string, withWeekday = true) {
  return new Date(iso).toLocaleDateString('en-GB', { ...(withWeekday ? { weekday: 'short' } : {}), day: 'numeric', month: 'short', year: 'numeric' })
}

/** "Ana", "Ana & Tom", "Ana, Tom & Lucía". */
export function withNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}
