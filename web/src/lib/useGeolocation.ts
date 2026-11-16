import { useEffect, useState } from 'react'

export interface Position {
  lat: number
  lng: number
  accuracy: number
}

export function useGeolocation(): { pos: Position | null; error: string | null } {
  const [pos, setPos] = useState<Position | null>(null)
  const supported = 'geolocation' in navigator
  const [error, setError] = useState<string | null>(supported ? null : 'Location is not available on this device.')

  useEffect(() => {
    if (!supported) return
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setError(null)
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy })
      },
      (e) => setError(e.code === e.PERMISSION_DENIED ? 'Location permission denied.' : 'Looking for GPS…'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [supported])

  return { pos, error }
}
