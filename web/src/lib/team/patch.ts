import type { Patch } from './types'

/** Applies a Firebase-style multi-path update to a plain object (returns a new object). */
export function applyPatch<T extends object>(base: T, patch: Patch): T {
  const out = structuredClone(base) as Record<string, unknown>
  for (const [path, value] of Object.entries(patch)) {
    const keys = path.split('/')
    let node = out
    for (const k of keys.slice(0, -1)) {
      if (typeof node[k] !== 'object' || node[k] === null) {
        if (value === null) { node = {}; break }
        node[k] = {}
      }
      node = node[k] as Record<string, unknown>
    }
    const last = keys[keys.length - 1]
    if (value === null || value === undefined) delete node[last]
    else node[last] = structuredClone(value)
  }
  return prune(out) as T
}

/** Drops empty objects, like Firebase does. */
function prune(o: Record<string, unknown>): Record<string, unknown> {
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      prune(v as Record<string, unknown>)
      if (Object.keys(v).length === 0) delete o[k]
    }
  }
  return o
}
