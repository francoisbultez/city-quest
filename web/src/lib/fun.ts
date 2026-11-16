/** One colour per stop, cycling. `ink` is the readable text colour on top of it. */
export const STOP_COLORS = [
  { bg: '#2f4bff', ink: '#ffffff' }, // cobalt
  { bg: '#ee4434', ink: '#ffffff' }, // tomato
  { bg: '#0b9a6d', ink: '#ffffff' }, // mint
  { bg: '#ffb800', ink: '#241a00' }, // sun
  { bg: '#8b6cff', ink: '#ffffff' }, // lilac
]

export const stopColor = (i: number) => STOP_COLORS[i % STOP_COLORS.length]

const WRONG_LINES = ['Not quite. Look again.', 'Not quite. Read it slowly.', 'Not quite. The answer is right in front of you.']
export const wrongLine = (n: number) => WRONG_LINES[n % WRONG_LINES.length]

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

/** Lightweight confetti burst on a full-screen canvas. */
export function confetti(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }) {
  if (reducedMotion()) return
  const canvas = document.createElement('canvas')
  canvas.className = 'confetti'
  const dpr = window.devicePixelRatio || 1
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  const colors = STOP_COLORS.map((c) => c.bg)
  const parts = Array.from({ length: 90 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9
    const speed = 7 + Math.random() * 9
    return {
      x: origin.x * innerWidth,
      y: origin.y * innerHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() < 0.3,
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
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (age < 1600) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
