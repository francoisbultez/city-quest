import { coverOf } from '../../engine/registry'
import type { Route } from '../../types'

/** A route's photo, or its badge colours when it has none. Decorative: the text next to it names the route. */
export function Cover({ route, className = '' }: { route: Route; className?: string }) {
  const img = coverOf(route)
  const [a, b] = route.theme?.colors ?? ['#ff4a2b', '#ffb199']
  return (
    <span className={`cover ${className}`} style={img ? undefined : { background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden="true">
      {img && <img src={img.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: img.position ?? '50% 50%' }} />}
    </span>
  )
}
