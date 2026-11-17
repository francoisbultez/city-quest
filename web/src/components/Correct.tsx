import type { Stop } from '../types'
import { Progress } from './TopBar'

interface Props {
  stop: Stop
  index: number
  total: number
  earned: number
  perfect: boolean
  streak: number
  points: number
  isLast: boolean
  onNext: () => void
}

export function Correct({ stop, index, total, earned, perfect, streak, points, isLast, onNext }: Props) {
  return (
    <main className="correct">
      <Progress total={total} done={index + 1} />
      <div className="correct-hero">
        <div className="check" aria-hidden="true">
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <div className="earned">+{earned}</div>
        <h1>{stop.answer}. {perfect ? 'Perfect!' : 'Correct!'}</h1>
        {streak >= 2 && (
          <span className="streak">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z" /></svg>
            {streak} in a row
          </span>
        )}
      </div>

      <section className="fact">
        <span className="label">Did you know?</span>
        <p>{stop.fact}</p>
        {stop.verification.status === 'draft' && <span className="draft">Not verified on site yet</span>}
      </section>

      <div className="correct-foot">
        <div className="tally"><span>{index + 1} of {total} found</span><span><span className="star" aria-hidden="true">★</span> {points} pts</span></div>
        <button className="btn primary" onClick={onNext}>{isLast ? 'See my badge' : 'Next riddle'}</button>
      </div>
    </main>
  )
}
