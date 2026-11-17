import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { get, getDatabase, onDisconnect, onValue, ref, serverTimestamp, set, update, type Database } from 'firebase/database'
import type { Patch, Room, TeamGame } from './types'

let db: Database | null = null
let uid: Promise<string> | null = null
let offset = 0

/** Signs in anonymously once per app load; the Firebase user id is the player id. */
export function connect(config: FirebaseOptions): Promise<string> {
  if (!uid) {
    const app = initializeApp(config)
    db = getDatabase(app)
    onValue(ref(db, '.info/serverTimeOffset'), (s) => {
      offset = (s.val() as number) ?? 0
    })
    uid = signInAnonymously(getAuth(app)).then((c) => c.user.uid)
  }
  return uid
}

export async function gameExists(code: string): Promise<boolean> {
  return (await get(ref(db!, `games/${code}/code`))).exists()
}

export class FirebaseRoom implements Room {
  private unsubs: (() => void)[] = []

  code: string
  me: string

  constructor(code: string, me: string) {
    this.code = code
    this.me = me
    // When this phone drops off, mark it as last seen now so teammates stop waiting for it.
    onDisconnect(ref(db!, `games/${code}/players/${me}/seenAt`)).set(serverTimestamp())
  }

  now() {
    return Date.now() + offset
  }

  subscribe(cb: (g: TeamGame | null) => void) {
    const off = onValue(ref(db!, `games/${this.code}`), (s) => cb(s.exists() ? (s.val() as TeamGame) : null))
    this.unsubs.push(off)
    return off
  }

  async create(game: TeamGame) {
    await set(ref(db!, `games/${this.code}`), game)
  }

  async update(patch: Patch) {
    await update(ref(db!, `games/${this.code}`), patch)
  }

  close() {
    this.unsubs.forEach((u) => u())
    this.unsubs = []
  }
}
