import type { Route } from '../types'
import { solRoute } from './madrid-sol'
import { useraRoute } from './madrid-usera'

export const routes: Route[] = [solRoute, useraRoute]

export const routeById = (id: string | undefined): Route => routes.find((r) => r.id === id) ?? routes[0]
