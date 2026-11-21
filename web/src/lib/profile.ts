import { load, save } from './storage'

const WELCOME_KEY = 'cq.welcomed'

/** The first-launch screen is shown once per phone. */
export const welcomed = () => load(WELCOME_KEY, false)
export const setWelcomed = () => save(WELCOME_KEY, true)
