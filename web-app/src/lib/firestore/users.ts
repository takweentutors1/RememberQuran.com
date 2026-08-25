import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"

export interface LastPosition {
  verseKey: string
  surahId: number
  ayahId: number
  updatedAt: Date
}

export interface ActiveGoal {
  type: "pages" | "ayahs"
  target: number
}

export interface Streak {
  currentStreak: number
  longestStreak: number
  lastMetDate: Date | null
}

/** Full user doc shape, including fields never sent to the client. */
export interface UserRecord {
  id: string
  email: string
  /**
   * Legacy bcrypt hash. Kept forever, even for users migrated to Firebase
   * Auth — it's both the fallback verification path for `firebaseUid: null`
   * users (unmigrated stragglers, or accounts flagged as a mobile-app email
   * collision during migration) and the entire rollback story if the
   * Firebase Auth integration ever needs to be reverted.
   */
  passwordHash: string
  /**
   * Firebase Auth uid once this user has been imported/created there —
   * null for accounts not yet migrated, or deliberately left unlinked
   * because the email already had a Firebase Auth account from the mobile
   * app (see the `firebaseUsers` collection / migration script).
   */
  firebaseUid: string | null
  profile: { displayName: string; avatarUrl: string | null }
  roles: string[]
  moderation: { flagged: boolean; suspended: boolean }
  settings: Record<string, unknown>
  lastPosition: LastPosition | null
  emailVerified: Date | null
  /**
   * Bumped on password change AND email change (any credential-equivalent
   * update) — sessions issued before this are revoked.
   */
  passwordChangedAt: Date
  activeGoal: ActiveGoal | null
  streak: Streak
  viewedSurahs: number[]
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_STREAK: Streak = {
  currentStreak: 0,
  longestStreak: 0,
  lastMetDate: null,
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return null
}

function usersCol() {
  return getDb().collection("users")
}

function userEmailsCol() {
  return getDb().collection("userEmails")
}

/** Reverse lookup for Firebase Auth uid → our Firestore user id, mirroring `userEmailsCol()`. */
function firebaseUsersCol() {
  return getDb().collection("firebaseUsers")
}

function fromSnapshot(id: string, data: FirebaseFirestore.DocumentData): UserRecord {
  return {
    id,
    email: data.email,
    passwordHash: data.passwordHash,
    firebaseUid: data.firebaseUid ?? null,
    profile: {
      displayName: data.profile?.displayName ?? "",
      avatarUrl: data.profile?.avatarUrl ?? null,
    },
    roles: Array.isArray(data.roles) ? data.roles : ["user"],
    moderation: {
      flagged: Boolean(data.moderation?.flagged),
      suspended: Boolean(data.moderation?.suspended),
    },
    settings: data.settings ?? {},
    lastPosition: data.lastPosition
      ? {
          verseKey: data.lastPosition.verseKey,
          surahId: data.lastPosition.surahId,
          ayahId: data.lastPosition.ayahId,
          updatedAt: toDate(data.lastPosition.updatedAt) ?? new Date(0),
        }
      : null,
    emailVerified: toDate(data.emailVerified),
    // Accounts created before this field existed fall back to createdAt, so
    // deploying this doesn't retroactively invalidate every existing session.
    passwordChangedAt:
      toDate(data.passwordChangedAt) ?? toDate(data.createdAt) ?? new Date(0),
    activeGoal: data.activeGoal ?? null,
    streak: data.streak
      ? {
          currentStreak: data.streak.currentStreak ?? 0,
          longestStreak: data.streak.longestStreak ?? 0,
          lastMetDate: toDate(data.streak.lastMetDate),
        }
      : DEFAULT_STREAK,
    viewedSurahs: Array.isArray(data.viewedSurahs) ? data.viewedSurahs : [],
    createdAt: toDate(data.createdAt) ?? new Date(0),
    updatedAt: toDate(data.updatedAt) ?? new Date(0),
  }
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const snap = await usersCol().doc(userId).get()
  if (!snap.exists) return null
  return fromSnapshot(snap.id, snap.data()!)
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const emailSnap = await userEmailsCol().doc(email).get()
  const userId = emailSnap.data()?.userId
  if (typeof userId !== "string") return null
  return getUserById(userId)
}

export type CreateUserResult =
  | { ok: true; user: UserRecord }
  | { ok: false; error: "email-taken" }

/**
 * Creates the user doc, the email-uniqueness reservation, and the default
 * "Favourites" bookmark collection atomically. Firestore transactions (unlike
 * the Mongo multi-document transactions this app deliberately avoided) don't
 * have the Atlas serverless hang risk, so doing all three writes in one
 * transaction is the safe default here — no partial-account cleanup needed.
 */
export async function createUser(input: {
  email: string
  passwordHash: string
  firebaseUid: string
  displayName: string
}): Promise<CreateUserResult> {
  const db = getDb()
  const emailRef = userEmailsCol().doc(input.email)
  const userRef = usersCol().doc()
  const favouritesRef = userRef.collection("bookmarkCollections").doc()
  const firebaseUserRef = firebaseUsersCol().doc(input.firebaseUid)

  const result = await db.runTransaction(async (tx) => {
    const emailSnap = await tx.get(emailRef)
    if (emailSnap.exists) return { ok: false as const, error: "email-taken" as const }

    const now = FieldValue.serverTimestamp()
    tx.set(emailRef, { userId: userRef.id })
    tx.set(firebaseUserRef, { userId: userRef.id })
    tx.set(userRef, {
      email: input.email,
      passwordHash: input.passwordHash,
      firebaseUid: input.firebaseUid,
      profile: { displayName: input.displayName, avatarUrl: null },
      roles: ["user"],
      moderation: { flagged: false, suspended: false },
      settings: {},
      lastPosition: null,
      emailVerified: null,
      passwordChangedAt: now,
      activeGoal: null,
      streak: DEFAULT_STREAK,
      viewedSurahs: [],
      createdAt: now,
      updatedAt: now,
    })
    tx.set(favouritesRef, {
      name: "Favourites",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })
    return { ok: true as const }
  })

  if (!result.ok) return result

  const user = await getUserById(userRef.id)
  if (!user) throw new Error("User created but could not be re-read")
  return { ok: true, user }
}

/**
 * Links an already-existing Firestore user doc to a Firebase Auth uid —
 * used by the one-off migration script (`scripts/migrate-users-to-firebase-auth.ts`)
 * for users created before Firebase Auth was wired in. New signups get this
 * relationship set directly by `createUser()` instead.
 */
export async function linkFirebaseUid(
  userId: string,
  firebaseUid: string,
): Promise<void> {
  const db = getDb()
  const userRef = usersCol().doc(userId)
  const firebaseUserRef = firebaseUsersCol().doc(firebaseUid)

  await db.runTransaction(async (tx) => {
    tx.set(firebaseUserRef, { userId })
    tx.update(userRef, {
      firebaseUid,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
}

export type ChangeEmailResult =
  | { ok: true }
  | { ok: false; error: "email-taken" }

export async function changeEmail(
  userId: string,
  newEmail: string,
): Promise<ChangeEmailResult> {
  const db = getDb()
  const userRef = usersCol().doc(userId)
  const newEmailRef = userEmailsCol().doc(newEmail)

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists) throw new Error("User not found")
    const oldEmail = userSnap.data()!.email as string
    if (oldEmail === newEmail) return { ok: true as const }

    const newEmailSnap = await tx.get(newEmailRef)
    if (newEmailSnap.exists) return { ok: false as const, error: "email-taken" as const }

    const oldEmailRef = userEmailsCol().doc(oldEmail)
    tx.delete(oldEmailRef)
    tx.set(newEmailRef, { userId })
    tx.update(userRef, {
      email: newEmail,
      emailVerified: null,
      // Also stamped here (not just on password change): any credential
      // change should force stale sessions — including ones still carrying
      // the old email — to re-fetch identity rather than keep serving cached
      // JWT claims for up to 30 days.
      passwordChangedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return { ok: true as const }
  })
}

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<void> {
  await usersCol().doc(userId).update({
    "profile.displayName": displayName,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

/** Legacy/fallback path only — for `firebaseUid` users, Firebase Auth owns the password. */
export async function updatePasswordHash(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await usersCol().doc(userId).update({
    passwordHash,
    passwordChangedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}

/**
 * Bumps `passwordChangedAt` without touching `passwordHash` — used when
 * Firebase Auth already owns the password change (reset-confirm, settings
 * password change for `firebaseUid` users) but a live NextAuth JWT session
 * still needs to be invalidated.
 */
export async function touchPasswordChangedAt(userId: string): Promise<void> {
  await usersCol().doc(userId).update({
    passwordChangedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function updateLastPosition(
  userId: string,
  position: { verseKey: string; surahId: number; ayahId: number },
): Promise<void> {
  await usersCol()
    .doc(userId)
    .update({
      lastPosition: { ...position, updatedAt: FieldValue.serverTimestamp() },
      updatedAt: FieldValue.serverTimestamp(),
    })
}

