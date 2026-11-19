// Writes routes/route.schema.json from the route format, for editor autocomplete and validation.
import { writeFileSync } from 'node:fs'
import { z } from 'zod'
import { RouteSchema } from '../src/engine/schema'

const schema = z.toJSONSchema(RouteSchema, { io: 'input', unrepresentable: 'any' })
const out = { ...schema, title: 'City Quest route', description: 'One treasure-hunt route. See docs/creating-a-route.md.' }
writeFileSync(new URL('../routes/route.schema.json', import.meta.url), JSON.stringify(out, null, 2) + '\n')
console.log('Wrote routes/route.schema.json')
