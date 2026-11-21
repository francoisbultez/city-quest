import { load, save } from '../storage'
import { firebaseConfig } from './config'
import { LocalRoom } from './local'
import type { Room } from './types'

export interface Me {
  id: string
  name: string
}

const ME_KEY = 'cq.me'
const TEAM_KEY = 'cq.team'

export const liveSync = () => firebaseConfig !== null

export const loadName = () => load<Me | null>(ME_KEY, null)?.name ?? ''

/**
 * Player id for the local stand-in: one per browser tab, so two tabs are two players.
 * (Firebase uses its own user id.)
 */
function localId(name: string): Me {
  let id: string | null = null
  try {
    id = sessionStorage.getItem('cq.tabId')
    if (!id) sessionStorage.setItem('cq.tabId', (id = crypto.randomUUID().slice(0, 8)))
  } catch {
    id ??= crypto.randomUUID().slice(0, 8)
  }
  const me = { id, name }
  save(ME_KEY, me)
  return me
}

/** Opens a room for this phone, signing in to the live service when configured. */
export async function openRoom(code: string, name: string): Promise<Room> {
  if (firebaseConfig) {
    const fb = await import('./firebase')
    const id = await fb.connect(firebaseConfig)
    save(ME_KEY, { id, name })
    return new fb.FirebaseRoom(code, id)
  }
  return new LocalRoom(code, localId(name).id)
}

export async function roomExists(code: string): Promise<boolean> {
  if (firebaseConfig) {
    const fb = await import('./firebase')
    await fb.connect(firebaseConfig)
    return fb.gameExists(code)
  }
  return load(`cq.room.${code}`, null) !== null
}

/** The team this phone is in, so a reload goes straight back. */
export const loadTeam = () => load<{ code: string } | null>(TEAM_KEY, null)
export const saveTeam = (t: { code: string } | null) => save(TEAM_KEY, t)

/** Saves the name teammates see (also used to greet you on the home screen). */
export function saveName(name: string) {
  const me = load<Me | null>(ME_KEY, null)
  save(ME_KEY, { id: me?.id ?? '', name: name.trim().slice(0, 16) })
}
