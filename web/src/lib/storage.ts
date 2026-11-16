export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode): play still works, just without resume */
  }
}

export interface ClueReport {
  huntId: string
  nodeId: string
  reason: string
  at: string
}

/** Stored locally until there is a backend to sync to. */
export function reportClue(r: ClueReport): void {
  save('cq.reports', [...load<ClueReport[]>('cq.reports', []), r])
}
