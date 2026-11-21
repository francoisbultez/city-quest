import { starsFor } from '../game'
import type { Trip } from '../trips'
import type { Route } from '../../types'
import { sortedPlayers } from './logic'
import type { TeamGame } from './types'

/** The trip as the team saw it, for the souvenir. */
export function teamTrip(route: Route, game: TeamGame, points: number): Trip {
  const date = new Date(game.finishedAt ?? game.startedAt ?? game.createdAt).toISOString()
  return {
    id: `${route.id}-${date}`,
    routeId: route.id,
    date,
    mode: 'team',
    names: sortedPlayers(game).map(([, p]) => p.name),
    points,
    stars: starsFor(points, route.stops.length),
    ms: game.startedAt && game.finishedAt ? game.finishedAt - game.startedAt : undefined,
  }
}

