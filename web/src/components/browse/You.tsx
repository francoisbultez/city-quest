import { useState } from 'react'
import { bestBadge } from '../../lib/cities'
import { avatarColor, since, stats } from '../../lib/profile'
import type { EarnedBadge } from '../../lib/session'
import type { Route } from '../../types'
import { Badge } from '../Badge'
import { Modal } from '../Modal'
import { IconChevron, IconUser, Stars } from '../icons'

interface Props {
  routes: Route[]
  badges: EarnedBadge[]
  name: string
  onName: (name: string) => void
  onOpen: (r: Route) => void
  onAddRoute: () => void
  onJoinTeam: () => void
  onReset: () => void
}

/** Your space: who you are, what you've done, and your settings. Everything stays on this phone. */
export function You({ routes, badges, name, onName, onOpen, onAddRoute, onJoinTeam, onReset }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [confirmReset, setConfirmReset] = useState(false)
  const s = stats(routes, badges)
  const [sinceDate] = useState(since)
  const month = sinceDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  // Earned badges first, then the ones still to win.
  const all = [...routes].sort((a, b) => Number(!!bestBadge(b.id, badges)) - Number(!!bestBadge(a.id, badges)))

  return (
    <main className="home browse with-tabs you enter">
      <header className="you-head">
        {name ? (
          <span className="avatar big" style={{ background: avatarColor(name) }} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        ) : (
          <span className="avatar big empty" aria-hidden="true"><IconUser size={30} /></span>
        )}
        <div>
          <h1>{name || 'Explorer'}</h1>
          <p>Exploring since {month}</p>
        </div>
        <button className="pill-btn" onClick={() => { setDraft(name); setEditing(true) }}>{name ? 'Edit' : 'Add name'}</button>
      </header>

      <div className="you-stats">
        <div><b>{s.badges}</b><span>{s.badges === 1 ? 'badge' : 'badges'}</span></div>
        <div><b>{s.places}</b><span>places</span></div>
        <div><b>{s.km.toFixed(1)}</b><span>km walked</span></div>
        <div><b>{s.cities}</b><span>{s.cities === 1 ? 'city' : 'cities'}</span></div>
      </div>

      <div className="rail-head">
        <h2>Your badges</h2>
        <span className="count">{s.badges} of {routes.length}</span>
      </div>
      <div className="badge-grid">
        {all.map((r) => {
          const b = bestBadge(r.id, badges)
          return (
            <button key={r.id} className={b ? 'badge-tile' : 'badge-tile locked'} onClick={() => onOpen(r)} aria-label={`${r.city} · ${r.name}: ${b ? `${b.stars} of 3 stars` : 'not earned yet'}`}>
              <Badge size={80} route={r} mode={b?.mode ?? 'solo'} locked={!b} label="" />
              <b>{r.name.replace(/^The /, '')}</b>
              {b ? <span className="earned"><Stars n={b.stars} /> {b.mode === 'team' ? 'Team' : 'Solo'}</span> : <span>{r.city}</span>}
            </button>
          )
        })}
      </div>

      <section className="settings" aria-label="Settings">
        <button onClick={() => { setDraft(name); setEditing(true) }}><span>Name your team sees</span><span className="value">{name || 'Not set'}<IconChevron /></span></button>
        <div className="row"><span>Language</span><span className="value">English · more soon</span></div>
        <button onClick={onJoinTeam}><span>Join a team with a code</span><span className="value"><IconChevron /></span></button>
        <button onClick={onAddRoute}><span>Add a route from a link</span><span className="value"><IconChevron /></span></button>
        <button className="danger" onClick={() => setConfirmReset(true)}><span>Reset my progress</span></button>
      </section>
      <p className="fine">No account: your name, badges and progress stay on this phone.</p>

      {editing && (
        <Modal title="Your name" onClose={() => setEditing(false)}>
          <p className="modal-note">Your teammates see it in Together mode, and it greets you on the home screen.</p>
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
        <Modal title="Reset your progress?" onClose={() => setConfirmReset(false)}>
          <p className="modal-note">This removes your badges and the hunt in progress from this phone. Your name and added routes stay.</p>
          <div className="actions">
            <button className="btn primary danger-bg" onClick={() => { onReset(); setConfirmReset(false) }}>Reset everything</button>
            <button className="btn soft" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </main>
  )
}
