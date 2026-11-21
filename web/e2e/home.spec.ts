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
  await expect(page.getByRole('button', { name: 'Change city, now Toledo' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What shall we explore today?' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()

  // Shown only once.
  await page.reload()
  await expect(page.getByRole('button', { name: 'Change city, now Toledo' })).toBeVisible()
})

test('first launch: choose a city instead', async ({ page, context }) => {
  await context.clearPermissions()
  await page.goto('/')
  await page.getByRole('button', { name: 'Choose a city instead' }).click()
  await expect(page.getByRole('heading', { name: 'Where are you playing?' })).toBeVisible()
  await page.getByRole('button', { name: /^Madrid/ }).click()
  await expect(page.getByRole('button', { name: 'Change city, now Madrid' })).toBeVisible()
})

test('Your trips: a souvenir and the stories, kept on the phone', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cq.welcomed', 'true'))
  await page.addInitScript(
    ([id]) => {
      // A phone from before trips existed: its badge becomes a trip.
      if (!localStorage.getItem('cq.badges')) localStorage.setItem('cq.badges', JSON.stringify([{ routeId: id, mode: 'solo', stars: 3, points: 750, date: '2026-11-21T17:00:00Z' }]))
    },
    [sol.id],
  )
  await page.goto('/')
  await expect(page.getByRole('button', { name: /^The Sol Route:/ }).getByText('Played')).toBeVisible()

  await page.getByRole('button', { name: 'Your trips' }).click()
  await expect(page.getByRole('heading', { name: 'Your trips' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Going somewhere next\? City Quest also has Toledo/ })).toBeVisible()
  await page.getByRole('button', { name: /^Madrid · The Sol Route, Sat,? 21 Nov 2026/ }).click()

  await expect(page.getByRole('heading', { name: 'Madrid · The Sol Route' })).toBeVisible()
  await page.getByRole('button', { name: /Your souvenir/ }).click()
  await expect(page.getByRole('figure', { name: /^Souvenir: Madrid, The Sol Route/ })).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Save image' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('city-quest-madrid-sol-2026-11-21.png')
  expect((await import('node:fs')).statSync((await file.path())!).size).toBeGreaterThan(50_000)
  await page.getByRole('button', { name: new RegExp(sol.stops[1].lesson.title) }).click()
  await expect(page.getByRole('heading', { level: 1, name: sol.stops[1].lesson.title })).toBeVisible()
  await page.getByRole('button', { name: 'Back to your trip' }).click()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Your trips' })).toBeVisible()

  // Settings: the name goes on souvenirs; deleting empties the list.
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: /Name your team sees/ }).click()
  await page.getByLabel('Name', { exact: true }).fill('Ana')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('button', { name: /Name your team sees\s*Ana/ })).toBeVisible()
  await page.getByRole('button', { name: 'Delete my trips and progress' }).click()
  await page.getByRole('button', { name: 'Delete everything' }).click()
  await expect(page.getByText('No trips yet')).toBeVisible()
})
