import { useEffect, useRef, useState } from 'react'
import { buzz } from '../lib/fx'
import { distanceM, heatFor, isAtStop } from '../lib/route'
import { load, save } from '../lib/storage'
import { useGeolocation, type Position } from '../lib/useGeolocation'
import type { Stop } from '../types'
import { teamNote } from '../lib/team/logic'
import { RouteMap, type Mate } from './RouteMap'
import { TopBar } from './TopBar'

const HEAT_LABEL = { cold: 'Cold', cool: 'Cool', warm: 'Warm', hot: 'Hot' } as const

/** `?test` in the URL turns on test mode (remembered on this device; `?test=off` turns it off). */
function readTestMode(): boolean {
  const param = new URLSearchParams(window.location.search).get('test')
  if (param !== null) save('cq.testMode', param !== 'off')
  return load('cq.testMode', false)
}

function formatDistance(m: number) {
  return m < 1000 ? { value: String(Math.round(m / 10) * 10), unit: 'm to go' } : { value: (m / 1000).toFixed(1), unit: 'km to go' }
}

interface Props {
  stops: Stop[]
  index: number
  points: number
  onArrive: () => void
  onPause: () => void
  /** Together mode: teammates on the map, and this phone's position reported back. */
  mates?: Mate[]
  onPosition?: (p: Position) => void
}

export function Walk({ stops, index, points, onArrive, onPause, mates, onPosition }: Props) {
  const stop = stops[index]
  const gps = useGeolocation()
  const [testMode] = useState(readTestMode)
  const [fakePos, setFakePos] = useState<Position | null>(null)
  const [showWhere, setShowWhere] = useState(false)
  const pos = fakePos ?? gps.pos

  const dist = pos ? distanceM(pos, stop.place) : null
  const here = pos ? isAtStop(pos, stop) : false
  const heat = dist !== null ? heatFor(dist) : null

  const wasHere = useRef(false)
  useEffect(() => {
    if (here && !wasHere.current) buzz(80)
    wasHere.current = here
  }, [here])

  useEffect(() => {
    if (pos) onPosition?.(pos)
  }, [pos, onPosition])

  const note = mates ? teamNote(dist, mates.map((m) => ({ name: m.name, dist: m.pos ? distanceM(m.pos, stop.place) : null }))) : null

  const d = dist !== null ? formatDistance(dist) : null

  return (
    <main className="walk">
      <RouteMap stops={stops} current={index} pos={pos} mates={mates} />
      <TopBar index={index} total={stops.length} points={points} onPause={onPause} />

      <section className={here ? 'walk-card here' : 'walk-card'} key={stop.id}>
        {here ? (
          <>
            <div className="found">
              <span className="found-icon" aria-hidden="true">✓</span>
              <div>
                <strong>You found it!</strong>
                <span>{stop.place.name}</span>
              </div>
            </div>
            <button className="btn primary" onClick={onArrive}>Open the quiz</button>
          </>
        ) : (
          <>
            {mates && <span className="label team-label">Team riddle</span>}
            <p className="riddle">“{stop.riddle}”</p>
            {showWhere && <p className="where">{stop.whereHint}</p>}
            <div className="distance-row">
              {d ? (
                <div className="distance"><b>{d.value}</b><span>{d.unit}</span></div>
              ) : (
                <div className="distance"><span>{gps.error ?? 'Finding you…'}</span></div>
              )}
              {heat && (
                <span className={`heat ${heat}`}>
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z" /></svg>
                  {HEAT_LABEL[heat]}
                </span>
              )}
            </div>
            {note && <p className="team-note">{note}</p>}
            <div className="row-buttons">
              <button className="btn soft" onClick={() => setShowWhere(true)} disabled={showWhere}>Where is it?</button>
              <button className="btn soft" onClick={onArrive}>I’m here</button>
            </div>
            {testMode && (
              <button className="btn test" onClick={() => setFakePos({ lat: stop.place.lat, lng: stop.place.lng, accuracy: 5 })}>
                🧪 Teleport to this stop
              </button>
            )}
          </>
        )}
      </section>
    </main>
  )
}
