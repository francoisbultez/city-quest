import { load, save } from '../lib/storage'
import { ComingSoonSchema, parseRoute, type Route } from './schema'

/**
 * Where routes come from.
 *
 * 1. Built in: every folder in `web/routes/<id>/` with a `route.json`.
 *    Add a folder to add a route; delete it to remove one. No code changes.
 * 2. Added by link: any `route.json` on the web (https), opened with
 *    `?route=<link>`. It is validated, then kept on this phone so it works
 *    offline and after a reload.
 *
 * Image paths in a route are relative to its folder (or its link), and are
 * turned into real URLs here, so the screens never need to know where a
 * route came from.
 */

const ADDED_KEY = 'cq.addedRoutes'

interface AddedRoute {
  url: string
  data: unknown
}

// Vite bundles these at build time, so built-in routes work offline.
const builtInFiles = import.meta.glob<unknown>('/routes/*/route.json', { eager: true, import: 'default' })
const builtInImages = import.meta.glob<string>('/routes/*/images/*', { eager: true, query: '?url', import: 'default' })
const comingSoonFile = import.meta.glob<unknown>('/routes/coming-soon.json', { eager: true, import: 'default' })

/** Cities announced in routes/coming-soon.json (optional file). */
export const comingSoon = (() => {
  const data = Object.values(comingSoonFile)[0]
  if (data === undefined) return []
  const res = ComingSoonSchema.safeParse(data)
  if (!res.success) {
    console.warn('routes/coming-soon.json is not valid and was skipped', res.error.issues)
    return []
  }
  return res.data.cities
})()

/** Gives every image a URL the browser can load. */
function resolveImages(route: Route, resolve: (src: string) => string | undefined): Route {
  return {
    ...route,
    stops: route.stops.map((s) => {
      const img = s.lesson.image
      if (!img) return s
      const src = /^https:\/\//.test(img.src) ? img.src : resolve(img.src)
      return { ...s, lesson: { ...s.lesson, image: src ? { ...img, src } : undefined } }
    }),
  }
}

function loadBuiltIn(): { routes: Route[]; problems: Record<string, string[]> } {
  const routes: Route[] = []
  const problems: Record<string, string[]> = {}
  for (const [file, data] of Object.entries(builtInFiles).sort(([a], [b]) => a.localeCompare(b))) {
    const folder = file.split('/')[2]
    const res = parseRoute(data)
    if (!res.ok) {
      problems[file] = res.errors
      continue
    }
    if (res.route.id !== folder) {
      problems[file] = [`id "${res.route.id}" must match its folder name "${folder}"`]
      continue
    }
    routes.push(resolveImages(res.route, (src) => builtInImages[`/routes/${folder}/${src.replace(/^\.?\//, '')}`]))
  }
  return { routes, problems }
}

const builtIn = loadBuiltIn()
if (Object.keys(builtIn.problems).length) console.warn('Some routes were skipped because they are not valid:', builtIn.problems)

/** Validation problems in built-in route files (empty when all is well). Used by the tests. */
export const builtInProblems = builtIn.problems

function loadAdded(): { route: Route; url: string }[] {
  const ids = new Set(builtIn.routes.map((r) => r.id))
  const out: { route: Route; url: string }[] = []
  for (const a of load<AddedRoute[]>(ADDED_KEY, [])) {
    const res = parseRoute(a.data)
    if (res.ok && !ids.has(res.route.id)) {
      out.push({ route: resolveImages(res.route, (src) => new URL(src, a.url).href), url: a.url })
      ids.add(res.route.id)
    }
  }
  return out
}

let added = loadAdded()
const listeners = new Set<() => void>()
let snapshot: Route[] = [...builtIn.routes, ...added.map((a) => a.route)]

function changed() {
  snapshot = [...builtIn.routes, ...added.map((a) => a.route)]
  listeners.forEach((l) => l())
}

export const getRoutes = () => snapshot
export const subscribeRoutes = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const findRoute = (id: string | undefined): Route | undefined => snapshot.find((r) => r.id === id)
/** The route with this id, or the first route when it isn't installed. */
export const routeById = (id: string | undefined): Route => findRoute(id) ?? snapshot[0]

/** The link a route was added from (undefined for built-in routes). */
export const sourceUrlOf = (id: string) => added.find((a) => a.route.id === id)?.url
export const isBuiltIn = (id: string) => builtIn.routes.some((r) => r.id === id)

export class RouteError extends Error {
  details: string[]
  constructor(message: string, details: string[] = []) {
    super(message)
    this.details = details
  }
}

/** Downloads, checks and keeps a route from a link. Returns the route, ready to play. */
export async function addRouteFromUrl(link: string, fetcher: typeof fetch = fetch): Promise<Route> {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    throw new RouteError('That doesn’t look like a link.')
  }
  if (url.protocol !== 'https:') throw new RouteError('Route links must start with https://')
  let data: unknown
  try {
    const res = await fetcher(url.href)
    if (!res.ok) throw new Error(String(res.status))
    data = await res.json()
  } catch {
    throw new RouteError('Couldn’t download that route. Check the link and your connection.')
  }
  const res = parseRoute(data)
  if (!res.ok) throw new RouteError('This route file has mistakes, so it can’t be played.', res.errors)
  if (isBuiltIn(res.route.id)) throw new RouteError(`A built-in route already uses the id “${res.route.id}”.`)
  const entry = { url: url.href, data }
  const others = load<AddedRoute[]>(ADDED_KEY, []).filter((a) => {
    const r = parseRoute(a.data)
    return r.ok && r.route.id !== res.route.id
  })
  save(ADDED_KEY, [...others, entry])
  added = loadAdded()
  changed()
  return findRoute(res.route.id)!
}

export function removeAddedRoute(id: string) {
  save(
    ADDED_KEY,
    load<AddedRoute[]>(ADDED_KEY, []).filter((a) => {
      const r = parseRoute(a.data)
      return !(r.ok && r.route.id === id)
    }),
  )
  added = loadAdded()
  changed()
}
