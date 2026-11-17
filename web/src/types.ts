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
  /** Shown after a correct answer. */
  fact: string
  verification: { status: 'draft' | 'verified'; date?: string }
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
