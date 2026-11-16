import { expect, test, type Page } from '@playwright/test'
import { madridBear } from '../src/content/madrid-bear'
import type { ClueNode } from '../src/types'

const nodes = madridBear.nodes
const SOL = { latitude: nodes[0].place.lat, longitude: nodes[0].place.lng, accuracy: 10 }
// ~2 km south of the Puerta del Sol.
const FAR_AWAY = { latitude: 40.398, longitude: -3.7036, accuracy: 10 }

function correct(n: ClueNode) {
  return n.question.kind === 'choice' ? n.question.answer : n.question.answers[0]
}

async function answer(page: Page, n: ClueNode, value: string) {
  if (n.question.kind === 'choice') {
    await page.getByRole('button', { name: value, exact: true }).click()
  } else {
    await page.getByPlaceholder('Your answer').fill(value)
    await page.getByRole('button', { name: 'Check' }).click()
  }
}

async function goTo(page: Page, n: ClueNode) {
  await page.context().setGeolocation({ latitude: n.place.lat, longitude: n.place.lng, accuracy: 10 })
}

/** Console errors other than map tiles (blocked or offline in tests). */
function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text())
  })
  return errors
}

test.beforeEach(async ({ context }) => {
  await context.setGeolocation(SOL)
})

test('plays the full 2-hour hunt from Sol to Templo de Debod', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: madridBear.title })).toBeVisible()
  await page.getByRole('button', { name: '2 h or more' }).click()
  await expect(page.locator('.summary')).toContainText(`${nodes.length} stops`)
  await page.getByRole('button', { name: 'Start the hunt' }).click()

  for (const [i, n] of nodes.entries()) {
    await goTo(page, n)
    await expect(page.getByText(`Clue ${i + 1} / ${nodes.length}`)).toBeVisible()
    await expect(page.getByRole('heading', { name: n.title })).toBeVisible()
    await expect(page.getByText('You’re here!')).toBeVisible()
    await page.getByRole('button', { name: 'Open the clue' }).click()
    await expect(page.getByText(n.question.prompt)).toBeVisible()

    if (i === 1) {
      // A wrong answer is rejected, then a hint is used.
      const wrong = n.question.kind === 'choice' ? n.question.options.find((o) => o !== correct(n))! : 'nope'
      await answer(page, n, wrong)
      await expect(page.getByText('Not quite. Look again.')).toBeVisible()
      await page.getByRole('button', { name: 'Need a hint?' }).click()
      await expect(page.getByText(n.hint)).toBeVisible()
    }

    await answer(page, n, correct(n))
    await expect(page.locator('.reveal')).toContainText(n.reveal.slice(0, 30))
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const last = i === nodes.length - 1
    await page.getByRole('button', { name: last ? 'Finish the hunt' : 'Next clue' }).click()
  }

  await expect(page.getByText('Hunt complete')).toBeVisible()
  await expect(page.locator('.stats')).toContainText(`${nodes.length}clues solved`)
  await expect(page.locator('.stats')).toContainText('1hints used')
  await page.getByRole('button', { name: 'Back to start' }).click()
  await expect(page.getByRole('button', { name: 'Start the hunt' })).toBeVisible()
  expect(errors).toEqual([])
})

test('accepts typed answers with any accents or capitals', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start the hunt' }).click()
  await page.getByRole('button', { name: 'Open the clue' }).click()
  await page.getByPlaceholder('Your answer').fill('  KILÓMETRO cero ')
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.locator('.reveal')).toBeVisible()
})

test('locks the clue until you are at the stop, with a manual fallback', async ({ page, context }) => {
  await context.setGeolocation(FAR_AWAY)
  await page.goto('/')
  await page.getByRole('button', { name: 'Start the hunt' }).click()
  await expect(page.locator('.geo')).toContainText('km away')
  await expect(page.getByRole('button', { name: 'Get closer to open the clue' })).toBeDisabled()

  // Walking up to the stop unlocks it.
  await context.setGeolocation(SOL)
  await expect(page.getByRole('button', { name: 'Open the clue' })).toBeEnabled()

  // Manual fallback works from anywhere.
  await context.setGeolocation(FAR_AWAY)
  await expect(page.getByRole('button', { name: 'Get closer to open the clue' })).toBeDisabled()
  await page.getByRole('button', { name: 'GPS not working? I’m there' }).click()
  await expect(page.getByText(nodes[0].question.prompt)).toBeVisible()
})

test('route planner adapts to time and accessibility', async ({ page }) => {
  await page.goto('/')
  const summary = page.locator('.summary')
  await page.getByRole('button', { name: '2 h or more' }).click()
  await expect(summary).toContainText('8 stops')
  await page.getByRole('button', { name: 'About 1.5 h' }).click()
  await expect(summary).not.toContainText('8 stops')
  await page.getByRole('button', { name: '2 h or more' }).click()
  await page.getByLabel('Step-free route (wheelchair, buggy)').check()
  await expect(summary).toContainText('7 stops')

  await page.getByRole('button', { name: 'Start the hunt' }).click()
  // Clue 3 → 4 should skip the Cuchilleros stairs.
  for (const id of ['km0', 'bear', 'plaza-mayor']) {
    const n = nodes.find((x) => x.id === id)!
    await goTo(page, n)
    await page.getByRole('button', { name: 'Open the clue' }).click()
    await answer(page, n, correct(n))
    await page.getByRole('button', { name: 'Next clue' }).click()
  }
  await expect(page.getByRole('heading', { name: 'Under a roof of iron' })).toBeVisible()
})

test('resumes where you left off after closing the page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start the hunt' }).click()
  await page.getByRole('button', { name: 'Open the clue' }).click()
  await answer(page, nodes[0], correct(nodes[0]))
  await page.getByRole('button', { name: 'Next clue' }).click()
  await expect(page.getByText('Clue 2 /')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Clue 2 /')).toBeVisible()
  await expect(page.getByRole('heading', { name: nodes[1].title })).toBeVisible()
})

test('leaving the hunt asks first, then resets', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start the hunt' }).click()

  await page.getByRole('button', { name: 'Leave hunt' }).click()
  await expect(page.getByRole('dialog', { name: 'Leave this hunt?' })).toBeVisible()
  await page.getByRole('button', { name: 'Keep playing' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('Clue 1 /')).toBeVisible()

  await page.getByRole('button', { name: 'Leave hunt' }).click()
  await page.getByRole('button', { name: 'Yes, leave' }).click()
  await expect(page.getByRole('button', { name: 'Start the hunt' })).toBeVisible()
})

test('saves broken-clue reports on the device', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start the hunt' }).click()
  await page.getByRole('button', { name: 'Report a problem with this clue' }).click()
  const send = page.getByRole('button', { name: 'Send report' })
  await expect(send).toBeDisabled() // nothing chosen yet
  await page.getByRole('button', { name: 'Covered or closed' }).click()
  await page.getByPlaceholder(/Details/).fill('Plaque covered by a stage')
  await send.click()
  await expect(page.locator('.toast')).toContainText('Thanks!')
  const reports = await page.evaluate(() => JSON.parse(localStorage.getItem('cq.reports') ?? '[]'))
  expect(reports).toMatchObject([{ huntId: 'madrid-bear', nodeId: 'km0', reason: 'Covered or closed: Plaque covered by a stage' }])
})

test('test mode lets you teleport to each stop', async ({ page, context }) => {
  await context.setGeolocation(FAR_AWAY)
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Teleport/ })).toHaveCount(0) // off by default
  await page.goto('/?test')
  await page.getByRole('button', { name: 'Start the hunt' }).click()
  await page.getByRole('button', { name: /Teleport to this stop/ }).click()
  await expect(page.getByText('You’re here!')).toBeVisible()
  await page.goto('/?test=off')
  await expect(page.getByRole('button', { name: /Teleport/ })).toHaveCount(0)
})

test('keeps working offline once loaded', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload() // let the service worker take control
  await page.evaluate(() => navigator.serviceWorker.ready)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: madridBear.title })).toBeVisible()
  await page.getByRole('button', { name: 'Start the hunt' }).click()
  await page.getByRole('button', { name: 'Open the clue' }).click()
  await expect(page.getByText(nodes[0].question.prompt)).toBeVisible()
  await context.setOffline(false)
})
