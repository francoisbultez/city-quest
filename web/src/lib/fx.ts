const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

/** Lightweight confetti burst on a full-screen canvas, in the route's badge colours. */
export function confetti(origin: { x: number; y: number } = { x: 0.5, y: 0.4 }, colors: readonly string[] = ['#ff4a2b', '#111113']) {
  const COLORS = [...colors, '#ff4a2b']
  if (reducedMotion()) return
  const canvas = document.createElement('canvas')
  canvas.className = 'confetti'
  canvas.setAttribute('aria-hidden', 'true')
  const dpr = window.devicePixelRatio || 1
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.remove()
  ctx.scale(dpr, dpr)
  const parts = Array.from({ length: 90 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9
    const speed = 7 + Math.random() * 9
    return {
      x: origin.x * innerWidth,
      y: origin.y * innerHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }
  })
  const start = performance.now()
  const frame = (t: number) => {
    const age = t - start
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    for (const p of parts) {
      p.vy += 0.35
      p.vx *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.r += p.vr
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - age / 1600)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.r)
      ctx.fillStyle = p.c
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (age < 1600) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
