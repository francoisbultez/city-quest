import type { Stop } from '../types'

/** What the Listen button reads: the lesson in reading order, skipping the quiz parts. */
export function lessonScript(stop: Stop): string[] {
  const l = stop.lesson
  return [
    `${l.title}. ${l.subtitle}.`,
    ...l.story.map((p) => `${p.lead} ${p.text}`),
    `${l.context.title}. ${l.context.text}`,
    'Look closer.',
    ...l.lookCloser.map((x) => `${x.title} ${x.text}`),
    `Think about it. ${l.think}`,
  ]
}
