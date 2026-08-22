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
  passwordHash: string
  profile: { displayName: string; avatarUrl: string | null }
  roles: string[]
  moderation: { flagged: boolean; suspended: boolean }
  settings: Record<string, unknown>
  lastPosition: LastPosition | null
  emailVerified: Date | null
  passwordResetToken: string | null
  passwordResetExpires: Date | null
  passwordResetRequestedAt: Date | null
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

function resetTokensCol() {
  return getDb().collection("passwordResetTokens")
}

function fromSnapshot(id: string, data: FirebaseFirestore.DocumentData): UserRecord {
  return {
    id,
    email: data.email,
    passwordHash: data.passwordHash,
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
    passwordResetToken: data.passwordResetToken ?? null,
    passwordResetExpires: toDate(data.passwordResetExpires),
    passwordResetRequestedAt: toDate(data.passwordResetRequestedAt),
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
  displayName: string
}): Promise<CreateUserResult> {
  const db = getDb()
  const emailRef = userEmailsCol().doc(input.email)
  const userRef = usersCol().doc()
  const favouritesRef = userRef.collection("bookmarkCollections").doc()

  const result = await db.runTransaction(async (tx) => {
    const emailSnap = await tx.get(emailRef)
    if (emailSnap.exists) return { ok: false as const, error: "email-taken" as const }

    const now = FieldValue.serverTimestamp()
    tx.set(emailRef, { userId: userRef.id })
    tx.set(userRef, {
      email: input.email,
      passwordHash: input.passwordHash,
      profile: { displayName: input.displayName, avatarUrl: null },
      roles: ["user"],
      moderation: { flagged: false, suspended: false },
      settings: {},
      lastPosition: null,
      emailVerified: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordResetRequestedAt: null,
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

export async function updatePasswordHash(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await clearPasswordResetInternal(userId)
  await usersCol().doc(userId).update({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpires: null,
    passwordResetRequestedAt: null,
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

/**
 * Reset tokens get their own top-level lookup collection keyed by the token
 * hash itself — an O(1) `get()` by document id instead of a Firestore query
 * (which would need a composite index on token + expiry). Only one token is
 * ever valid per user, mirroring the old single-field-overwrite behaviour.
 */
export async function setPasswordResetToken(
  userId: string,
  input: { tokenHash: string; expires: Date; requestedAt: Date },
): Promise<void> {
  const db = getDb()
  const userRef = usersCol().doc(userId)
  const newTokenRef = resetTokensCol().doc(input.tokenHash)

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    const prevHash = userSnap.data()?.passwordResetToken as string | undefined
    if (prevHash) tx.delete(resetTokensCol().doc(prevHash))

    tx.set(newTokenRef, { userId, expires: input.expires })
    tx.update(userRef, {
      passwordResetToken: input.tokenHash,
      passwordResetExpires: input.expires,
      passwordResetRequestedAt: input.requestedAt,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
}

/** Resolves a reset token to a user, checking expiry — null if invalid/expired. */
export async function getUserByResetToken(
  tokenHash: string,
): Promise<UserRecord | null> {
  const tokenSnap = await resetTokensCol().doc(tokenHash).get()
  const data = tokenSnap.data()
  if (!data) return null

  const expires = toDate(data.expires)
  if (!expires || expires.getTime() <= Date.now()) return null

  const user = await getUserById(data.userId as string)
  if (!user || user.passwordResetToken !== tokenHash) return null
  return user
}

async function clearPasswordResetInternal(userId: string): Promise<void> {
  const userRef = usersCol().doc(userId)
  const snap = await userRef.get()
  const hash = snap.data()?.passwordResetToken as string | undefined
  if (hash) await resetTokensCol().doc(hash).delete()
}

/** Invalidates any outstanding reset token without touching the password — used when the reset email fails to send. */
export async function clearPasswordResetToken(userId: string): Promise<void> {
  await clearPasswordResetInternal(userId)
  await usersCol().doc(userId).update({
    passwordResetToken: null,
    passwordResetExpires: null,
    passwordResetRequestedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  })
}
