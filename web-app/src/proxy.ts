import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/auth.config"

/**
 * Next.js 16 Proxy (formerly Middleware) — optimistic /account gate.
 * Real authorization still happens in account layouts/pages via `auth()`.
 */
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth?.user)
  const isAccount = req.nextUrl.pathname.startsWith("/account")

  if (isAccount && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin)
    login.searchParams.set(
      "next",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    )
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/account/:path*"],
}
