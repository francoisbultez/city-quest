import { expect, test, type Page } from '@playwright/test'
import { routeFile } from './routes'

const solRoute = routeFile('madrid-sol')
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
    await expect(page.getByText(`${s.answer}. ${i === 1 || i === 2 ? 'Correct!' : 'Perfect!'} +${expected}`)).toBeVisible()
    // The lesson opens straight away.
    await expect(page.getByRole('heading', { level: 1, name: s.lesson.title })).toBeVisible()
    await expect(page.getByRole('img', { name: s.lesson.image!.alt })).toBeVisible()
    await expect(page.getByText(`Photo: ${s.lesson.image!.credit.artist}`)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'The story' })).toBeVisible()
    await expect(page.getByText(s.lesson.think)).toBeVisible()

    if (i === 0) {
      // Quick check: right answer earns +10, and can't be answered twice.
      await page.getByRole('button', { name: s.lesson.check.answer, exact: true }).click()
      await expect(page.getByText('Right! You were paying attention.')).toBeVisible()
      await expect(page.getByText('+10 earned')).toBeVisible()
      await expect(page.getByRole('button', { name: s.lesson.check.answer, exact: true })).toBeDisabled()
      // Tick a "look closer" item.
      const spot = page.getByRole('button', { name: new RegExp(s.lesson.lookCloser[0].title.replace('.', '\\.')) })
      await spot.click()
      await expect(spot).toHaveAttribute('aria-pressed', 'true')
    }
    if (i === 1) {
      // Wrong quick check: no bonus, the right answer is shown.
      const wrong = s.lesson.check.options.find((o) => o !== s.lesson.check.answer)!
      await page.getByRole('button', { name: wrong, exact: true }).click()
      await expect(page.getByText(`The answer is ${s.lesson.check.answer}.`)).toBeVisible()
      await expect(page.getByText('No bonus')).toBeVisible()
    }

    const last = i === stops.length - 1
    await page.getByRole('button', { name: last ? 'See my badge' : 'Next riddle' }).click()
  }

  await expect(page.getByText('New badge unlocked')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Solo badge: MADRID, THE SOL ROUTE' })).toBeVisible()
  // 6 perfect stops (100) + one wrong try (80) + one hint (60) + one quick check (10) = 750 → 3 stars
  await expect(page.getByTestId('final-score')).toHaveText('750')
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible()
  await expect(page.getByText('6/8')).toBeVisible()
  await expect(page.getByText('1 of 8 quick checks right · 1 details spotted')).toBeVisible()

  // The recap reopens any lesson.
  await expect(page.getByRole('heading', { name: '8 places you discovered' })).toBeVisible()
  await page.getByRole('button', { name: new RegExp(stops[2].lesson.title) }).click()
  await expect(page.getByRole('heading', { level: 1, name: stops[2].lesson.title })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to my badge' }).first().click()
  await expect(page.getByText('New badge unlocked')).toBeVisible()

  await page.getByRole('button', { name: 'Back to start' }).click()
  await expect(page.getByText('1 badge')).toBeVisible()
  await expect(page.getByText('Your badge')).toBeVisible()
  await expect(page.getByText('Best score: 750 points')).toBeVisible()
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
  await expect(page.getByText(/2 in a row/)).toBeVisible()
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

test('Listen reads the lesson aloud and stops when you move on', async ({ page }) => {
  // Headless browsers have no voices: stand in for speechSynthesis and record what is spoken.
  await page.addInitScript(() => {
    const w = window as unknown as { __spoken: string[]; __cancelled: number }
    w.__spoken = []
    w.__cancelled = 0
    class FakeUtterance {
      text: string
      lang = ''
      rate = 1
      voice: unknown = null
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(t: string) { this.text = t }
    }
    let pending: FakeUtterance | null = null
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [],
        cancel: () => { w.__cancelled++; pending = null },
        // Each sentence "finishes" after a short delay, unless cancelled.
        speak: (u: FakeUtterance) => { w.__spoken.push(u.text); pending = u; setTimeout(() => { if (pending === u) u.onend?.() }, 150) },
      },
    })
  })
  await start(page)
  await arriveAndOpenQuiz(page, stops[0])
  await page.getByRole('button', { name: stops[0].answer, exact: true }).click()

  const listen = page.getByRole('button', { name: 'Listen' })
  await listen.click()
  await expect(page.getByRole('button', { name: 'Stop' })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.length)).toBeGreaterThan(2)
  const spoken = await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.join(' '))
  expect(spoken).toContain(stops[0].lesson.title)

  await page.getByRole('button', { name: 'Stop' }).click()
  await expect(page.getByRole('button', { name: 'Listen' })).toBeVisible()

  // Moving on stops any reading.
  await page.getByRole('button', { name: 'Listen' }).click()
  const before = await page.evaluate(() => (window as unknown as { __cancelled: number }).__cancelled)
  await page.getByRole('button', { name: 'Next riddle' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { __cancelled: number }).__cancelled)).toBeGreaterThan(before)
})
