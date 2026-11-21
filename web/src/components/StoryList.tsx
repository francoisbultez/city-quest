import type { Route } from '../types'
import { Cover } from './browse/Cover'

/** The places of a route, each opening its story again. */
export function StoryList({ route, onOpen, title }: { route: Route; onOpen: (index: number) => void; title?: string }) {
  return (
    <section className="stories">
      <h2>{title ?? `Read the ${route.stops.length} stories again`}</h2>
      <ul>
        {route.stops.map((st, i) => (
          <li key={st.id}>
            <button onClick={() => onOpen(i)}>
              <span className="thumb">
                {st.lesson.image ? <img src={st.lesson.image.src} alt="" loading="lazy" /> : <Cover route={route} />}
                <i>{i + 1}</i>
              </span>
              <span className="txt"><b>{st.lesson.title}</b>{st.lesson.recap && <small>{st.lesson.recap}</small>}</span>
              <span className="chev" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
