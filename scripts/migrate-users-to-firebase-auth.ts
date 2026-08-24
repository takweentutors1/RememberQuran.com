/**
 * One-off migration: import existing web users' bcrypt password hashes into
 * Firebase Auth, so `authorize()` and the password-reset flow can move onto
 * Firebase (see the "Migrate password verification + reset email to
 * Firebase Auth" plan). Run manually — this is never invoked automatically.
 *
 *   pnpm migrate:firebase-auth [--dry-run]
 *
 * Safe to re-run: any user doc that already has `firebaseUid` set is
 * skipped. Any email that already has a Firebase Auth account (created by
 * the mobile app, which uses Firebase Auth directly) is detected, skipped,
 * and logged for manual review — never overwritten or merged automatically.
 * Those accounts keep working via the bcrypt fallback in
 * `src/lib/auth/firebase-credentials.ts` until reconciled by hand.
 *
 * Before running against production: run against the Auth emulator first
 * (`pnpm firebase:emulators`, then `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 * FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 pnpm migrate:firebase-auth`), then a
 * single real canary account, and confirm that account can log in via the
 * new Firebase path in production before running the full batch.
 */
import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

for (const file of [".env", ".env.local"]) {
  if (existsSync(file)) process.loadEnvFile(file)
}

// Imports below must come after env vars are loaded.
const { getAdminAuth, getDb } = await import("../src/lib/firestore/admin")
const { linkFirebaseUid } = await import("../src/lib/firestore/users")

const IMPORT_BATCH_SIZE = 1000

interface CollisionRecord {
  email: string
  webUserId: string
  existingFirebaseUid: string
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  console.log(`Starting migration${dryRun ? " (dry run — no writes)" : ""}...`)

  const db = getDb()
  const auth = getAdminAuth()
  const usersSnap = await db.collection("users").get()
  console.log(`Found ${usersSnap.size} user docs.`)

  let alreadyMigrated = 0
  const toImport: { uid: string; userId: string; email: string; passwordHash: string }[] = []
  const collisions: CollisionRecord[] = []
  const errors: { userId: string; email: string; error: string }[] = []

  for (const doc of usersSnap.docs) {
    const data = doc.data()
    const userId = doc.id
    const email = data.email as string | undefined
    const passwordHash = data.passwordHash as string | undefined

    if (data.firebaseUid) {
      alreadyMigrated++
      continue
    }
    if (!email || !passwordHash) {
      errors.push({ userId, email: email ?? "(missing)", error: "missing email or passwordHash" })
      continue
    }

    try {
      const existing = await auth.getUserByEmail(email)
      collisions.push({ email, webUserId: userId, existingFirebaseUid: existing.uid })
    } catch (error) {
      if (isUserNotFound(error)) {
        toImport.push({ uid: randomUUID(), userId, email, passwordHash })
      } else {
        errors.push({ userId, email, error: String(error) })
      }
    }
  }

  console.log(
    `Classified: ${toImport.length} to import, ${collisions.length} collisions (skipped), ` +
      `${alreadyMigrated} already migrated, ${errors.length} errors.`,
  )

  let imported = 0
  if (!dryRun) {
    for (let i = 0; i < toImport.length; i += IMPORT_BATCH_SIZE) {
      const batch = toImport.slice(i, i + IMPORT_BATCH_SIZE)
      const result = await auth.importUsers(
        batch.map((u) => ({
          uid: u.uid,
          email: u.email,
          emailVerified: false,
          passwordHash: Buffer.from(u.passwordHash, "utf8"),
        })),
        { hash: { algorithm: "BCRYPT" } },
      )

      for (const failure of result.errors) {
        const failed = batch[failure.index]
        errors.push({
          userId: failed.userId,
          email: failed.email,
          error: `importUsers: ${failure.error.message}`,
        })
      }

      const succeeded = batch.filter((_, index) =>
        !result.errors.some((e) => e.index === index),
      )
      for (const user of succeeded) {
        try {
          await linkFirebaseUid(user.userId, user.uid)
          imported++
          console.log(`  imported + linked: ${user.email} -> ${user.uid}`)
        } catch (error) {
          errors.push({
            userId: user.userId,
            email: user.email,
            error: `linkFirebaseUid failed after import: ${String(error)}`,
          })
        }
      }
    }
  }

  const reportDir = path.join(process.cwd(), "scripts", "reports")
  mkdirSync(reportDir, { recursive: true })
  const reportPath = path.join(reportDir, `migration-${Date.now()}${dryRun ? "-dry-run" : ""}.json`)
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        dryRun,
        totals: {
          totalUsers: usersSnap.size,
          alreadyMigrated,
          imported: dryRun ? 0 : imported,
          wouldImport: dryRun ? toImport.length : undefined,
          collisions: collisions.length,
          errors: errors.length,
        },
        collisions,
        errors,
      },
      null,
      2,
    ),
  )

  console.log(`\nDone. Report written to ${reportPath}`)
  console.log(
    `  ${dryRun ? "would import" : "imported"}: ${dryRun ? toImport.length : imported}`,
  )
  console.log(`  collisions (needs manual review): ${collisions.length}`)
  console.log(`  errors: ${errors.length}`)
  if (collisions.length > 0) {
    console.log(
      "\nCollisions mean these emails already have a Firebase Auth account (from the mobile " +
        "app). Those web accounts were left untouched and keep working via the bcrypt fallback " +
        "— reconcile them manually.",
    )
  }
}

function isUserNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "auth/user-not-found"
  )
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error("Migration script failed:", error)
    process.exit(1)
  },
)
