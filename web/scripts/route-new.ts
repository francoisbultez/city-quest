// Starts a new route folder from a template. Usage: npm run route:new my-city-old-town
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const id = process.argv[2]
if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.log('Usage: npm run route:new <id>   (lower-case letters, numbers and dashes, e.g. lisbon-alfama)')
  process.exit(1)
}
const dir = new URL(`../routes/${id}/`, import.meta.url)
if (existsSync(dir)) {
  console.log(`routes/${id} already exists`)
  process.exit(1)
}
mkdirSync(new URL('images/', dir), { recursive: true })
const stop = (n: number, lat: number) => ({
  id: `stop-${n}`,
  place: { name: `Place ${n}`, lat, lng: -3.7038, radiusM: 50 },
  riddle: 'A riddle that leads to this place.',
  whereHint: 'Where it is, in plain words.',
  look: 'What to look at',
  question: 'A question you can only answer by looking?',
  options: ['Right answer', 'Wrong 1', 'Wrong 2', 'Wrong 3'],
  answer: 'Right answer',
  hint: 'A small nudge (costs points).',
  lesson: { title: `Place ${n}`, subtitle: 'One line about why it matters', story: [{ lead: 'A bold start.', text: 'A short paragraph.' }] },
})
const route = {
  $schema: '../route.schema.json',
  formatVersion: 1,
  id,
  language: 'en',
  city: 'City',
  name: 'The New Route',
  badgeLine: 'THE NEW ROUTE',
  tagline: 'One line that makes people want to go',
  start: 'the main square',
  duration: '~1.5 h',
  author: { name: 'Your name' },
  stops: [stop(1, 40.4168), stop(2, 40.4198)],
}
writeFileSync(new URL('route.json', dir), JSON.stringify(route, null, 2) + '\n')
console.log(`Created routes/${id}/route.json. Edit it, then run: npm run route:check routes/${id}`)
