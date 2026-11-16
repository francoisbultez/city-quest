import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Position } from '../lib/useGeolocation'
import type { ClueNode } from '../types'

const ACCENT = '#c2410c'

function FollowTarget({ target }: { target: ClueNode }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([target.place.lat, target.place.lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
  }, [map, target])
  return null
}

export function RouteMap({ nodes, current, pos }: { nodes: ClueNode[]; current: number; pos: Position | null }) {
  const target = nodes[current]
  return (
    <MapContainer
      className="map"
      center={[target.place.lat, target.place.lng]}
      zoom={16}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={nodes.slice(0, current + 1).map((n): [number, number] => [n.place.lat, n.place.lng])}
        pathOptions={{ color: ACCENT, weight: 3, dashArray: '6 6' }}
      />
      {nodes.map((n, i) => {
        // Upcoming stops stay hidden: finding them is part of the game.
        if (i > current) return null
        const done = i < current
        return (
          <CircleMarker
            key={n.id}
            center={[n.place.lat, n.place.lng]}
            radius={done ? 6 : 10}
            pathOptions={{
              color: done ? '#6b7280' : ACCENT,
              fillColor: done ? '#9ca3af' : ACCENT,
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {i + 1}. {done ? n.place.name : 'Next clue'}
            </Tooltip>
          </CircleMarker>
        )
      })}
      <Circle
        center={[target.place.lat, target.place.lng]}
        radius={target.place.radiusM}
        pathOptions={{ color: ACCENT, fillOpacity: 0.08, weight: 1 }}
      />
      {pos && (
        <>
          <Circle center={[pos.lat, pos.lng]} radius={pos.accuracy} pathOptions={{ color: '#2563eb', weight: 0, fillOpacity: 0.12 }} />
          <CircleMarker center={[pos.lat, pos.lng]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }} />
        </>
      )}
      <FollowTarget target={target} />
    </MapContainer>
  )
}
