import { formatTripDate, withNames, type Trip } from './trips'
import { routeKm } from './route'
import { formatDuration } from './game'
import type { Route } from '../types'

const W = 1080
const H = 1350

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    if (/^https?:\/\//.test(src) && !src.startsWith(location.origin)) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height)
  const sw = w / s
  const sh = h / s
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** The souvenir as a 1080×1350 PNG, ready to save or share. */
export async function souvenirImage(route: Route, trip: Trip): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  await document.fonts?.ready
  const font = (weight: number, size: number) => `${weight} ${size}px 'Geist Variable', system-ui, sans-serif`

  ctx.fillStyle = '#f3f1ec'
  ctx.fillRect(0, 0, W, H)
  const cx = 60
  const cy = 60
  const cw = W - 120
  const ch = H - 120
  ctx.save()
  ctx.shadowColor = 'rgba(17,17,19,0.14)'
  ctx.shadowBlur = 50
  ctx.shadowOffsetY = 20
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, cx, cy, cw, ch, 48)
  ctx.fill()
  ctx.restore()

  // Photos: one big, then up to four small.
  ctx.save()
  roundRect(ctx, cx, cy, cw, ch, 48)
  ctx.clip()
  const photos = (await Promise.all(route.stops.map((s) => s.lesson.image?.src).filter((s): s is string => !!s).slice(0, 5).map(loadImg))).filter(
    (i): i is HTMLImageElement => !!i,
  )
  const gap = 6
  const topH = 420
  const smallH = 220
  const [colors0, colors1] = route.theme?.colors ?? ['#ff4a2b', '#ffb199']
  if (photos.length) {
    const top = photos.slice(0, Math.min(2, photos.length))
    const topW = top.length === 2 ? [(cw - gap) * 0.62, (cw - gap) * 0.38] : [cw]
    let x = cx
    top.forEach((img, i) => {
      cover(ctx, img, x, cy, topW[i], topH)
      x += topW[i] + gap
    })
    const rest = photos.slice(2)
    if (rest.length) {
      const w = (cw - gap * (rest.length - 1)) / rest.length
      rest.forEach((img, i) => cover(ctx, img, cx + i * (w + gap), cy + topH + gap, w, smallH))
    }
  } else {
    const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + topH + smallH)
    g.addColorStop(0, colors0)
    g.addColorStop(1, colors1)
    ctx.fillStyle = g
    ctx.fillRect(cx, cy, cw, topH + smallH + gap)
  }
  ctx.restore()

  // Text.
  let y = cy + topH + smallH + gap + 70
  const tx = cx + 56
  ctx.fillStyle = '#6e6e76'
  ctx.font = font(650, 30)
  ctx.fillText(formatTripDate(trip.date), tx, y)
  y += 64
  ctx.fillStyle = '#111113'
  ctx.font = font(750, 56)
  ctx.fillText(`${route.city} · ${route.name}`, tx, y, cw - 112 - 190)
  y += 52
  ctx.fillStyle = '#4d4d55'
  ctx.font = font(500, 32)
  const who = trip.names.length ? withNames(trip.names) : trip.mode === 'team' ? 'Team' : 'Solo'
  ctx.fillText(`${who} · ${routeKm(route.stops).toFixed(1)} km${trip.ms ? ` · ${formatDuration(trip.ms)}` : ''}`, tx, y, cw - 112 - 190)
  y += 60
  // Badge in the corner; the list of places stays clear of it.
  const bx = cx + cw - 56 - 75
  ctx.fillStyle = '#3d3d44'
  const titles = route.stops.map((s, i) => `${i + 1}. ${s.lesson.title}`)
  const half = Math.ceil(titles.length / 2)
  const listW = bx - 75 - 30 - tx
  const line = Math.min(46, Math.floor((cy + ch - 120 - y) / Math.max(half, 1)))
  ctx.font = font(500, Math.min(29, line - 12))
  titles.forEach((t, i) => ctx.fillText(t, tx + (i < half ? 0 : listW / 2 + 10), y + (i % half) * line, listW / 2 - 10))

  const by = cy + topH + smallH + gap + 110
  ctx.save()
  ctx.beginPath()
  ctx.arc(bx, by, 75, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = colors0
  ctx.fillRect(bx - 75, by - 75, 150, 150)
  ctx.fillStyle = route.theme?.colors[1] ?? '#ffffff'
  ctx.fillRect(bx - 75, by - 36, 150, 72)
  ctx.restore()
  ctx.fillStyle = route.theme?.ink ?? colors0
  ctx.textAlign = 'center'
  const city = route.city.toUpperCase()
  ctx.font = font(800, Math.min(28, Math.floor(230 / city.length)))
  ctx.fillText(city, bx, by + 10, 140)
  ctx.fillStyle = '#e0a000'
  ctx.font = font(700, 34)
  ctx.fillText('★'.repeat(trip.stars) + '☆'.repeat(3 - trip.stars), bx, by + 125)

  // Footer.
  ctx.textAlign = 'left'
  ctx.strokeStyle = '#e2e0da'
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.moveTo(cx + 40, cy + ch - 80)
  ctx.lineTo(cx + cw - 40, cy + ch - 80)
  ctx.stroke()
  ctx.fillStyle = '#8a8a90'
  ctx.font = font(600, 26)
  ctx.fillText('City Quest', tx, cy + ch - 34)
  ctx.textAlign = 'right'
  ctx.fillText(`${route.stops.length} places discovered`, cx + cw - 56, cy + ch - 34)

  try {
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
  } catch {
    return null // a photo from another site blocked the export
  }
}
