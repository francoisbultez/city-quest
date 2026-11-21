// Checks route folders the way the app will load them, plus walkability warnings.
// Usage: npm run route:check [routes/my-route ...]   (no arguments: every folder in routes/)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { distanceM, MAX_GPS_SLACK_M } from '../src/lib/route'
import { parseRoute } from '../src/engine/schema'

const root = new URL('../routes/', import.meta.url).pathname
const args = process.argv.slice(2)
const folders = args.length ? args : readdirSync(root).filter((f) => statSync(join(root, f)).isDirectory()).map((f) => join(root, f))
let failed = 0

for (const dir of folders) {
  const name = dir.replace(/\/$/, '').split('/').pop()!
  const errors: string[] = []
  const warnings: string[] = []
  const file = join(dir, 'route.json')
  if (!existsSync(file)) {
    console.log(`✗ ${name}: no route.json`)
    failed++
    continue
  }
  let data: unknown
  try {
    data = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    console.log(`✗ ${name}: route.json is not valid JSON (${(e as Error).message})`)
    failed++
    continue
  }
  const res = parseRoute(data)
  if (!res.ok) errors.push(...res.errors)
  else {
    const r = res.route
    if (r.id !== name) errors.push(`id "${r.id}" must match the folder name "${name}"`)
    if (r.cover && !/^https:\/\//.test(r.cover.src) && !existsSync(join(dir, r.cover.src))) errors.push(`cover.src: file "${r.cover.src}" not found in the route folder`)
    r.stops.forEach((s, i) => {
      const img = s.lesson.image
      if (img && !/^https:\/\//.test(img.src) && !existsSync(join(dir, img.src))) errors.push(`stops.${i}.lesson.image.src: file "${img.src}" not found in the route folder`)
      if (i > 0) {
        const d = distanceM(r.stops[i - 1].place, s.place)
        if (d > 1500) warnings.push(`stops.${i}: ${Math.round(d)} m from the previous stop (more than 1.5 km)`)
        if (d <= s.place.radiusM + MAX_GPS_SLACK_M) warnings.push(`stops.${i}: only ${Math.round(d)} m from the previous stop, players may "arrive" too early`)
      }
      if (s.riddle.toLowerCase().includes(s.answer.toLowerCase())) warnings.push(`stops.${i}: the riddle gives the answer away`)
      if (s.verification.status === 'draft') warnings.push(`stops.${i} (${s.id}): not verified on site yet`)
    })
  }
  if (errors.length) {
    failed++
    console.log(`✗ ${name}`)
    errors.forEach((e) => console.log(`    error   ${e}`))
  } else console.log(`✓ ${name}`)
  const drafts = warnings.filter((w) => w.includes('not verified'))
  warnings.filter((w) => !w.includes('not verified')).forEach((w) => console.log(`    warning ${w}`))
  if (drafts.length) console.log(`    note    ${drafts.length} stop(s) not verified on site yet`)
}
process.exit(failed ? 1 : 0)
