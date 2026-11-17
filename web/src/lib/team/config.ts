import type { FirebaseOptions } from 'firebase/app'

/**
 * Firebase web config (safe to publish: access is controlled by the database rules).
 * While this is null, Together mode runs on the local stand-in (tabs on one device).
 */
export const firebaseConfig: FirebaseOptions | null = null
