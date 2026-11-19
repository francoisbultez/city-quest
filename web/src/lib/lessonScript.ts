import type { Stop } from '../types'

/** What the Listen button reads: the lesson in reading order, skipping the quiz parts. */
export function lessonScript(stop: Stop): string[] {
  const l = stop.lesson
  const lookCloser = l.lookCloser ?? []
  return [
    l.subtitle ? `${l.title}. ${l.subtitle}.` : `${l.title}.`,
    ...(l.story ?? []).map((p) => `${p.lead} ${p.text}`),
    ...(l.context ? [`${l.context.title}. ${l.context.text}`] : []),
    ...(lookCloser.length ? ['Look closer.', ...lookCloser.map((x) => `${x.title} ${x.text}`)] : []),
    ...(l.think ? [`Think about it. ${l.think}`] : []),
  ]
}
