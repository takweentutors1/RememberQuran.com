import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    roles: string[]
    passwordChangedAt?: number | null
  }

  interface Session {
    user: {
      id: string
      roles: string[]
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[]
    /** Epoch ms of the user's passwordChangedAt at the time this token was issued. */
    pwChangedAt?: number | null
    /** Epoch ms this token's password freshness was last verified against Firestore. */
    pwCheckedAt?: number
    error?: "PasswordChanged"
  }
}
