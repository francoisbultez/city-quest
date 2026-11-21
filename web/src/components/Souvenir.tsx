import { useState } from 'react'
import { routeKm } from '../lib/route'
import { formatDuration } from '../lib/game'
import { souvenirImage } from '../lib/souvenirImage'
import { formatTripDate, withNames, type Trip } from '../lib/trips'
import type { Route } from '../types'
import { Badge } from './Badge'
import { Stars } from './icons'

/** The postcard you keep after a hunt: photos, date, who played, the places, the badge. */
export function SouvenirCard({ route, trip }: { route: Route; trip: Trip }) {
  const photos = route.stops.map((s) => s.lesson.image).filter((i) => !!i).slice(0, 5)
  const who = trip.names.length ? withNames(trip.names) : trip.mode === 'team' ? 'Team' : 'Solo'
  return (
    <figure className="souvenir" aria-label={`Souvenir: ${route.city}, ${route.name}, ${formatTripDate(trip.date)}`}>
      {photos.length > 0 ? (
        <div className={`souvenir-photos n${photos.length}`} aria-hidden="true">
          {photos.map((p) => <img key={p!.src} src={p!.src} alt="" style={{ objectPosition: p!.position ?? '50% 50%' }} />)}
        </div>
      ) : (
        <div className="souvenir-photos none" style={{ background: `linear-gradient(135deg, ${route.theme?.colors[0] ?? '#ff4a2b'}, ${route.theme?.colors[1] ?? '#ffb199'})` }} aria-hidden="true" />
      )}
      <div className="souvenir-body">
        <div className="txt">
          <span className="eyebrow">{formatTripDate(trip.date)}</span>
          <b className="title">{route.city} · {route.name}</b>
          <span className="who">{who} · {routeKm(route.stops).toFixed(1)} km{trip.ms ? ` · ${formatDuration(trip.ms)}` : ''}</span>
          <ol className="places">
            {route.stops.map((s) => <li key={s.id}>{s.lesson.title}</li>)}
          </ol>
        </div>
        <div className="mark">
          <Badge size={76} route={route} mode={trip.mode} label="" />
          <Stars n={trip.stars} />
        </div>
      </div>
      <figcaption>
        <span>City Quest</span>
        <span>{route.stops.length} places discovered</span>
      </figcaption>
    </figure>
  )
}

/** Save the souvenir as an image, or share it to a chat. */
export function SouvenirActions({ route, trip }: { route: Route; trip: Trip }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const file = async () => {
    const blob = await souvenirImage(route, trip)
    return blob ? new File([blob], `city-quest-${route.id}-${trip.date.slice(0, 10)}.png`, { type: 'image/png' }) : null
  }
  const flash = (m: string) => {
    setNote(m)
    setTimeout(() => setNote(null), 2500)
  }
  const saveImage = async () => {
    setBusy(true)
    const f = await file()
    setBusy(false)
    if (!f) return flash('Couldn’t make the image on this phone.')
    const url = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    flash('Saved to your downloads.')
  }
  const share = async () => {
    const text = `${route.city} · ${route.name}: ${route.stops.length} places discovered on City Quest.`
    const link = window.location.origin + window.location.pathname
    try {
      setBusy(true)
      const f = await file()
      setBusy(false)
      if (f && navigator.canShare?.({ files: [f] })) return await navigator.share({ files: [f], text })
      if (navigator.share) return await navigator.share({ title: `${route.city} · ${route.name}`, text, url: link })
      await navigator.clipboard.writeText(`${text} ${link}`)
      flash('Copied. Paste it anywhere.')
    } catch {
      setBusy(false) /* share sheet dismissed */
    }
  }
  return (
    <div className="souvenir-actions">
      <button className="btn soft" onClick={saveImage} disabled={busy}>Save image</button>
      <button className="btn primary" onClick={share} disabled={busy}>Share</button>
      {note && <div className="toast" role="status">{note}</div>}
    </div>
  )
}
