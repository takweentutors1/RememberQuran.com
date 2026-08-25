import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

/**
 * Next.js (especially `next dev` + serverless) can reload modules and
 * re-initialize the Admin SDK many times. Cache the app on `globalThis` so
 * hot reloads reuse one instance — same pattern the old Mongoose db.ts used.
 */
declare global {
  var firebaseAdminApp: App | undefined
}

function buildApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()

  // FIRESTORE_EMULATOR_HOST short-circuits the Admin SDK straight to the
  // local emulator regardless of credentials — only a project id is needed,
  // and any string works since the emulator never validates it.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: projectId || "demo-rememberquran" })
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL " +
        "and FIREBASE_PRIVATE_KEY in .env (see .env.example), or set " +
        "FIRESTORE_EMULATOR_HOST to develop against the local emulator instead.",
    )
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // .env stores the key with literal "\n" sequences — unescape them.
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  })
}

function getApp(): App {
  if (!globalThis.firebaseAdminApp) {
    globalThis.firebaseAdminApp = buildApp()
  }
  return globalThis.firebaseAdminApp
}

let cachedDb: Firestore | null = null

/** Firestore handle — safe to call from every Route Handler. */
export function getDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getApp())
  }
  return cachedDb
}

let cachedAuth: Auth | null = null

/** Firebase Auth Admin handle — same cached `App` as `getDb()`. */
export function getAdminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getApp())
  }
  return cachedAuth
}
