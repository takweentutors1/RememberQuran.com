import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe Auth.js config (no Mongoose / bcrypt).
 * Used by `proxy.ts` for optimistic /account redirects.
 * Full Credentials provider lives in `src/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAccount = request.nextUrl.pathname.startsWith("/account")
      if (isAccount) return Boolean(auth?.user)
      return true
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id
        token.roles = user.roles
        token.pwChangedAt =
          typeof user.passwordChangedAt === "number" ? user.passwordChangedAt : null
        token.pwCheckedAt = Date.now()
        delete token.error
      }
      if (
        trigger === "update" &&
        session &&
        typeof session.name === "string"
      ) {
        token.name = session.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        // A stale/pre-password-change session — real revalidation happens
        // Node-side in src/auth.ts (Firestore isn't reachable from edge);
        // this just honours whatever that check already flagged on the token.
        if (token.error === "PasswordChanged") {
          session.user.id = ""
          session.user.roles = []
          return session
        }
        session.user.id = token.sub
        session.user.name = token.name ?? null
        session.user.roles = Array.isArray(token.roles)
          ? token.roles.filter((role): role is string => typeof role === "string")
          : []
      }
      return session
    },
  },
  trustHost: true,
} satisfies NextAuthConfig
