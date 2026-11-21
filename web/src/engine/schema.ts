import { z } from 'zod'

/**
 * The City Quest route format.
 *
 * A route is plain data: one `route.json` plus an optional `images/` folder.
 * The app knows nothing about any particular city; everything it shows comes
 * from here. This schema is the single source of truth: the app validates
 * every route with it, the tests run it over built-in routes, and
 * `npm run route:schema` exports it as JSON Schema for route authors.
 *
 * Only what a game strictly needs is required. Lessons can be as short as a
 * title and grow into the full 2-minute read.
 */

export const FORMAT_VERSION = 1

const text = (min = 1, max = 2000) => z.string().trim().min(min).max(max)
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lower-case letters, numbers and dashes, e.g. "old-town"')
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'a hex colour like "#aa151b"')
const url = z.url({ protocol: /^https$/, error: 'an https:// link' })

export const PlaceSchema = z.object({
  name: text(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  /** How close (metres) a player must be to count as arrived. */
  radiusM: z.number().int().min(20).max(200),
})

export const ImageSchema = z.object({
  /** Path inside the route folder (e.g. "images/bridge.jpg") or an https:// link. */
  src: text(1, 500),
  alt: text(10, 300),
  /** CSS object-position for the 4:3 crop, e.g. "50% 55%". */
  position: z.string().optional(),
  credit: z.object({
    artist: text(),
    license: text(),
    licenseUrl: url.nullable().optional(),
    /** Where the photo comes from. */
    page: url,
    /** Short name of the source shown in the credit line, e.g. "Wikimedia Commons". */
    site: text(1, 60).optional(),
  }),
})

export const LessonSchema = z.object({
  title: text(1, 120),
  image: ImageSchema.optional(),
  subtitle: text(1, 300).optional(),
  /** One line for the end-of-route recap. */
  recap: text(1, 200).optional(),
  numbers: z.array(z.object({ value: text(1, 30), label: text(1, 80) })).max(3).optional(),
  story: z.array(z.object({ lead: text(1, 120), text: text() })).optional(),
  timeline: z.array(z.object({ year: text(1, 30), text: text(1, 300) })).optional(),
  context: z.object({ title: text(1, 120), text: text() }).optional(),
  lookCloser: z.array(z.object({ title: text(1, 120), text: text(1, 500) })).optional(),
  /** Words in the local language, shown with their meaning. */
  words: z.array(z.object({ word: text(1, 60), meaning: text(1, 120) })).optional(),
  think: text(1, 500).optional(),
  check: z
    .object({ question: text(1, 300), options: z.array(text(1, 120)).min(2).max(4), answer: text(1, 120) })
    .refine((c) => c.options.includes(c.answer), { message: 'answer must be one of the options', path: ['answer'] })
    .refine((c) => new Set(c.options).size === c.options.length, { message: 'options must be different', path: ['options'] })
    .optional(),
  sources: z.array(z.object({ name: text(1, 200), url })).optional(),
})

export const StopSchema = z
  .object({
    id: slug,
    place: PlaceSchema,
    /** Shown while walking: where to go next, as a riddle. */
    riddle: text(1, 300),
    /** Free, plain-words location hint while walking. */
    whereHint: text(1, 300).optional(),
    /** Small instruction above the question, e.g. "Read the plaque". */
    look: text(1, 120).optional(),
    /** Answered on the spot, by looking at something there. */
    question: text(1, 300),
    options: z.array(text(1, 120)).min(2).max(4),
    answer: text(1, 120),
    /** Costs points when used. */
    hint: text(1, 300).optional(),
    lesson: LessonSchema,
    verification: z.object({ status: z.enum(['draft', 'verified']), date: z.string().optional() }).default({ status: 'draft' }),
  })
  .refine((s) => s.options.includes(s.answer), { message: 'answer must be one of the options', path: ['answer'] })
  .refine((s) => new Set(s.options).size === s.options.length, { message: 'options must be different', path: ['options'] })

export const RouteSchema = z
  .object({
    $schema: z.string().optional(),
    formatVersion: z.literal(FORMAT_VERSION),
    id: slug,
    /** Language the route is written in (BCP 47, e.g. "en", "es"). Used for the read-aloud voice. */
    language: z.string().min(2).max(20).default('en'),
    city: text(1, 60),
    /** ISO 3166-1 alpha-2 country code, e.g. "ES". */
    country: z.string().length(2).optional(),
    /** Region shown in the city list, e.g. "Castilla-La Mancha". */
    region: text(1, 60).optional(),
    /** Short type label shown on the route card, e.g. "Classic" or "Neighbourhood". */
    kind: text(1, 24).optional(),
    name: text(1, 60),
    /** Printed on the badge, keep it short (e.g. "THE SOL ROUTE"). */
    badgeLine: text(1, 22),
    tagline: text(1, 160),
    /** For "Start at …", e.g. "the Puerta del Sol". */
    start: text(1, 80),
    /** Rough time to play, e.g. "~2 h". */
    duration: text(1, 20),
    /** Photo for route cards and the preview. Defaults to the first stop's photo. */
    cover: ImageSchema.optional(),
    /** Badge and celebration colours. */
    theme: z.object({ colors: z.tuple([color, color]), ink: color.optional() }).optional(),
    /** The local language, for the "words" section, e.g. { code: "es", name: "Spanish" }. */
    localLanguage: z.object({ code: z.string().min(2).max(20), name: text(1, 40) }).optional(),
    author: z.object({ name: text(1, 80), url: url.optional() }).optional(),
    stops: z.array(StopSchema).min(2).max(30),
  })
  .superRefine((r, ctx) => {
    const seen = new Set<string>()
    r.stops.forEach((s, i) => {
      if (seen.has(s.id)) ctx.addIssue({ code: 'custom', message: `stop id "${s.id}" is used twice`, path: ['stops', i, 'id'] })
      seen.add(s.id)
    })
  })

export type Route = z.infer<typeof RouteSchema>
export type Stop = z.infer<typeof StopSchema>
export type Place = z.infer<typeof PlaceSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type LessonImage = z.infer<typeof ImageSchema>

/** Cities that are on the way, listed in routes/coming-soon.json. */
export const ComingSoonSchema = z.object({
  $schema: z.string().optional(),
  cities: z.array(z.object({ city: text(1, 60), region: text(1, 60).optional() })),
})
export type ComingSoon = z.infer<typeof ComingSoonSchema>

export type RouteResult = { ok: true; route: Route } | { ok: false; errors: string[] }

/** Validates unknown data as a route. Errors are readable lines like "stops.2.answer: answer must be one of the options". */
export function parseRoute(data: unknown): RouteResult {
  const res = RouteSchema.safeParse(data)
  if (res.success) return { ok: true, route: res.data }
  return { ok: false, errors: res.error.issues.map((i) => `${i.path.join('.') || '(route)'}: ${i.message}`) }
}
