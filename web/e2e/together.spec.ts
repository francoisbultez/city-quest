import { expect, test, type Page } from '@playwright/test'
import { routeFile } from './routes'

const solRoute = routeFile('madrid-sol')
import type { Stop } from '../src/types'

const stops = solRoute.stops
const at = (s: Stop) => ({ latitude: s.place.lat, longitude: s.place.lng, accuracy: 10 })

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text())
  })
  return errors
}

/** Ana starts a team; Tom joins with the invite link. Both phones share one browser (local stand-in). */
async function makeTeam(ana: Page, tom: Page) {
  await ana.goto('/')
  await ana.getByRole('button', { name: /Together/ }).click()
  await ana.getByRole('button', { name: 'Start or join a team' }).click()
  await ana.getByLabel('Your name').fill('Ana')
  await ana.getByRole('button', { name: 'Start a new team' }).click()
  await expect(ana.getByRole('heading', { name: 'Invite your team' })).toBeVisible()
  const code = (await ana.getByTestId('team-code').innerText()).replace(/\s/g, '')
  expect(code).toMatch(/^[A-Z0-9]{4}$/)

  await tom.goto(`/?team=${code}`)
  await expect(tom.getByLabel('Team code')).toHaveValue(code)
  await tom.getByLabel('Your name').fill('Tom')
  await tom.getByRole('button', { name: 'Join the team' }).click()
  await expect(tom.getByRole('heading', { name: 'You’re on the team!' })).toBeVisible()
  await expect(tom.getByText('Waiting for Ana to start…')).toBeVisible()
  await expect(ana.getByText('Tom', { exact: true })).toBeVisible()
  return code
}

const both = (ana: Page, tom: Page) => [ana, tom]
const option = (p: Page, i: number) => p.locator('.options button').nth(i)
// ~2 km south of the Puerta del Sol.
const FAR_AWAY = { latitude: 40.398, longitude: -3.7036, accuracy: 10 }

test.beforeEach(async ({ context }) => {
  await context.setGeolocation(at(stops[0]))
})

test('two phones play the whole route together and share one team badge', async ({ context }) => {
  const ana = await context.newPage()
  const tom = await context.newPage()
  const errors = [...trackErrors(ana), ...trackErrors(tom)]
  await makeTeam(ana, tom)
  await ana.getByRole('button', { name: 'We’re ready' }).click()

  for (const [i, s] of stops.entries()) {
    await context.setGeolocation(at(s))
    // Same riddle on both phones; one arrival opens the quiz for everyone.
    for (const p of both(ana, tom)) await expect(p.getByText('You found it!')).toBeVisible()
    await (i % 2 ? tom : ana).getByRole('button', { name: 'Open the quiz' }).click()
    for (const p of both(ana, tom)) await expect(p.getByRole('heading', { name: s.question })).toBeVisible()

    const answer = s.options.indexOf(s.answer)
    if (i === 1) {
      // Both agree on a wrong answer: it is crossed out on both phones.
      const wrong = (answer + 1) % 4
      await option(ana, wrong).click()
      await expect(ana.getByTestId('vote-status')).toHaveText('1 of 2 agree · waiting for Tom')
      await option(tom, wrong).click()
      for (const p of both(ana, tom)) await expect(p.getByText('Not quite. Look again (−20)')).toBeVisible()
      await expect(option(tom, wrong)).toBeDisabled()
    }

    // Ana picks; Tom sees her pick and goes with it, which locks the answer.
    if (i === 2) await option(tom, (answer + 2) % 4).click()
    await option(ana, answer).click()
    await expect(tom.getByTestId('vote-status')).toHaveText(`Ana picked ${s.answer}`)
    if (i === 2) await expect(ana.getByTestId('vote-status')).toHaveText(`Tom picked ${s.options[(answer + 2) % 4]}`)
    await tom.getByRole('button', { name: `${i === 2 ? 'Switch to' : 'Go with'} ${s.answer}` }).click()
    for (const p of both(ana, tom)) await expect(p.getByRole('heading', { level: 1, name: s.lesson.title })).toBeVisible()

    // The team moves on when both are ready.
    const next = i === stops.length - 1 ? 'See our badge' : 'Next riddle'
    await ana.getByRole('button', { name: next }).click()
    await expect(ana.getByRole('button', { name: 'Waiting for Tom' })).toBeVisible()
    await tom.getByRole('button', { name: next }).click()
  }

  for (const p of both(ana, tom)) {
    await expect(p.getByText('Team badge unlocked')).toBeVisible()
    await expect(p.getByRole('img', { name: /Team badge/ })).toBeVisible()
    await expect(p.getByTestId('final-score')).toHaveText('780')
    await expect(p.getByText('Team · Ana and Tom')).toBeVisible()
    await expect(p.getByTestId('award')).toBeVisible()
  }
  await expect(ana.getByTestId('award')).toContainText('Sharp eyes')
  await expect(tom.getByTestId('award')).toContainText('Trailblazer')
  expect(errors).toEqual([])
})

test('a reload takes you back to your team', async ({ context }) => {
  await context.setGeolocation(FAR_AWAY)
  const ana = await context.newPage()
  const tom = await context.newPage()
  const code = await makeTeam(ana, tom)
  await ana.getByRole('button', { name: 'We’re ready' }).click()
  await expect(tom.getByText(stops[0].riddle, { exact: false })).toBeVisible()

  await tom.reload()
  await tom.getByRole('button', { name: `Back to your team · ${code}` }).click()
  await expect(tom.getByText(stops[0].riddle, { exact: false })).toBeVisible()
})

test('wrong codes and leaving the team', async ({ context }) => {
  const ana = await context.newPage()
  const tom = await context.newPage()
  await makeTeam(ana, tom)

  const eve = await context.newPage()
  await eve.goto('/?team=ZZZZ')
  await eve.getByLabel('Your name').fill('Eve')
  await eve.getByRole('button', { name: 'Join the team' }).click()
  await expect(eve.getByRole('alert')).toHaveText('No team with the code ZZZZ. Check it with your friends.')

  await tom.getByRole('button', { name: 'Leave' }).click()
  await expect(tom.getByRole('button', { name: 'Start or join a team' })).toBeVisible()
  await expect(ana.getByText('Tom', { exact: true })).toHaveCount(0)
  await expect(ana.getByRole('button', { name: 'Start without waiting' })).toBeVisible()
})
