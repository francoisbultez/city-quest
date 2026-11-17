/**
 * Read text aloud with the phone's built-in voice (Web Speech API).
 * Free, works offline on most phones, and needs no server.
 */

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const base = lang.split('-')[0]
  return (
    voices.find((v) => v.lang === lang && v.localService) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(base) && v.localService) ??
    voices.find((v) => v.lang.startsWith(base))
  )
}

/** Long utterances get cut off on some browsers, so speak sentence by sentence. */
export function toChunks(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Speaks the parts in order. Returns a stop function.
 * `onEnd` fires once when everything has been read or reading stopped.
 */
export function speak(parts: string[], { lang = 'en-GB', rate = 1, onEnd }: { lang?: string; rate?: number; onEnd?: () => void } = {}): () => void {
  if (!speechSupported()) {
    onEnd?.()
    return () => {}
  }
  const synth = window.speechSynthesis
  synth.cancel()
  const chunks = parts.flatMap(toChunks)
  const voice = pickVoice(lang)
  let stopped = false
  let i = 0
  const finish = () => {
    if (stopped) return
    stopped = true
    onEnd?.()
  }
  const next = () => {
    if (stopped) return
    if (i >= chunks.length) return finish()
    const u = new SpeechSynthesisUtterance(chunks[i++])
    u.lang = voice?.lang ?? lang
    if (voice) u.voice = voice
    u.rate = rate
    u.onend = next
    u.onerror = finish
    synth.speak(u)
  }
  next()
  return () => {
    if (stopped) return
    stopped = true
    synth.cancel()
    onEnd?.()
  }
}
