import { expect, test } from '@playwright/test'
import { useraRoute } from '../src/content/madrid-usera'
import type { Stop } from '../src/types'

const at = (s: Stop) => ({ latitude: s.place.lat, longitude: s.place.lng, accuracy: 10 })

test('pick the Usera route and play it through', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await context.setGeolocation(at(useraRoute.stops[0]))
  await page.goto('/')
  await page.getByRole('button', { name: 'Usera', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Madrid · The Usera Route' })).toBeVisible()
  await expect(page.getByText('~1.5 h')).toBeVisible()
  await page.getByRole('button', { name: 'Start at Usera metro' }).click()

  for (const [i, s] of useraRoute.stops.entries()) {
    await context.setGeolocation(at(s))
    await page.getByRole('button', { name: 'Open the quiz' }).click()
    await expect(page.getByRole('heading', { name: s.question })).toBeVisible()
    await page.getByRole('button', { name: s.answer, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: s.lesson.title })).toBeVisible()
    await page.getByRole('button', { name: i === useraRoute.stops.length - 1 ? 'See my badge' : 'Next riddle' }).click()
  }
  await expect(page.getByText('New badge unlocked')).toBeVisible()
  await expect(page.getByTestId('final-score')).toHaveText('700')
  await expect(page.getByRole('img', { name: /THE USERA ROUTE/ })).toBeVisible()

  // The choice is remembered, and each route keeps its own badge.
  await page.getByRole('button', { name: 'Back to start' }).click()
  await expect(page.getByRole('heading', { name: 'Madrid · The Usera Route' })).toBeVisible()
  await expect(page.getByText('Your badge')).toBeVisible()
  await page.getByRole('button', { name: 'Sol', exact: true }).click()
  await expect(page.getByText('Earn this badge')).toBeVisible()
  expect(errors).toEqual([])
})
