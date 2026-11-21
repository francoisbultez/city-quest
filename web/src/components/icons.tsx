/** Small stroke icons used across the browse screens. Decorative: always aria-hidden. */
const base = { 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' } as const

export const IconPin = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)
export const IconWalk = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16" /></svg>
)
export const IconClock = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const IconFlag = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>
)
export const IconChevron = ({ size = 16, dir = 'right' }: { size?: number; dir?: 'right' | 'down' | 'left' }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.5}>
    <path d={dir === 'down' ? 'M6 9l6 6 6-6' : dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 6l6 6-6 6'} />
  </svg>
)
export const IconClose = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.6}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const IconSearch = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
)
export const IconLink = ({ size = 20 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
)
export const IconLocate = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>
)
export const IconMedal = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="15" r="5" /><path d="M8.5 11 6 3h4l2 5 2-5h4l-2.5 8" /></svg>
)
export const IconUsers = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c1-3.5 3.5-5.5 6-5.5s5 2 6 5.5" /><circle cx="17.5" cy="9" r="2.8" /><path d="M16 14.6c2.4.2 4.3 2 5 5.4" /></svg>
)
export const IconExternal = ({ size = 14 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
)
export const Stars = ({ n }: { n: number }) => (
  <span className="mini-stars" aria-label={`${n} of 3 stars`}>
    {[1, 2, 3].map((i) => (
      <svg key={i} aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" className={i <= n ? 'on' : ''}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" /></svg>
    ))}
  </span>
)
export const IconEye = ({ size = 22 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="3" /><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /></svg>
)
export const IconCompass = ({ size = 24 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>
)
export const IconUser = ({ size = 24 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="8" r="4" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></svg>
)
export const IconPhotos = ({ size = 24 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 15l5-4 4 3 3-2 6 4" /></svg>
)
export const IconGear = ({ size = 20 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={2}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
)
