import { redirect } from "next/navigation"
import { auth } from "@/auth"
import type { ReactNode } from "react"
import { AccountNav } from "@/components/account/AccountNav"

export const dynamic = "force-dynamic"

/**
 * Account area requires a session. Reading the Quran never uses this layout.
 */
export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account")
  }
  return (
    <div className="site-shell flex flex-col px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-start md:gap-10">
      <AccountNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
