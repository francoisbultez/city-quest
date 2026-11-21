import { citiesFrom } from './cities'
import { routeKm } from './route'
import type { EarnedBadge } from './session'
import { load, save } from './storage'
import type { Route } from '../types'

const SINCE_KEY = 'cq.since'
const WELCOME_KEY = 'cq.welcomed'

/** First day this phone played, for "Explorer since …". */
export function since(): Date {
  let s = load<string | null>(SINCE_KEY, null)
  if (!s) {
    s = new Date().toISOString()
    save(SINCE_KEY, s)
  }
  return new Date(s)
}

export const welcomed = () => load(WELCOME_KEY, false)
export const setWelcomed = () => save(WELCOME_KEY, true)

/** Totals from the routes you finished (each counted once, whatever the mode). */
export function stats(routes: Route[], badges: EarnedBadge[]) {
  const done = routes.filter((r) => badges.some((b) => b.routeId === r.id))
  return {
    badges: done.length,
    places: done.reduce((n, r) => n + r.stops.length, 0),
    km: done.reduce((n, r) => n + routeKm(r.stops), 0),
    cities: citiesFrom(done).length,
  }
}

const AVATAR_COLORS = ['#2f4bff', '#0f9f6e', '#8b6cff', '#e0592a', '#d6336c', '#1c7ed6']
/** A stable colour per name, so your avatar looks the same everywhere. */
export function avatarColor(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
