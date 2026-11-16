import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { AttributionControl, Circle, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { Position } from '../lib/useGeolocation'
import type { ClueNode } from '../types'

const ACCENT = '#2f4bff'

// CARTO basemaps: clean, low-detail styles that keep the pins readable.
// Free tier is for low-volume use; move to a paid/self-hosted style before launch.
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

function usePrefersDark() {
  const query = '(prefers-color-scheme: dark)'
  const [dark, setDark] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const on = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

function FollowTarget({ target }: { target: ClueNode }) {
  const map = useMap()
  useEffect(() => {
    // Keep the target above the bottom sheet.
    const size = map.getSize()
    const zoom = Math.max(map.getZoom(), 16)
    const point = map.project([target.place.lat, target.place.lng], zoom).add([0, size.y * 0.22])
    map.flyTo(map.unproject(point, zoom), zoom, { duration: 0.8 })
  }, [map, target])
  return null
}

const doneIcon = L.divIcon({ className: '', html: '<div class="pin-done">✓</div>', iconSize: [22, 22], iconAnchor: [11, 11] })
const meIcon = L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })

export function RouteMap({ nodes, current, pos }: { nodes: ClueNode[]; current: number; pos: Position | null }) {
  const target = nodes[current]
  const dark = usePrefersDark()
  const currentIcon = useMemo(
    () => L.divIcon({ className: '', html: `<div class="pin"><b>${current + 1}</b></div>`, iconSize: [40, 40], iconAnchor: [20, 46] }),
    [current],
  )

  return (
    <MapContainer className="map" center={[target.place.lat, target.place.lng]} zoom={16} zoomControl={false} attributionControl={false}>
      <AttributionControl position="topright" prefix={false} />
      <TileLayer
        key={dark ? 'dark' : 'light'}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={dark ? TILES.dark : TILES.light}
        subdomains="abcd"
        maxZoom={20}
      />
      <Polyline
        positions={nodes.slice(0, current + 1).map((n): [number, number] => [n.place.lat, n.place.lng])}
        pathOptions={{ color: ACCENT, weight: 4, opacity: 0.7, dashArray: '1 10', lineCap: 'round' }}
      />
      <Circle
        center={[target.place.lat, target.place.lng]}
        radius={target.place.radiusM}
        pathOptions={{ color: ACCENT, fillColor: ACCENT, fillOpacity: 0.1, weight: 1.5, dashArray: '4 6' }}
      />
      {/* Upcoming stops stay hidden: finding them is part of the game. */}
      {nodes.slice(0, current).map((n) => (
        <Marker key={n.id} position={[n.place.lat, n.place.lng]} icon={doneIcon} title={n.place.name} />
      ))}
      <Marker position={[target.place.lat, target.place.lng]} icon={currentIcon} title="Next clue" />
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
