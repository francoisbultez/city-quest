import { expect, test } from '@playwright/test'
import { routeFile } from './routes'

const sol = routeFile('madrid-sol')
const TOLEDO = { latitude: 39.8585, longitude: -4.0226, accuracy: 20 }

test('first launch explains the app, then finds the nearest city', async ({ page, context }) => {
  await context.setGeolocation(TOLEDO)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Discover a city by solving its riddles' })).toBeVisible()
  await expect(page.getByText('Follow a riddle on the map')).toBeVisible()
  await expect(page.getByText('Free · no account · works offline')).toBeVisible()
  await page.getByRole('button', { name: 'Find a hunt near me' }).click()
  await expect(page.getByRole('heading', { name: 'Treasure hunts through Toledo' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()

  // Shown only once.
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Treasure hunts through Toledo' })).toBeVisible()
})

test('first launch: choose a city instead', async ({ page, context }) => {
  await context.clearPermissions()
  await page.goto('/')
  await page.getByRole('button', { name: 'Choose a city instead' }).click()
  await expect(page.getByRole('heading', { name: 'Where are you playing?' })).toBeVisible()
  await page.getByRole('button', { name: /^Madrid/ }).click()
  await expect(page.getByRole('heading', { name: 'Treasure hunts through Madrid' })).toBeVisible()
})

test('You: name, stats, badges and reset', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cq.welcomed', 'true'))
  await page.addInitScript(
    ([id]) => {
      if (!localStorage.getItem('cq.badges')) localStorage.setItem('cq.badges', JSON.stringify([{ routeId: id, mode: 'solo', stars: 3, points: 750, date: '2026-11-20T10:00:00Z' }]))
    },
    [sol.id],
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await page.getByRole('button', { name: 'You', exact: true }).first().click()

  await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible()
  await expect(page.getByText(`${sol.stops.length}`, { exact: true })).toBeVisible() // places found
  await expect(page.getByRole('button', { name: `Madrid · The Sol Route: 3 of 3 stars` })).toBeVisible()
  await expect(page.getByRole('button', { name: /Toledo · The Three Cultures Route: not earned yet/ })).toBeVisible()

  await page.getByRole('button', { name: 'Add name' }).click()
  await page.getByLabel('Name', { exact: true }).fill('Ana')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('heading', { name: 'Ana' })).toBeVisible()
  await page.getByRole('button', { name: 'Explore' }).click()
  await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible()

  await page.getByRole('button', { name: 'You: Ana' }).click()
  await page.getByRole('button', { name: 'Reset my progress' }).click()
  await page.getByRole('button', { name: 'Reset everything' }).click()
  await expect(page.getByRole('button', { name: /The Sol Route: not earned yet/ })).toBeVisible()
})
