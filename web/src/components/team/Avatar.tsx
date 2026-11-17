export function Avatar({ name, color, size = 32, ring = false }: { name: string; color: string; size?: number; ring?: boolean }) {
  return (
    <span className={ring ? 'avatar ring' : 'avatar'} style={{ background: color, width: size, height: size, fontSize: size * 0.44 }} title={name} aria-hidden="true">
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}
