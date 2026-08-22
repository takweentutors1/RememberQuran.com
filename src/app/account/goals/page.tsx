import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  GoalsView,
  type GoalsSnapshot,
} from "@/components/account/GoalsView"
import { evaluateGoalAndStreak } from "@/lib/firestore/goals"
import { getRequestTimeZone } from "@/lib/progress/serverTimezone"

export const metadata: Metadata = {
  title: "Goals & streaks",
}

export const dynamic = "force-dynamic"

export default async function GoalsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/goals")
  }

  const snapshot = (await evaluateGoalAndStreak(
    session.user.id,
    await getRequestTimeZone(),
  )) as GoalsSnapshot

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Goals & streaks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set a simple daily reading goal. Meet it to keep your streak — keep
          it light.
        </p>
      </div>

      <GoalsView initial={snapshot} />
    </div>
  )
}
