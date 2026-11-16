import type { ClueNode } from '../types'

/** Minimal drawing of the route, projected from the real stop coordinates. */
export function RouteSketch({ nodes }: { nodes: ClueNode[] }) {
  const W = 320
  const H = 180
  const PAD = 22
  const lat0 = nodes.reduce((s, n) => s + n.place.lat, 0) / nodes.length
  const kx = Math.cos((lat0 * Math.PI) / 180)
  const xs = nodes.map((n) => n.place.lng * kx)
  const ys = nodes.map((n) => -n.place.lat)
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const scale = Math.min((W - PAD * 2) / (maxX - minX || 1), (H - PAD * 2) / (maxY - minY || 1))
  const ox = (W - (maxX - minX) * scale) / 2
  const oy = (H - (maxY - minY) * scale) / 2
  const pts = nodes.map((_, i) => [ox + (xs[i] - minX) * scale, oy + (ys[i] - minY) * scale] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const last = pts.length - 1

  return (
    <svg className="sketch" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Route from ${nodes[0].place.name} to ${nodes[last].place.name}`}>
      <path d={d} className="sketch-line" pathLength={1} />
      {pts.map(([x, y], i) => (
        <circle key={nodes[i].id} cx={x} cy={y} r={i === 0 || i === last ? 6 : 3.5} className={i === 0 ? 'sk-start' : i === last ? 'sk-end' : 'sk-dot'} style={{ animationDelay: `${0.15 + i * 0.09}s` }} />
      ))}
      <text x={pts[0][0]} y={pts[0][1] + 20} className="sk-label" textAnchor="middle">Start</text>
      <text x={pts[last][0]} y={pts[last][1] - 13} className="sk-label" textAnchor="middle">Finish</text>
    </svg>
  )
}
