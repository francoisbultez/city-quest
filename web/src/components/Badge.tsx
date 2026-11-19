import type { Route } from '../types'

const DEFAULT_THEME = { colors: ['#ff4a2b', '#ffffff'] as const, ink: '#ff4a2b' }

/** A route's badge, in the route's colours. Solo badges are round, team badges are rounded squares. */
export function Badge({ size = 200, mode = 'solo', route, locked = false }: { size?: number; mode?: 'solo' | 'team'; route: Route; locked?: boolean }) {
  const [outer, band] = route.theme?.colors ?? DEFAULT_THEME.colors
  const ink = route.theme?.ink ?? (route.theme ? route.theme.colors[0] : DEFAULT_THEME.ink)
  const city = route.city.toUpperCase()
  // Long city names shrink to fit the band.
  const citySize = Math.min(34, Math.floor(300 / Math.max(city.length, 1)))
  const clipId = `badge-clip-${mode}-${size}-${route.id}`
  return (
    <svg
      className={locked ? 'badge locked' : 'badge'}
      role="img"
      aria-label={`${mode === 'team' ? 'Team' : 'Solo'} badge: ${city}, ${route.badgeLine}${locked ? ', not earned yet' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="4" y="4" width="192" height="192" rx={mode === 'team' ? 48 : 96} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="200" height="200" fill={outer} />
        <rect y="52" width="200" height="96" fill={band} />
      </g>
      <text x="100" y={96 + citySize / 3} textAnchor="middle" fill={ink} fontSize={citySize} fontWeight="800" letterSpacing="0.5">
        {city}
      </text>
      <text x="100" y="128" textAnchor="middle" fill={ink} fillOpacity="0.8" fontSize="11" fontWeight="700" letterSpacing="2.4">
        {route.badgeLine}
      </text>
      <rect x="68" y="160" width="64" height="22" rx="11" fill="#ffffff" />
      <text x="100" y="175" textAnchor="middle" fill={outer === '#ffffff' ? ink : outer} fontSize="11" fontWeight="800" letterSpacing="1.6">
        {mode === 'team' ? 'TEAM' : 'SOLO'}
      </text>
    </svg>
  )
}

export function Stars({ count, size = 30 }: { count: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <svg key={n} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" className={n <= count ? 'on' : 'off'}>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  )
}
