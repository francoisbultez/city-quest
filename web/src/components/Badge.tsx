/** Route badge: Spanish flag roundel. Solo badges are round, team badges are rounded squares. */
export function Badge({
  size = 200,
  mode = 'solo',
  line,
  city = 'MADRID',
  locked = false,
}: {
  size?: number
  mode?: 'solo' | 'team'
  line: string
  city?: string
  locked?: boolean
}) {
  const clipId = `badge-clip-${mode}-${size}`
  return (
    <svg
      className={locked ? 'badge locked' : 'badge'}
      role="img"
      aria-label={`${mode === 'team' ? 'Team' : 'Solo'} badge: ${city}, ${line}${locked ? ', not earned yet' : ''}`}
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
        <rect width="200" height="200" fill="#AA151B" />
        <rect y="52" width="200" height="96" fill="#F1BF00" />
      </g>
      <text x="100" y="106" textAnchor="middle" fill="#AA151B" fontSize="34" fontWeight="800" letterSpacing="0.5">
        {city}
      </text>
      <text x="100" y="128" textAnchor="middle" fill="#7a1015" fontSize="11" fontWeight="700" letterSpacing="2.4">
        {line}
      </text>
      <rect x="68" y="160" width="64" height="22" rx="11" fill="#ffffff" />
      <text x="100" y="175" textAnchor="middle" fill="#AA151B" fontSize="11" fontWeight="800" letterSpacing="1.6">
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
