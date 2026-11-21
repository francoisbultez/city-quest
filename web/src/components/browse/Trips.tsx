import { useState } from 'react'
import { findRoute } from '../../engine/registry'
import type { City } from '../../lib/cities'
import { formatTripDate, withNames, type Trip } from '../../lib/trips'
import type { Route } from '../../types'
import { Modal } from '../Modal'
import { IconChevron, IconGear, IconPin, Stars } from '../icons'
import { Cover } from './Cover'

interface Props {
  trips: Trip[]
  name: string
  /** Cities you haven't played yet, for a gentle "going somewhere next?". */
  nextCity?: City
  onOpenTrip: (t: Trip) => void
  onExplore: (c?: City) => void
  onName: (name: string) => void
  onAddRoute: () => void
  onJoinTeam: () => void
  onReset: () => void
}

function TripCard({ trip, route, onOpen }: { trip: Trip; route: Route; onOpen: () => void }) {
  const photos = route.stops.map((s) => s.lesson.image).filter((i) => !!i).slice(0, 3)
  const others = trip.names.slice(1)
  const who = trip.mode === 'team' ? (trip.names.length ? `With ${withNames(trip.names)}` : 'With your team') : others.length ? `With ${withNames(others)}` : 'Solo'
  return (
    <button className="trip-card" onClick={onOpen} aria-label={`${route.city} · ${route.name}, ${formatTripDate(trip.date)}`}>
      <span className={`trip-photos n${Math.max(photos.length, 1)}`} aria-hidden="true">
        {photos.length ? photos.map((p) => <img key={p!.src} src={p!.src} alt="" loading="lazy" />) : <Cover route={route} />}
      </span>
      <span className="trip-body">
        <span className="txt">
          <span className="eyebrow">{formatTripDate(trip.date)}</span>
          <b>{route.city} · {route.name}</b>
          <span className="meta">{who} · {route.stops.length} places · <Stars n={trip.stars} /></span>
        </span>
        <IconChevron />
      </span>
    </button>
  )
}

/** Each hunt you played, kept as a memory. Settings live behind the gear. */
export function Trips({ trips, name, nextCity, onOpenTrip, onExplore, onName, onAddRoute, onJoinTeam, onReset }: Props) {
  const [settings, setSettings] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [confirmReset, setConfirmReset] = useState(false)
  const shown = trips.flatMap((t) => {
    const r = findRoute(t.routeId)
    return r ? [{ t, r }] : []
  })

  return (
    <main className="home browse with-tabs trips enter">
      <header className="picker-head">
        <h1>Your trips</h1>
        <button className="round" onClick={() => setSettings(true)} aria-label="Settings">
          <IconGear />
        </button>
      </header>
      <p className="lead">The cities you walked and the stories you found. Kept on this phone.</p>

      {shown.length ? (
        <div className="trip-list">
          {shown.map(({ t, r }) => <TripCard key={t.id} trip={t} route={r} onOpen={() => onOpenTrip(t)} />)}
        </div>
      ) : (
        <div className="trips-empty">
          <b>No trips yet</b>
          <p>Finish a hunt and its souvenir lands here, with every story you discovered.</p>
          <button className="btn primary" onClick={() => onExplore()}>Find a hunt</button>
        </div>
      )}

      {nextCity && shown.length > 0 && (
        <button className="next-city" onClick={() => onExplore(nextCity)}>
          <span className="next-pin" aria-hidden="true"><IconPin size={20} /></span>
          <span><b>Going somewhere next?</b> City Quest also has {nextCity.name}{nextCity.region ? `, in ${nextCity.region}` : ''}.</span>
        </button>
      )}

      {settings && (
        <Modal title="Settings" onClose={() => setSettings(false)}>
          <section className="settings" aria-label="Settings">
            <button onClick={() => { setDraft(name); setEditing(true); setSettings(false) }}><span>Name your team sees</span><span className="value">{name || 'Not set'}<IconChevron /></span></button>
            <div className="row"><span>Language</span><span className="value">English · more soon</span></div>
            <button onClick={() => { setSettings(false); onJoinTeam() }}><span>Join a team with a code</span><span className="value"><IconChevron /></span></button>
            <button onClick={() => { setSettings(false); onAddRoute() }}><span>Add a route from a link</span><span className="value"><IconChevron /></span></button>
            <button className="danger" onClick={() => { setSettings(false); setConfirmReset(true) }}><span>Delete my trips and progress</span></button>
          </section>
          <p className="fine">No account: everything stays on this phone.</p>
        </Modal>
      )}
      {editing && (
        <Modal title="Your name" onClose={() => setEditing(false)}>
          <p className="modal-note">Your teammates see it, and it goes on your souvenirs.</p>
          <label className="field">
            <span>Name</span>
            <input value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 16))} placeholder="e.g. Ana" autoComplete="given-name" maxLength={16} autoFocus />
          </label>
          <div className="actions">
            <button className="btn primary" disabled={!draft.trim()} onClick={() => { onName(draft.trim()); setEditing(false) }}>Save</button>
            <button className="btn soft" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </Modal>
      )}
      {confirmReset && (
        <Modal title="Delete your trips?" onClose={() => setConfirmReset(false)}>
          <p className="modal-note">This removes your trips, souvenirs and the hunt in progress from this phone. Your name and added routes stay.</p>
          <div className="actions">
            <button className="btn primary danger-bg" onClick={() => { onReset(); setConfirmReset(false) }}>Delete everything</button>
            <button className="btn soft" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </main>
  )
}
