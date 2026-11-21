import { readdirSync, readFileSync } from 'node:fs'
import { parseRoute, type Route } from '../src/engine/schema'

/** Reads and validates a built-in route the same way the app does. */
export function routeFile(id: string): Route {
  const res = parseRoute(JSON.parse(readFileSync(new URL(`../routes/${id}/route.json`, import.meta.url), 'utf8')))
  if (!res.ok) throw new Error(`routes/${id}/route.json: ${res.errors.join('; ')}`)
  return res.route
}

export const builtInIds = () =>
  readdirSync(new URL('../routes/', import.meta.url), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

/** From the home screen: switch to the route's city if needed, then open the route's preview. */
export async function openRoute(page: import('@playwright/test').Page, route: { city: string; name: string }) {
  const cityBtn = page.getByRole('button', { name: /^Change city, now / })
  if ((await cityBtn.getAttribute('aria-label')) !== `Change city, now ${route.city}`) {
    await cityBtn.click()
    await page.getByRole('button', { name: new RegExp(`^${route.city}\\b`) }).click()
  }
  await page.getByRole('button', { name: new RegExp(`^${route.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`) }).click()
  await page.getByRole('heading', { level: 1, name: route.name }).waitFor()
}
