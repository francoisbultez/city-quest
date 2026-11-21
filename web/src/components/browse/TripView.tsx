import { useState } from 'react'
import { formatTripDate, withNames, type Trip } from '../../lib/trips'
import type { Route } from '../../types'
import { IconChevron } from '../icons'
import { SouvenirActions, SouvenirCard } from '../Souvenir'
import { StoryList } from '../StoryList'

/** One trip: the souvenir (save or share it again) and the stories you found. */
export function TripView({ trip, route, onBack, onStory }: { trip: Trip; route: Route; onBack: () => void; onStory: (index: number) => void }) {
  const [showCard, setShowCard] = useState(false)
  const others = trip.mode === 'team' ? trip.names : trip.names.slice(1)
  const photos = route.stops.map((s) => s.lesson.image).filter((i) => !!i).slice(0, 4)
  return (
    <main className="home browse trip-view enter">
      <header className="sub-head">
        <button className="round" onClick={onBack} aria-label="Back">
          <IconChevron dir="left" size={18} />
        </button>
        <div>
          <p>{formatTripDate(trip.date)}{others.length ? ` · with ${withNames(others)}` : ''}</p>
          <h1>{route.city} · {route.name}</h1>
        </div>
      </header>

      {showCard ? (
        <div className="trip-souvenir">
          <SouvenirCard route={route} trip={trip} />
          <SouvenirActions route={route} trip={trip} />
        </div>
      ) : (
        <button className="souvenir-row" onClick={() => setShowCard(true)}>
          <span className="mini-grid" aria-hidden="true">
            {photos.map((p) => <img key={p!.src} src={p!.src} alt="" />)}
          </span>
          <span className="txt"><b>Your souvenir</b><small>Save or share it again</small></span>
          <IconChevron />
        </button>
      )}

      <StoryList route={route} onOpen={onStory} title={`${route.stops.length} places you discovered`} />
    </main>
  )
}
