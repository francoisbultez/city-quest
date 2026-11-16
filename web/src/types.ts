export type Question =
  | { kind: 'choice'; prompt: string; options: string[]; answer: string }
  | { kind: 'text'; prompt: string; answers: string[] }

/** One stop in a hunt. Hunts are graphs of these nodes so routes can adapt. */
export interface ClueNode {
  id: string
  title: string
  place: { name: string; lat: number; lng: number; radiusM: number }
  /** Time spent at the stop, excluding walking. */
  minutes: number
  /** 1 = core to the story (never dropped), 3 = optional detour. */
  priority: 1 | 2 | 3
  stepFree: boolean
  /** Story beat shown when the player is sent to this stop. */
  lead: string
  question: Question
  hint: string
  /** Revealed once solved. */
  reveal: string
  verification: { status: 'draft' | 'verified'; date?: string }
}

export interface Hunt {
  id: string
  city: string
  title: string
  tagline: string
  intro: string
  outro: string
  nodes: ClueNode[]
}

export type Pace = 'relaxed' | 'normal' | 'brisk'

export interface Settings {
  budgetMin: number
  pace: Pace
  stepFreeOnly: boolean
}
