import { useEffect, useState } from 'react'
import { buzz } from '../lib/fx'
import { HINT_COST, WRONG_COST } from '../lib/game'
import type { Stop } from '../types'
import { Progress } from './TopBar'

const SECONDS = 30

interface Props {
  stop: Stop
  index: number
  total: number
  points: number
  hinted: boolean
  onHint: () => void
  onWrong: () => void
  onCorrect: () => void
}

export function Quiz({ stop, index, total, points, hinted, onHint, onWrong, onCorrect }: Props) {
  const [left, setLeft] = useState(SECONDS)
  const [wrongPick, setWrongPick] = useState<string | null>(null)
  const [tried, setTried] = useState<string[]>([])

  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  const pick = (o: string) => {
    if (tried.includes(o)) return
    if (o === stop.answer) {
      buzz([30, 40, 30])
      onCorrect()
    } else {
      buzz(120)
      setWrongPick(o)
      setTried((t) => [...t, o])
      onWrong()
    }
  }

  const circumference = 2 * Math.PI * 17

  return (
    <main className="quiz">
      <div className="quiz-top">
        <span className="chip">Stop {index + 1} · {stop.place.name.split(',')[0]}</span>
        <div className="timer" role="timer" aria-label={`${left} seconds left`}>
          <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" className="track" />
            <circle cx="20" cy="20" r="17" className="bar" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - left / SECONDS)} transform="rotate(-90 20 20)" />
          </svg>
          <span>{left}</span>
        </div>
      </div>
      <Progress total={total} done={index} current={index} />

      <span className="look">{stop.look}</span>
      <h2>{stop.question}</h2>

      <div className="options">
        {stop.options.map((o, i) => {
          const isTried = tried.includes(o)
          return (
            <button key={o} className={`option${isTried ? ' tried' : ''}${wrongPick === o ? ' shake' : ''}`} onClick={() => pick(o)} disabled={isTried}>
              <span className="key" aria-hidden="true">{'ABCD'[i]}</span>
              {o}
            </button>
          )
        })}
      </div>

      <p className="feedback" role="status">{wrongPick ? `Not quite. Look again (−${WRONG_COST})` : ''}</p>
      {hinted && <p className="hint-text"><b>Hint:</b> {stop.hint}</p>}

      <div className="quiz-foot">
        <button className="link" onClick={onHint} disabled={hinted}>
          {hinted ? 'Hint used' : <>Hint <span>−{HINT_COST}</span></>}
        </button>
        <span className="points"><span className="star" aria-hidden="true">★</span> {points}</span>
      </div>
    </main>
  )
}
