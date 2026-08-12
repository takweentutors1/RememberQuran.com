import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { authConfig } from "@/auth.config"
import { validateCredentials } from "@/lib/auth/credentials"
import { getUserByEmail } from "@/lib/firestore/users"
import { checkRateLimit, getClientIp } from "@/lib/rateLimit"

const LOGIN_WINDOW_MS = 15 * 60 * 1000
// IP limit is looser (shared office/NAT IPs, typos) — the per-email limit
// is the real guard against credential stuffing a single account.
const LOGIN_IP_LIMIT = 20
const LOGIN_EMAIL_LIMIT = 10

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
        }
      },
    }),
  ],
})
