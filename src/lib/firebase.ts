import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _googleProvider: GoogleAuthProvider | null = null

if (isFirebaseConfigured) {
  try {
    _app = initializeApp(firebaseConfig)
    _auth = getAuth(_app)
    _db = getFirestore(_app)
    _googleProvider = new GoogleAuthProvider()
    _googleProvider.setCustomParameters({ prompt: 'select_account' })
  } catch (err) {
    console.error('[phantom] Firebase failed to initialize:', err)
  }
} else {
  console.warn(
    '[phantom] Firebase env vars missing. Auth + Firestore are disabled. ' +
      'Copy .env.example to .env.local and fill in VITE_FIREBASE_* values.',
  )
}

// We assert non-null at the export site for ergonomic call sites; consumers
// that need to handle the unconfigured case should check `isFirebaseConfigured`
// first and avoid touching these. AuthContext already does this.
export const app = _app as FirebaseApp
export const auth = _auth as Auth
export const db = _db as Firestore
export const googleProvider = _googleProvider as GoogleAuthProvider
