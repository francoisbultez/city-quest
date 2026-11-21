import type { Route } from '../../types'
import { IconLocate } from '../icons'
import { Cover } from './Cover'
import { Steps } from './Steps'

/** First launch: what City Quest is, at a glance. Shown once. */
export function Welcome({ hero, locating, onNearMe, onChoose }: { hero: Route; locating: boolean; onNearMe: () => void; onChoose: () => void }) {
  return (
    <main className="welcome enter">
      <div className="welcome-hero">
        <Cover route={hero} />
        <span className="brand on-photo"><span className="dot" aria-hidden="true" />City Quest</span>
      </div>
      <div className="welcome-body">
        <h1>Discover a city by solving its riddles</h1>
        <p>A treasure hunt on foot. Every answer is hidden somewhere in the street.</p>
        <Steps />
      </div>
      <div className="welcome-cta">
        <p className="fine">Free · no account · works offline</p>
        <button className="btn primary" onClick={onNearMe} disabled={locating}>
          <IconLocate /> {locating ? 'Finding you…' : 'Find a hunt near me'}
        </button>
        <button className="text-btn" onClick={onChoose}><b>Choose a city instead</b></button>
      </div>
    </main>
  )
}
