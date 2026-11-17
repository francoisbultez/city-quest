export function Progress({ total, done, current }: { total: number; done: number; current?: number }) {
  return (
    <span className="segments" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < done ? 'done' : i === current ? 'now' : ''} />
      ))}
    </span>
  )
}

export function TopBar({ index, total, points, onPause }: { index: number; total: number; points: number; onPause: () => void }) {
  return (
    <header className="topbar">
      <button className="pill icon" onClick={onPause} aria-label="Pause">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" /></svg>
      </button>
      <div className="pill grow">
        <span className="count">{index + 1} / {total}</span>
        <Progress total={total} done={index} current={index} />
      </div>
      <div className="pill" aria-label={`${points} points`}>
        <span className="star" aria-hidden="true">★</span>
        <b data-testid="score">{points}</b>
      </div>
    </header>
  )
}
