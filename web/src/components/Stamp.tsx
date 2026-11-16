import { stopColor } from '../lib/fun'
import type { ClueNode } from '../types'

/** Passport-style stamp for a solved stop. */
export function Stamp({ node, index, perfect, size = 96, tilt = true }: { node: ClueNode; index: number; perfect?: boolean; size?: number; tilt?: boolean }) {
  const c = stopColor(index)
  const id = `arc-${node.id}-${size}`
  const name = node.place.name.split(',')[0].toUpperCase()
  const rotate = tilt ? ((index * 37) % 24) - 12 : 0
  return (
    <svg className="stamp" width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rotate}deg)` }} role="img" aria-label={`Stamp: ${node.place.name}`}>
      <defs>
        <path id={id} d="M 50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill={c.bg} />
      <circle cx="50" cy="50" r="43" fill="none" stroke={c.ink} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={c.ink} strokeWidth="1.5" opacity="0.9" />
      <text fill={c.ink} fontSize="8.5" fontWeight="700" letterSpacing="1.2" fontFamily="var(--display)">
        <textPath href={`#${id}`} startOffset="0">{name.length > 26 ? name.slice(0, 25) + '…' : name} · MADRID ·</textPath>
      </text>
      <text x="50" y="58" textAnchor="middle" fill={c.ink} fontSize="26" fontWeight="800" fontFamily="var(--display)">{index + 1}</text>
      {perfect && (
        <g transform="translate(76 18)">
          <circle r="11" fill="var(--surface)" stroke={c.bg} strokeWidth="2" />
          <text y="4.5" textAnchor="middle" fontSize="13" fill={c.bg}>★</text>
        </g>
      )}
    </svg>
  )
}
