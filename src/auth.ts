import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { authConfig } from "@/auth.config"
import { validateCredentials } from "@/lib/auth/credentials"
import { getUserByEmail, getUserById } from "@/lib/firestore/users"
import { checkRateLimit, getClientIp } from "@/lib/rateLimit"

const LOGIN_WINDOW_MS = 15 * 60 * 1000
// IP limit is looser (shared office/NAT IPs, typos) — the per-email limit
// is the real guard against credential stuffing a single account.
const LOGIN_IP_LIMIT = 20
const LOGIN_EMAIL_LIMIT = 10

// Re-check the session's password freshness against Firestore at most this
// often — every request would work too (Firestore reads are cheap) but
// there's no need to pay that on every single navigation.
const PASSWORD_REVALIDATE_MS = 5 * 60 * 1000

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = await authConfig.callbacks!.jwt!(params)
      if (params.user) return token // just embedded pwChangedAt in the base callback

      if (typeof token.pwChangedAt !== "number" || !token.sub) return token
      const lastChecked = typeof token.pwCheckedAt === "number" ? token.pwCheckedAt : 0
      if (Date.now() - lastChecked < PASSWORD_REVALIDATE_MS) return token

      // A Firestore hiccup here must not break every authenticated page
      // load — fail open and just retry the revalidation next cycle.
      try {
        const current = await getUserById(token.sub)
        if (current && current.passwordChangedAt.getTime() > token.pwChangedAt) {
          token.error = "PasswordChanged"
          return token
        }
        token.pwCheckedAt = Date.now()
      } catch (error) {
        console.error("Password revalidation check failed", error)
      }
      return token
    },
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = validateCredentials(
          credentials.email,
          credentials.password,
        )
        if (!parsed.success) return null

        // A downstream failure (Firestore/rate-limit store unreachable,
        // credential misconfiguration, etc.) must surface as an ordinary
        // "invalid credentials" result, never an unhandled exception —
        // NextAuth's route handler has no try/catch of its own, so an
        // uncaught throw here becomes a raw platform 500 on the login form.
        try {
          // Checked before the (deliberately slow) bcrypt compare so a
          // blocked request doesn't also burn that compute — and before the
          // DB lookup, so hammering nonexistent emails is throttled too.
          const ip = getClientIp(request)
          const [ipCheck, emailCheck] = await Promise.all([
            checkRateLimit(`login:ip:${ip}`, LOGIN_IP_LIMIT, LOGIN_WINDOW_MS),
            checkRateLimit(
              `login:email:${parsed.data.email}`,
              LOGIN_EMAIL_LIMIT,
              LOGIN_WINDOW_MS,
            ),
          ])
          // Same outward result (null → generic "invalid credentials") as a
          // wrong password — an attacker shouldn't be able to distinguish
          // "rate limited" from "wrong password" from the response alone.
          if (!ipCheck.allowed || !emailCheck.allowed) return null

          const user = await getUserByEmail(parsed.data.email)

          if (!user || user.moderation.suspended) return null

          const passwordMatches = await compare(
            parsed.data.password,
            user.passwordHash,
          )
          if (!passwordMatches) return null

          return {
            id: user.id,
            email: user.email,
            name: user.profile.displayName || null,
            roles: user.roles,
            passwordChangedAt: user.passwordChangedAt.getTime(),
          }
        } catch (error) {
          console.error("Login failed", error)
          return null
        }
      },
    }),
  ],
})
