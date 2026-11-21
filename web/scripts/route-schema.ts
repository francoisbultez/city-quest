// Writes routes/route.schema.json from the route format, for editor autocomplete and validation.
import { writeFileSync } from 'node:fs'
import { z } from 'zod'
import { ComingSoonSchema, RouteSchema } from '../src/engine/schema'

const schema = z.toJSONSchema(RouteSchema, { io: 'input', unrepresentable: 'any' })
const out = { ...schema, title: 'City Quest route', description: 'One treasure-hunt route. See docs/creating-a-route.md.' }
writeFileSync(new URL('../routes/route.schema.json', import.meta.url), JSON.stringify(out, null, 2) + '\n')
const soon = { ...z.toJSONSchema(ComingSoonSchema, { io: 'input' }), title: 'City Quest: cities coming soon' }
writeFileSync(new URL('../routes/coming-soon.schema.json', import.meta.url), JSON.stringify(soon, null, 2) + '\n')
console.log('Wrote routes/route.schema.json and routes/coming-soon.schema.json')
