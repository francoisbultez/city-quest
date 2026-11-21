import { IconCompass, IconPhotos } from '../icons'

export type Tab = 'explore' | 'trips'

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <button className={tab === 'explore' ? 'on' : ''} aria-current={tab === 'explore' ? 'page' : undefined} onClick={() => onTab('explore')}>
        <IconCompass />
        Explore
      </button>
      <button className={tab === 'trips' ? 'on' : ''} aria-current={tab === 'trips' ? 'page' : undefined} onClick={() => onTab('trips')}>
        <IconPhotos />
        Your trips
      </button>
    </nav>
  )
}
