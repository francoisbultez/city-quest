export interface Place {
  name: string
  lat: number
  lng: number
  /** Check-in radius in metres. */
  radiusM: number
}

/** One stop on a route: a riddle to walk to, then a quiz on the spot. */
export interface Stop {
  id: string
  place: Place
  /** Short riddle shown while walking. */
  riddle: string
  /** Free location hint while walking (no points lost). */
  whereHint: string
  /** Small instruction above the quiz question. */
  look: string
  question: string
  options: [string, string, string, string]
  answer: string
  /** Quiz hint (costs points). */
  hint: string
  /** The 2-minute lesson shown after a correct answer. */
  lesson: Lesson
  verification: { status: 'draft' | 'verified'; date?: string }
}

export interface Lesson {
  /** Display name, e.g. "Plaza Mayor". */
  title: string
  subtitle: string
  /** One line for the route recap. */
  recap: string
  numbers: [Fact, Fact, Fact]
  /** Short paragraphs, each with a bold lead-in. */
  story: { lead: string; text: string }[]
  timeline: { year: string; text: string }[]
  context: { title: string; text: string }
  lookCloser: { title: string; text: string }[]
  words: { es: string; en: string }[]
  think: string
  check: { question: string; options: [string, string, string]; answer: string }
  sources: { name: string; url: string }[]
}

export interface Fact {
  value: string
  label: string
}

export interface Route {
  id: string
  city: string
  /** e.g. "The Sol Route" */
  name: string
  /** e.g. "SOL → DEBOD", printed on the badge */
  badgeLine: string
  tagline: string
  stops: Stop[]
}
