import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { AttributionControl, Circle, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { Position } from '../lib/useGeolocation'
import type { Stop } from '../types'

const ACCENT = '#ff4a2b'
const TRAIL = '#8e8e96'

// CARTO basemap: clean, low-detail style that keeps the pins readable.
// Free tier is for low-volume use; move to a paid or self-hosted style before launch.
const TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

function FollowTarget({ target }: { target: Stop }) {
  const map = useMap()
  useEffect(() => {
    // Keep the target above the bottom card.
    const size = map.getSize()
    const zoom = Math.max(map.getZoom(), 16)
    const point = map.project([target.place.lat, target.place.lng], zoom).add([0, size.y * 0.2])
    map.flyTo(map.unproject(point, zoom), zoom, { duration: 0.8 })
  }, [map, target])
  return null
}

const doneIcon = L.divIcon({ className: '', html: '<div class="pin-done">✓</div>', iconSize: [22, 22], iconAnchor: [11, 11] })
const meIcon = L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })

export function RouteMap({ stops, current, pos }: { stops: Stop[]; current: number; pos: Position | null }) {
  const target = stops[current]
  const currentIcon = useMemo(
    () => L.divIcon({ className: '', html: `<div class="pin">${current + 1}</div>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
    [current],
  )

  return (
    <MapContainer className="map" center={[target.place.lat, target.place.lng]} zoom={16} zoomControl={false} attributionControl={false}>
      <AttributionControl position="topright" prefix={false} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={TILES}
        subdomains="abcd"
        maxZoom={20}
      />
      <Polyline
        positions={stops.slice(0, current + 1).map((s): [number, number] => [s.place.lat, s.place.lng])}
        pathOptions={{ color: TRAIL, weight: 3, opacity: 0.7, dashArray: '0.1 8', lineCap: 'round' }}
      />
      <Circle
        center={[target.place.lat, target.place.lng]}
        radius={Math.max(target.place.radiusM, 60)}
        pathOptions={{ color: ACCENT, fillColor: ACCENT, fillOpacity: 0.1, weight: 1.5, dashArray: '6 7' }}
      />
      {stops.slice(0, current).map((s) => (
        <Marker key={s.id} position={[s.place.lat, s.place.lng]} icon={doneIcon} title={s.place.name} />
      ))}
      <Marker position={[target.place.lat, target.place.lng]} icon={currentIcon} title={`Stop ${current + 1}`} />
      {pos && (
        <>
          <Circle center={[pos.lat, pos.lng]} radius={pos.accuracy} pathOptions={{ color: '#1a73ff', weight: 0, fillOpacity: 0.1 }} />
          <Marker position={[pos.lat, pos.lng]} icon={meIcon} interactive={false} />
        </>
      )}
      <FollowTarget target={target} />
    </MapContainer>
  )
}
