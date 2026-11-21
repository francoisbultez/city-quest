import { IconEye, IconMedal, IconPin } from '../icons'

/** How City Quest works, in three steps. `compact` is the small tile row on the home screen. */
export function Steps({ compact = false }: { compact?: boolean }) {
  const steps = [
    { icon: <IconPin size={compact ? 18 : 22} />, tone: 'red', title: compact ? 'Walk to the riddle' : 'Follow a riddle on the map', text: 'It warms up as you get close' },
    { icon: <IconEye size={compact ? 18 : 22} />, tone: 'blue', title: compact ? 'Answer what you see' : 'Look around and answer', text: 'Then read the place’s story in 2 minutes' },
    { icon: <IconMedal size={compact ? 18 : 22} />, tone: 'gold', title: compact ? 'Earn the badge' : 'Earn the city’s badge', text: 'Alone, or with friends on their phones' },
  ]
  if (compact) {
    return (
      <ol className="steps compact" aria-label="How it works">
        {steps.map((s, i) => (
          <li key={s.title} className={s.tone}>
            {s.icon}
            <span>{i + 1}. {s.title}</span>
          </li>
        ))}
      </ol>
    )
  }
  return (
    <ol className="steps" aria-label="How it works">
      {steps.map((s) => (
        <li key={s.title}>
          <span className={`step-icon ${s.tone}`}>{s.icon}</span>
          <span><b>{s.title}</b><small>{s.text}</small></span>
        </li>
      ))}
    </ol>
  )
}
