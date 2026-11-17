import { expect, test, type Page } from '@playwright/test'
import { solRoute } from '../src/content/madrid-sol'
import type { Stop } from '../src/types'

const stops = solRoute.stops
const at = (s: Stop) => ({ latitude: s.place.lat, longitude: s.place.lng, accuracy: 10 })
// ~2 km south of the Puerta del Sol.
const FAR_AWAY = { latitude: 40.398, longitude: -3.7036, accuracy: 10 }

/** Console errors other than map tiles (blocked or offline in tests). */
function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text())
  })
  return errors
}

async function start(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /^Start at the/ }).click()
}

async function arriveAndOpenQuiz(page: Page, s: Stop) {
  await page.context().setGeolocation(at(s))
  await expect(page.getByText('You found it!')).toBeVisible()
  await page.getByRole('button', { name: 'Open the quiz' }).click()
  await expect(page.getByRole('heading', { name: s.question })).toBeVisible()
}

test.beforeEach(async ({ context }) => {
  await context.setGeolocation(at(stops[0]))
})

test('plays the whole Sol Route solo and unlocks the badge', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Madrid · The Sol Route' })).toBeVisible()
  await expect(page.getByText('Earn this badge')).toBeVisible()
  await expect(page.getByText('0 badges')).toBeVisible()
  await page.getByRole('button', { name: 'Start at the Puerta del Sol' }).click()

  for (const [i, s] of stops.entries()) {
    await expect(page.getByText(`${i + 1} / ${stops.length}`)).toBeVisible()
    await arriveAndOpenQuiz(page, s)

    if (i === 1) {
      // One wrong try: −20
      const wrong = s.options.find((o) => o !== s.answer)!
      await page.getByRole('button', { name: wrong }).click()
      await expect(page.getByText('Not quite. Look again (−20)')).toBeVisible()
      await expect(page.getByRole('button', { name: wrong })).toBeDisabled()
    }
    if (i === 2) {
      // A hint: −40
      await page.getByRole('button', { name: /^Hint/ }).click()
      await expect(page.getByText(s.hint)).toBeVisible()
    }

    await page.getByRole('button', { name: s.answer, exact: true }).click()
    const expected = i === 1 ? 80 : i === 2 ? 60 : 100
    await expect(page.getByText(`+${expected}`)).toBeVisible()
    await expect(page.getByText(i === 1 || i === 2 ? `${s.answer}. Correct!` : `${s.answer}. Perfect!`)).toBeVisible()
    await expect(page.getByText(s.fact)).toBeVisible()

    const last = i === stops.length - 1
    await page.getByRole('button', { name: last ? 'See my badge' : 'Next riddle' }).click()
  }

  await expect(page.getByText('New badge unlocked')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Solo badge: MADRID, THE SOL ROUTE' })).toBeVisible()
  // 6 perfect stops (100) + one wrong try (80) + one hint (60) = 740 → 3 stars
  await expect(page.getByTestId('final-score')).toHaveText('740')
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible()
  await expect(page.getByText('6/8')).toBeVisible()

  await page.getByRole('button', { name: 'Back to start' }).click()
  await expect(page.getByText('1 badge')).toBeVisible()
  await expect(page.getByText('Your badge')).toBeVisible()
  await expect(page.getByText('Best score: 740 points')).toBeVisible()
  expect(errors).toEqual([])
})

test('shows a streak after two perfect answers in a row', async ({ page }) => {
  await start(page)
  await arriveAndOpenQuiz(page, stops[0])
  await page.getByRole('button', { name: stops[0].answer, exact: true }).click()
  await expect(page.getByText(/in a row/)).toHaveCount(0)
  await page.getByRole('button', { name: 'Next riddle' }).click()
  await arriveAndOpenQuiz(page, stops[1])
  await page.getByRole('button', { name: stops[1].answer, exact: true }).click()
  await expect(page.getByText('2 in a row')).toBeVisible()
})

test('walking: distance and warmth, location hint, and "I’m here" fallback', async ({ page, context }) => {
  await context.setGeolocation(FAR_AWAY)
  await start(page)
  await expect(page.getByText(`“${stops[0].riddle}”`)).toBeVisible()
  await expect(page.getByText('km to go')).toBeVisible()
  await expect(page.locator('.heat')).toHaveText('Cold')
  await expect(page.getByRole('button', { name: 'Open the quiz' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Where is it?' }).click()
  await expect(page.getByText(stops[0].whereHint)).toBeVisible()

  // Walking up turns it into "You found it!"
  await context.setGeolocation(at(stops[0]))
  await expect(page.getByText('You found it!')).toBeVisible()

  // Manual fallback works from anywhere.
  await context.setGeolocation(FAR_AWAY)
  await page.getByRole('button', { name: 'I’m here' }).click()
  await expect(page.getByRole('heading', { name: stops[0].question })).toBeVisible()
})

test('progress survives closing the app', async ({ page }) => {
  await start(page)
  await arriveAndOpenQuiz(page, stops[0])
  await page.getByRole('button', { name: stops[0].answer, exact: true }).click()
  await page.getByRole('button', { name: 'Next riddle' }).click()
  await expect(page.getByTestId('score')).toHaveText('100')

  await page.reload()
  await page.getByRole('button', { name: 'Continue · stop 2 of 8' }).click()
  await expect(page.getByText('2 / 8')).toBeVisible()
  await expect(page.getByTestId('score')).toHaveText('100')
})

test('pause menu: report a problem, then leave the route', async ({ page }) => {
  await start(page)
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('dialog', { name: 'Paused' })).toBeVisible()
  await page.getByRole('button', { name: 'Report a problem with this stop' }).click()
  const send = page.getByRole('button', { name: 'Send report' })
  await expect(send).toBeDisabled()
  await page.getByRole('button', { name: 'Covered or closed' }).click()
  await send.click()
  await expect(page.getByText('Thanks! Report saved on this phone.')).toBeVisible()
  const reports = await page.evaluate(() => JSON.parse(localStorage.getItem('cq.reports') ?? '[]'))
  expect(reports).toMatchObject([{ huntId: 'madrid-sol', nodeId: 'km0', reason: 'Covered or closed' }])

  await page.getByRole('button', { name: 'Pause' }).click()
  await page.getByRole('button', { name: 'Leave the route' }).click()
  await expect(page.getByRole('button', { name: 'Start at the Puerta del Sol' })).toBeVisible()
})

test('Together is shown but not playable yet', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Together/ })).toBeDisabled()
  await expect(page.getByText('Coming soon')).toBeVisible()
})

test('test mode lets you teleport to each stop', async ({ page, context }) => {
  await context.setGeolocation(FAR_AWAY)
  await page.goto('/')
  await page.getByRole('button', { name: /^Start at the/ }).click()
  await expect(page.getByRole('button', { name: /Teleport/ })).toHaveCount(0) // off by default
  await page.goto('/?test')
  await page.getByRole('button', { name: 'Continue · stop 1 of 8' }).click()
  await page.getByRole('button', { name: /Teleport to this stop/ }).click()
  await expect(page.getByText('You found it!')).toBeVisible()
  await page.goto('/?test=off')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByRole('button', { name: /Teleport/ })).toHaveCount(0)
})

test('keeps working offline once loaded', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await page.evaluate(() => navigator.serviceWorker.ready)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Madrid · The Sol Route' })).toBeVisible()
  await page.getByRole('button', { name: /^Start at the/ }).click()
  await page.getByRole('button', { name: 'Open the quiz' }).click()
  await expect(page.getByRole('heading', { name: stops[0].question })).toBeVisible()
  await context.setOffline(false)
})
