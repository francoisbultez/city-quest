import { readFileSync } from 'node:fs'
import { parseRoute, type Route } from '../src/engine/schema'

/** Reads and validates a built-in route the same way the app does. */
export function routeFile(id: string): Route {
  const res = parseRoute(JSON.parse(readFileSync(new URL(`../routes/${id}/route.json`, import.meta.url), 'utf8')))
  if (!res.ok) throw new Error(`routes/${id}/route.json: ${res.errors.join('; ')}`)
  return res.route
}
