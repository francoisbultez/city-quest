import { describe, expect, it } from 'vitest'
import { solRoute } from '../content/madrid-sol'
import { lessonScript } from './lessonScript'
import { toChunks } from './speech'

describe('toChunks', () => {
  it('splits text into sentences', () => {
    expect(toChunks('First one. Second one!  Third?')).toEqual(['First one.', 'Second one!', 'Third?'])
  })
})

describe('lessonScript', () => {
  it('reads the story, context, look closer and question, but not the quiz answer options', () => {
    const stop = solRoute.stops[2]
    const text = lessonScript(stop).join(' ')
    expect(text).toContain(stop.lesson.title)
    for (const p of stop.lesson.story) expect(text).toContain(p.text)
    expect(text).toContain(stop.lesson.context.text)
    expect(text).toContain(stop.lesson.think)
    expect(text).not.toContain(stop.lesson.check.question)
  })
})
