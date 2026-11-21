import { expect, test } from '@playwright/test'
import { builtInIds, openRoute, routeFile } from './routes'
import type { Stop } from '../src/types'

const at = (s: Stop) => ({ latitude: s.place.lat, longitude: s.place.lng, accuracy: 10 })

// Every built-in route can be picked and played to the end.
for (const id of builtInIds()) {
  const route = routeFile(id)
  test(`pick ${route.city} · ${route.name} and play it through`, async ({ page, context }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await context.setGeolocation(at(route.stops[0]))
    await page.goto('/')
    await openRoute(page, route)
    await expect(page.getByText(route.duration.replace(/^~/, ''), { exact: true })).toBeVisible()
    await page.getByRole('button', { name: `Start at ${route.start}` }).click()

    for (const [i, s] of route.stops.entries()) {
      await context.setGeolocation(at(s))
      await page.getByRole('button', { name: 'Open the quiz' }).click()
      await expect(page.getByRole('heading', { name: s.question })).toBeVisible()
      await page.locator('.options button').nth(s.options.indexOf(s.answer)).click()
      await expect(page.getByRole('heading', { level: 1, name: s.lesson.title })).toBeVisible()
      if (s.lesson.image) await expect(page.locator('.lesson-photo img')).toHaveJSProperty('complete', true)
      await page.getByRole('button', { name: i === route.stops.length - 1 ? 'See my badge' : 'Next riddle' }).click()
    }
    await expect(page.getByText('New badge unlocked')).toBeVisible()
    await expect(page.getByTestId('final-score')).toHaveText(String(route.stops.length * 100))
    await expect(page.getByRole('img', { name: new RegExp(route.badgeLine) })).toBeVisible()

    // The choice is remembered and the route now shows its badge.
    await page.getByRole('button', { name: 'Back to start' }).click()
    await expect(page.getByRole('button', { name: `Change city, now ${route.city}` })).toBeVisible()
    await expect(page.getByRole('button', { name: new RegExp(`^${route.name}:`) }).getByText(/Best \d+ pts/)).toBeVisible()
    expect(errors).toEqual([])
  })
}

const LINK = 'https://routes.example.org/lisbon-tiny/route.json'
const tinyRoute = {
  formatVersion: 1,
  id: 'lisbon-tiny',
  language: 'en',
  localLanguage: { code: 'pt', name: 'Portuguese' },
  city: 'Lisboa',
  name: 'The Tiny Tram Route',
  badgeLine: 'TINY TRAM',
  tagline: 'Two stops, made by a player',
  start: 'Praça do Comércio',
  duration: '~20 min',
  theme: { colors: ['#006600', '#ffcc00'] },
  author: { name: 'A player' },
  stops: [
    {
      id: 'arch',
      place: { name: 'Arco da Rua Augusta', lat: 38.7086, lng: -9.1366, radiusM: 40 },
      riddle: 'Walk under the triumphal arch.',
      question: 'How many figures stand on top?',
      options: ['1', '3', '6'],
      answer: '3',
      lesson: { title: 'Arco da Rua Augusta', image: { src: 'images/arch.jpg', alt: 'The arch seen from the square', credit: { artist: 'Someone', license: 'CC0', page: 'https://routes.example.org/credits' } }, words: [{ word: 'arco', meaning: 'arch' }] },
    },
    {
      id: 'tram',
      place: { name: 'Tram 28 stop', lat: 38.7105, lng: -9.1335, radiusM: 40 },
      riddle: 'Find the yellow tram.',
      question: 'What colour is the tram?',
      options: ['Yellow', 'Blue'],
      answer: 'Yellow',
      lesson: { title: 'Tram 28' },
    },
  ],
}

test('add a route someone else made, from a link', async ({ page, context }) => {
  await context.route(LINK, (r) => r.fulfill({ json: tinyRoute, headers: { 'access-control-allow-origin': '*' } }))
  const images: string[] = []
  await context.route('https://routes.example.org/lisbon-tiny/images/*', (r) => {
    images.push(r.request().url())
    return r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"/>' })
  })
  await context.setGeolocation({ latitude: 38.7086, longitude: -9.1366, accuracy: 10 })

  await page.goto(`/?route=${encodeURIComponent(LINK)}`)
  await expect(page.getByRole('status')).toHaveText('Added “Lisboa · The Tiny Tram Route”')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Explore Lisboa' })).toBeVisible()
  await openRoute(page, tinyRoute)
  await expect(page.getByRole('img', { name: /LISBOA, TINY TRAM/ })).toBeVisible()
  await expect(page.getByText('Route by A player')).toBeVisible()

  await page.getByRole('button', { name: 'Start at Praça do Comércio' }).click()
  await page.getByRole('button', { name: 'Open the quiz' }).click()
  await expect(page.getByRole('button', { name: /Hint/ })).toHaveCount(0) // optional parts are simply left out
  await page.getByRole('button', { name: '3', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Arco da Rua Augusta' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Portuguese words' })).toBeVisible()
  await expect.poll(() => [...new Set(images)]).toEqual(['https://routes.example.org/lisbon-tiny/images/arch.jpg'])

  // Still there after a reload, without the link.
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Explore Lisboa' })).toBeVisible()
})

test('a broken route file is refused with the reason', async ({ page, context }) => {
  const broken = structuredClone(tinyRoute)
  broken.stops[1].answer = 'Green'
  await context.route(LINK, (r) => r.fulfill({ json: broken, headers: { 'access-control-allow-origin': '*' } }))
  await page.goto(`/?route=${encodeURIComponent(LINK)}`)
  await expect(page.getByRole('status')).toContainText('This route file has mistakes, so it can’t be played. stops.1.answer: answer must be one of the options')
  await page.getByRole('button', { name: /^Change city/ }).click()
  await expect(page.getByRole('button', { name: /^Lisboa/ })).toHaveCount(0)
})
