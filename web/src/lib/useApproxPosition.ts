import { useCallback, useEffect, useState } from 'react'

type Pos = { lat: number; lng: number }

/**
 * Where the phone is, roughly, for "near you".
 * Never asks on its own: it only reads the position if location is already
 * allowed, or after the player taps a button that calls `request()`.
 */
export function useApproxPosition() {
  const [pos, setPos] = useState<Pos | null>(null)
  const [state, setState] = useState<'idle' | 'asking' | 'denied' | 'unavailable'>(() => ('geolocation' in navigator ? 'idle' : 'unavailable'))

  const read = useCallback(() => {
    if (!('geolocation' in navigator)) return setState('unavailable')
    setState('asking')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude })
        setState('idle')
      },
      (e) => setState(e.code === e.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, maximumAge: 10 * 60_000, timeout: 15_000 },
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    navigator.permissions
      ?.query({ name: 'geolocation' as PermissionName })
      .then((p) => {
        if (!cancelled && p.state === 'granted') read()
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [read])

  return { pos, state, request: read }
}
