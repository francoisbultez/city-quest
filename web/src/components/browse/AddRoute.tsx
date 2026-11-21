import { useState } from 'react'
import { addRouteFromUrl, RouteError } from '../../engine/registry'
import type { Route } from '../../types'
import { Modal } from '../Modal'

/** Paste a link to someone's route.json to add it to this phone. */
export function AddRoute({ onClose, onAdded }: { onClose: () => void; onAdded: (r: Route) => void }) {
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string[] | null>(null)
  const add = async () => {
    setBusy(true)
    setError(null)
    try {
      onAdded(await addRouteFromUrl(link.trim()))
    } catch (e) {
      setError(e instanceof RouteError ? [e.message, ...e.details.slice(0, 3)] : ['Couldn’t add that route.'])
      setBusy(false)
    }
  }
  return (
    <Modal title="Add a route from a link" onClose={onClose}>
      <p className="modal-note">Someone made a route and sent you its link? Paste it here. It’s checked, then kept on this phone.</p>
      <label className="field">
        <span>Route link</span>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/route.json" inputMode="url" autoComplete="off" spellCheck={false} />
      </label>
      {error && (
        <div className="error" role="alert">
          {error.map((l) => <div key={l}>{l}</div>)}
        </div>
      )}
      <div className="actions">
        <button className="btn primary" disabled={busy || !link.trim()} onClick={add}>{busy ? 'Checking…' : 'Add the route'}</button>
        <button className="btn soft" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}
