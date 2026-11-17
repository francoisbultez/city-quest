import { describe, expect, it } from 'vitest'
import { solRoute } from '../../content/madrid-sol'
import { CHECK_BONUS } from '../game'
import { advancePatch, allReady, awardsFor, leaderId, leadingOption, listNames, makeCode, normalizeCode, presentIds, PRESENCE_MS, resolveAgreement, teamNote, teamPoints, voteState } from './logic'
import { applyPatch } from './patch'
import type { TeamGame } from './types'

const stops = solRoute.stops
const T = 1_000_000
const game = (over: Partial<TeamGame> = {}): TeamGame => ({
  code: 'SOL7',
  routeId: 'madrid-sol',
  hostId: 'a',
  createdAt: T,
  status: 'playing',
  players: {
    a: { name: 'Ana', color: '#f00', joinedAt: T, seenAt: T },
    t: { name: 'Tom', color: '#00f', joinedAt: T + 1, seenAt: T },
    l: { name: 'Lucía', color: '#0f0', joinedAt: T + 2, seenAt: T },
  },
  screen: 'quiz',
  index: 0,
  wrongs: 0,
  hinted: false,
  ...over,
})
const right = stops[0].options.indexOf(stops[0].answer)
const wrong = (right + 1) % 4

describe('applyPatch', () => {
  it('sets nested paths, deletes with null and drops empty objects', () => {
    const g = applyPatch(game(), { 'votes/a': 1, 'votes/t': 2, wrongs: 1 })
    expect(g.votes).toEqual({ a: 1, t: 2 })
    const h = applyPatch(g, { 'votes/a': null, 'votes/t': null })
    expect(h.votes).toBeUndefined()
    expect(h.wrongs).toBe(1)
  })
  it('does not change the original', () => {
    const g = game()
    applyPatch(g, { 'players/a/name': 'Bea' })
    expect(g.players.a.name).toBe('Ana')
  })
})

describe('codes', () => {
  it('makes 4-character codes without look-alike characters', () => {
    for (let i = 0; i < 50; i++) expect(makeCode()).toMatch(/^[A-HJ-NP-Z2-9]{4}$/)
  })
  it('normalizes typed codes', () => expect(normalizeCode(' so-l7x ')).toBe('SOL7'))
})

describe('presence and leader', () => {
  it('ignores players not heard from recently, but never yourself', () => {
    const g = game({ players: { ...game().players, l: { ...game().players.l, seenAt: T - PRESENCE_MS - 1 } } })
    expect(presentIds(g, T)).toEqual(['a', 't'])
    expect(presentIds(g, T, 'l')).toEqual(['a', 't', 'l'])
  })
  it('the host leads while present, then the earliest joiner', () => {
    expect(leaderId(game(), T)).toBe('a')
    const away = game({ players: { ...game().players, a: { ...game().players.a, seenAt: 0 } } })
    expect(leaderId(away, T)).toBe('t')
  })
})

describe('voting', () => {
  const all = ['a', 't', 'l']
  it('waits until everyone has voted', () => {
    expect(voteState(game({ votes: { a: 1, t: 1 } }), all)).toEqual({ kind: 'waiting', agreed: 2, total: 3 })
  })
  it('is split when votes differ', () => {
    expect(voteState(game({ votes: { a: 1, t: 1, l: 2 } }), all)).toEqual({ kind: 'split', agreed: 2, total: 3 })
  })
  it('agrees when everyone picks the same option', () => {
    expect(voteState(game({ votes: { a: 2, t: 2, l: 2 } }), all)).toEqual({ kind: 'agreed', option: 2 })
  })
  it('finds the leading option, or none on a tie', () => {
    expect(leadingOption(game({ votes: { a: 1, t: 1, l: 2 } }), all)).toEqual({ option: 1, voters: ['a', 't'] })
    expect(leadingOption(game({ votes: { a: 1, t: 2 } }), all)).toBeNull()
  })
  it('a right answer scores and opens the lesson', () => {
    const g = applyPatch(game({ wrongs: 1, votes: { a: right } }), resolveAgreement(game({ wrongs: 1 }), stops[0], right))
    expect(g.screen).toBe('lesson')
    expect(g.results?.[stops[0].id]).toEqual({ points: 80, perfect: false })
    expect(g.votes).toBeUndefined()
  })
  it('a wrong answer costs points and crosses the option out', () => {
    const g = applyPatch(game({ votes: { a: wrong } }), resolveAgreement(game(), stops[0], wrong))
    expect(g.wrongs).toBe(1)
    expect(g.tried).toEqual({ [`o${wrong}`]: true })
    expect(g.screen).toBe('quiz')
  })
})

describe('moving on', () => {
  it('needs everyone present to be ready', () => {
    expect(allReady(game({ ready: { a: true, t: true } }), ['a', 't', 'l'])).toBe(false)
    expect(allReady(game({ ready: { a: true, t: true } }), ['a', 't'])).toBe(true)
  })
  it('resets the stop state for the next riddle', () => {
    const g = applyPatch(game({ screen: 'lesson', wrongs: 2, hinted: true, tried: { o1: true }, ready: { a: true } }), advancePatch(game({ screen: 'lesson' }), 8, T))
    expect(g).toMatchObject({ screen: 'walk', index: 1, wrongs: 0, hinted: false })
    expect(g.tried).toBeUndefined()
    expect(g.ready).toBeUndefined()
  })
  it('ends after the last stop', () => {
    expect(advancePatch(game({ index: 7 }), 8, T)).toMatchObject({ screen: 'end', finishedAt: T })
  })
})

describe('score and awards', () => {
  it('adds stop points and quick-check bonuses', () => {
    const g = game({ results: { km0: { points: 100, perfect: true }, bear: { points: 60, perfect: false } }, checks: { km0: stops[0].lesson.check.answer, bear: 'nope' } })
    expect(teamPoints(g, stops, CHECK_BONUS)).toBe(170)
  })
  it('gives each player one award', () => {
    const g = game({
      stats: {
        km0: { firstVoter: 'a', arrivedBy: 'l', firstPicks: { a: wrong, t: right, l: right } },
        bear: { firstVoter: 'a', arrivedBy: 'l', firstPicks: { t: stops[1].options.indexOf(stops[1].answer) } },
      },
    })
    const aw = awardsFor(g, stops)
    expect(aw.t.title).toBe('Sharp eyes')
    expect(aw.a.title).toBe('Quick draw')
    expect(aw.l.title).toBe('Trailblazer')
  })
  it('falls back to Team player', () => {
    expect(awardsFor(game(), stops).a.title).toBe('Team player')
  })
})

describe('words', () => {
  it('lists names naturally', () => {
    expect(listNames(['Ana'])).toBe('Ana')
    expect(listNames(['Ana', 'Tom', 'Lucía'])).toBe('Ana, Tom and Lucía')
  })
  it('says who is ahead', () => {
    expect(teamNote(170, [{ name: 'Lucía', dist: 130 }])).toBe('Team together · Lucía is 40 m ahead')
    expect(teamNote(100, [{ name: 'Tom', dist: 140 }])).toBe('Team together · you’re in front')
    expect(teamNote(100, [{ name: 'Tom', dist: null }])).toBeNull()
  })
})
