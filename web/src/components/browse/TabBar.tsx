import { IconCompass, IconUser } from '../icons'

export type Tab = 'explore' | 'you'

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <button className={tab === 'explore' ? 'on' : ''} aria-current={tab === 'explore' ? 'page' : undefined} onClick={() => onTab('explore')}>
        <IconCompass />
        Explore
      </button>
      <button className={tab === 'you' ? 'on' : ''} aria-current={tab === 'you' ? 'page' : undefined} onClick={() => onTab('you')}>
        <IconUser />
        You
      </button>
    </nav>
  )
}
