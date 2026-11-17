/** Shared state of one Together game, stored at games/{code}. Same shape in every sync provider. */
export interface TeamPlayer {
  name: string
  color: string
  joinedAt: number
  /** Last heartbeat; players silent for PRESENCE_MS are treated as away. */
  seenAt: number
  pos?: { lat: number; lng: number; acc: number; at: number }
}

export interface TeamStopResult {
  points: number
  perfect: boolean
}

export interface TeamGame {
  code: string
  routeId: string
  hostId: string
  createdAt: number
  status: 'lobby' | 'playing'
  players: Record<string, TeamPlayer>
  screen: 'walk' | 'quiz' | 'lesson' | 'end'
  index: number
  wrongs: number
  hinted: boolean
  /** Wrong options already agreed on at this stop, keyed "o{index}" (Firebase turns numeric keys into arrays). */
  tried?: Record<string, true>
  /** Current votes at this stop: player id → option index. */
  votes?: Record<string, number>
  results?: Record<string, TeamStopResult>
  /** Players who tapped "Next" on the lesson; the team moves on when everyone is ready. */
  ready?: Record<string, true>
  /** Quick-check option picked per stop id. */
  checks?: Record<string, string>
  /** "Look closer" items ticked, keyed "stopId:index". */
  spotted?: Record<string, true>
  /** For the end-of-route awards. */
  stats?: Record<string, { firstVoter?: string; arrivedBy?: string; firstPicks?: Record<string, number> }>
  startedAt?: number
  finishedAt?: number
}

/**
 * Flat multi-path update relative to the game root, Firebase-style:
 * keys are slash paths ("votes/abc"), null deletes.
 */
export type Patch = Record<string, unknown>

export interface Room {
  code: string
  me: string
  subscribe(cb: (game: TeamGame | null) => void): () => void
  update(patch: Patch): Promise<void>
  /** Clock shared by all phones (server time where available). */
  now(): number
  /** Writes the whole game (create). */
  create(game: TeamGame): Promise<void>
  close(): void
}
