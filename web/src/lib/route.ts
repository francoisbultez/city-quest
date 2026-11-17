import type { Stop } from '../types'

/** Most GPS error we forgive when checking someone is at a stop. */
export const MAX_GPS_SLACK_M = 50

/** Streets are never a straight line. */
const DETOUR = 1.3

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Walking distance of a route in km, street detour included. */
export function routeKm(stops: Stop[]): number {
  let m = 0
  for (let i = 1; i < stops.length; i++) m += distanceM(stops[i - 1].place, stops[i].place)
  return (m * DETOUR) / 1000
}

/** Whether a GPS position counts as being at the stop. */
export function isAtStop(pos: { lat: number; lng: number; accuracy: number }, stop: Stop): boolean {
  return distanceM(pos, stop.place) <= stop.place.radiusM + Math.min(pos.accuracy, MAX_GPS_SLACK_M)
}

export type Heat = 'cold' | 'cool' | 'warm' | 'hot'

/** Warm/cold label for the walking card. */
export function heatFor(distance: number): Heat {
  if (distance <= 80) return 'hot'
  if (distance <= 200) return 'warm'
  if (distance <= 450) return 'cool'
  return 'cold'
}
