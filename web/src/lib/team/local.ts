import { applyPatch } from './patch'
import type { Patch, Room, TeamGame } from './types'

const key = (code: string) => `cq.room.${code}`

/**
 * Stand-in for the live service: the game lives in localStorage and changes are
 * broadcast to other tabs. Lets two tabs on one computer play together (dev and tests).
 */
export class LocalRoom implements Room {
  private channel: BroadcastChannel | null
  private listeners = new Set<(g: TeamGame | null) => void>()

  code: string
  me: string

  constructor(code: string, me: string) {
    this.code = code
    this.me = me
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(key(code)) : null
    if (this.channel) this.channel.onmessage = () => this.emit()
    window.addEventListener('storage', this.onStorage)
  }

  private onStorage = (e: StorageEvent) => {
    if (e.key === key(this.code)) this.emit()
  }

  private read(): TeamGame | null {
    try {
      const raw = localStorage.getItem(key(this.code))
      return raw ? (JSON.parse(raw) as TeamGame) : null
    } catch {
      return null
    }
  }

  private write(g: TeamGame) {
    localStorage.setItem(key(this.code), JSON.stringify(g))
    this.channel?.postMessage('changed')
    // Let the caller finish before listeners run, like a network round-trip.
    queueMicrotask(() => this.emit())
  }

  private emit() {
    const g = this.read()
    for (const l of this.listeners) l(g)
  }

  now() {
    return Date.now()
  }

  subscribe(cb: (g: TeamGame | null) => void) {
    this.listeners.add(cb)
    cb(this.read())
    return () => {
      this.listeners.delete(cb)
    }
  }

  async create(game: TeamGame) {
    this.write(game)
  }

  async update(patch: Patch) {
    const g = this.read()
    if (!g) return
    this.write(applyPatch(g, patch))
  }

  close() {
    this.listeners.clear()
    this.channel?.close()
    window.removeEventListener('storage', this.onStorage)
  }
}
