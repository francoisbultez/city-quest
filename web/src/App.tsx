import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { End } from './components/End'
import { AddRoute } from './components/browse/AddRoute'
import { CityPicker } from './components/browse/CityPicker'
import { CityRoutes } from './components/browse/CityRoutes'
import { Home } from './components/browse/Home'
import { RoutePreview } from './components/browse/RoutePreview'
import { Lesson } from './components/Lesson'
import { Modal } from './components/Modal'
import { Quiz } from './components/Quiz'
import { Walk } from './components/Walk'
import { Team } from './components/team/Team'
import { TeamJoin } from './components/team/TeamJoin'
import { addRouteFromUrl, findRoute, getRoutes, RouteError, routeById, subscribeRoutes } from './engine/registry'
import { cityKey, citiesFrom, nearestCity } from './lib/cities'
import { currentStreak, isPerfect, starsFor, stopPoints } from './lib/game'
import { awardBadge, loadBadges, loadSession, newSession, saveSession, sessionPoints, type Session } from './lib/session'
import { load, reportClue, save } from './lib/storage'
import { loadName, loadTeam, openRoom, saveTeam } from './lib/team/room'
import type { Room } from './lib/team/types'
import { useApproxPosition } from './lib/useApproxPosition'
import type { Route } from './types'

type View = 'home' | 'cities' | 'routes' | 'preview'

const REASONS = ['Can’t find it', 'Answer looks wrong', 'Covered or closed', 'Other']

export default function App() {
  const routes = useSyncExternalStore(subscribeRoutes, getRoutes)
  // A saved game whose route has since been removed can't be resumed.
  const [session, setSession] = useState<Session | null>(() => {
    const s = loadSession()
    return s && findRoute(s.routeId) ? s : null
  })
  // The route last opened; a solo game always plays its own route.
  const [pickedId, setPickedId] = useState(() => load<string | null>('cq.route', null) ?? session?.routeId ?? routes[0].id)
  const picked = routeById(pickedId)
  const route = session ? routeById(session.routeId) : picked

  // Cities come from the routes: a new route folder adds its city.
  const cities = useMemo(() => citiesFrom(routes), [routes])
  const [cityChoice, setCityChoice] = useState<string | null>(() => load<string | null>('cq.city', null))
  const geo = useApproxPosition()
  const autoCity = nearestCity(cities, geo.pos)?.key ?? cityKey(picked.city)
  const city = cities.find((c) => c.key === (cityChoice ?? autoCity)) ?? cities[0]
  const [view, setView] = useState<View>('home')
  const [adding, setAdding] = useState(false)

  // The phone's back button walks back through these screens.
  const trail = useRef<View[]>([])
  const go = (v: View) => {
    trail.current.push(v)
    window.history.pushState({ cq: true }, '')
    setView(v)
  }
  const back = () => window.history.back()
  const goHome = () => {
    trail.current = []
    setView('home')
  }
  useEffect(() => {
    const onPop = () => {
      trail.current.pop()
      setView(trail.current.at(-1) ?? 'home')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const pickCity = (key: string) => {
    setCityChoice(key)
    save('cq.city', key)
  }
  const openRoute = (r: Route) => {
    setPickedId(r.id)
    save('cq.route', r.id)
    go('preview')
  }
  const [badges, setBadges] = useState(loadBadges)
  const [atHome, setAtHome] = useState(true)
  const [pause, setPause] = useState<'menu' | 'report' | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [review, setReview] = useState<number | null>(null)
  // Together mode: `?team=CODE` opens the join screen with the code filled in.
  const [inviteCode] = useState(() => new URLSearchParams(window.location.search).get('team') ?? '')
  const [teamView, setTeamView] = useState<'join' | 'play' | null>(() => (inviteCode ? 'join' : null))
  const [teamCode, setTeamCode] = useState(() => loadTeam()?.code ?? null)
  const [room, setRoom] = useState<Room | null>(null)

  // Reconnect to the team after a reload.
  useEffect(() => {
    if (teamView !== 'play' || room || !teamCode) return
    let cancelled = false
    openRoom(teamCode, loadName()).then((r) => {
      if (!cancelled) setRoom(r)
    })
    return () => {
      cancelled = true
    }
  }, [teamView, room, teamCode])
  useEffect(() => () => room?.close(), [room])

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // `?route=<link to a route.json>` adds someone else's route to this phone.
  useEffect(() => {
    const link = new URLSearchParams(window.location.search).get('route')
    if (!link) return
    const params = new URLSearchParams(window.location.search)
    params.delete('route')
    window.history.replaceState(null, '', window.location.pathname + (params.size ? `?${params}` : ''))
    addRouteFromUrl(link)
      .then((r) => {
        setPickedId(r.id)
        save('cq.route', r.id)
        pickCity(cityKey(r.city))
        flash(`Added “${r.city} · ${r.name}”`)
      })
      .catch((e) => flash(e instanceof RouteError ? [e.message, ...e.details.slice(0, 2)].join(' ') : 'Couldn’t add that route.'))
  }, [])

  const answers = Object.fromEntries(route.stops.flatMap((st) => (st.lesson.check ? [[st.id, st.lesson.check.answer]] : [])))

  const update = (s: Session | null) => {
    setSession(s)
    saveSession(s)
  }

  if (teamView === 'join') {
    return (
      <TeamJoin
        route={picked}
        initialCode={inviteCode}
        onBack={() => setTeamView(null)}
        onJoined={(r) => {
          saveTeam({ code: r.code })
          setTeamCode(r.code)
          setRoom(r)
          setTeamView('play')
          if (inviteCode) window.history.replaceState(null, '', window.location.pathname)
        }}
      />
    )
  }
  if (teamView === 'play') {
    if (!room) return <main className="team-loading"><p>Connecting to your team…</p></main>
    return (
      <Team
        key={room.code}
        room={room}
        onBadges={setBadges}
        onExit={(left) => {
          if (left) {
            saveTeam(null)
            setTeamCode(null)
            room.close()
            setRoom(null)
          }
          setTeamView(null)
        }}
      />
    )
  }

  if (atHome || !session) {
    let screen
    if (view === 'cities') {
      screen = (
        <CityPicker
          cities={cities}
          current={city}
          badges={badges}
          onClose={back}
          onPick={(c) => {
            pickCity(c.key)
            back()
          }}
          onAddRoute={() => setAdding(true)}
        />
      )
    } else if (view === 'routes') {
      screen = <CityRoutes city={city} badges={badges} session={session} onOpen={openRoute} onBack={back} />
    } else if (view === 'preview') {
      screen = (
        <RoutePreview
          key={picked.id}
          route={picked}
          badges={badges}
          session={session}
          team={teamCode}
          onBack={back}
          onStart={() => {
            update(newSession(picked.id))
            setAtHome(false)
          }}
          onResume={() => setAtHome(false)}
          onTogether={() => setTeamView(teamCode ? 'play' : 'join')}
        />
      )
    } else {
      screen = (
        <Home
          key={city.key}
          city={city}
          badges={badges}
          session={session}
          playingRoute={session ? findRoute(session.routeId) : undefined}
          focusId={picked.id}
          team={teamCode}
          onCities={() => go('cities')}
          onSeeAll={() => go('routes')}
          onOpen={openRoute}
          onResume={() => setAtHome(false)}
          onTeam={() => setTeamView('play')}
          onJoinTeam={() => setTeamView('join')}
        />
      )
    }
    return (
      <>
        {screen}
        {adding && (
          <AddRoute
            onClose={() => setAdding(false)}
            onAdded={(r) => {
              setAdding(false)
              pickCity(cityKey(r.city))
              flash(`Added “${r.city} · ${r.name}”`)
              setPickedId(r.id)
              save('cq.route', r.id)
              go('preview')
            }}
          />
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </>
    )
  }

  const s = session
  const stop = route.stops[s.index]
  const total = route.stops.length
  const points = sessionPoints(s, answers)
  const spottedFor = (id: string) => s.spotted.filter((k) => k.startsWith(id + ':')).map((k) => Number(k.split(':')[1]))
  const toggleSpot = (id: string, i: number) => {
    const key = `${id}:${i}`
    update({ ...s, spotted: s.spotted.includes(key) ? s.spotted.filter((k) => k !== key) : [...s.spotted, key] })
  }
  const answerCheck = (id: string, o: string) => {
    if (s.checks[id] === undefined) update({ ...s, checks: { ...s.checks, [id]: o } })
  }
  const isLast = s.index === total - 1

  const leave = () => {
    setPause(null)
    update(null)
    setAtHome(true)
    goHome()
  }

  const sheet = pause && (
    <Modal title={pause === 'menu' ? 'Paused' : 'What’s wrong with this stop?'} onClose={() => setPause(null)}>
      {pause === 'menu' ? (
        <div className="actions">
          <button className="btn primary" onClick={() => setPause(null)}>Resume</button>
          <button className="btn soft" onClick={() => setPause('report')}>Report a problem with this stop</button>
          <button className="btn danger-text" onClick={leave}>Leave the route</button>
        </div>
      ) : (
        <>
          <div className="reasons">
            {REASONS.map((r) => (
              <button key={r} className={reason === r ? 'on' : ''} aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>
            ))}
          </div>
          <div className="actions">
            <button
              className="btn primary"
              disabled={!reason}
              onClick={() => {
                reportClue({ huntId: route.id, nodeId: stop.id, reason: reason!, at: new Date().toISOString() })
                setReason(null)
                setPause(null)
                flash('Thanks! Report saved on this phone.')
              }}
            >
              Send report
            </button>
            <button className="btn soft" onClick={() => setPause('menu')}>Back</button>
          </div>
        </>
      )}
    </Modal>
  )

  let screen
  if (s.screen === 'walk') {
    screen = <Walk key={stop.id} stops={route.stops} index={s.index} points={points} onArrive={() => update({ ...s, screen: 'quiz' })} onPause={() => setPause('menu')} />
  } else if (s.screen === 'quiz') {
    screen = (
      <Quiz
        key={stop.id}
        stop={stop}
        index={s.index}
        total={total}
        points={points}
        hinted={s.hinted}
        onHint={() => update({ ...s, hinted: true })}
        onWrong={() => update({ ...s, wrongs: s.wrongs + 1 })}
        onCorrect={() => {
          const result = { id: stop.id, points: stopPoints(s), perfect: isPerfect(s) }
          update({ ...s, screen: 'lesson', results: [...s.results, result] })
        }}
      />
    )
  } else if (s.screen === 'lesson') {
    const last = s.results[s.results.length - 1]
    screen = (
      <Lesson
        lang={route.language}
        localLanguage={route.localLanguage}
        key={stop.id}
        stop={stop}
        index={s.index}
        total={total}
        result={{ earned: last.points, perfect: last.perfect, streak: currentStreak(s.results), points }}
        picked={s.checks[stop.id]}
        spotted={spottedFor(stop.id)}
        onCheck={(o) => answerCheck(stop.id, o)}
        onSpot={(i) => toggleSpot(stop.id, i)}
        actionLabel={isLast ? 'See my badge' : 'Next riddle'}
        onAction={() => {
          if (!isLast) return update({ ...s, screen: 'walk', index: s.index + 1, wrongs: 0, hinted: false })
          const finishedAt = Date.now()
          setBadges(awardBadge({ routeId: route.id, mode: 'solo', stars: starsFor(points, total), points, date: new Date(finishedAt).toISOString() }))
          update({ ...s, screen: 'end', finishedAt })
        }}
      />
    )
  } else if (review !== null) {
    const rs = route.stops[review]
    screen = (
      <Lesson
        lang={route.language}
        localLanguage={route.localLanguage}
        key={rs.id}
        stop={rs}
        index={review}
        total={total}
        picked={s.checks[rs.id]}
        spotted={spottedFor(rs.id)}
        onCheck={(o) => answerCheck(rs.id, o)}
        onSpot={(i) => toggleSpot(rs.id, i)}
        actionLabel="Back to my badge"
        onAction={() => setReview(null)}
        onBack={() => setReview(null)}
      />
    )
  } else {
    screen = (
      <End
        route={route}
        session={s}
        points={points}
        onReview={setReview}
        onHome={() => {
          update(null)
          setAtHome(true)
          goHome()
        }}
      />
    )
  }

  return (
    <>
      {screen}
      {sheet}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}

