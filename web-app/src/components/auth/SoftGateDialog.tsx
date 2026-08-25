"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSoftGate } from "@/context/SoftGateContext"
import { cn } from "@/lib/utils"
import { softGateCopy } from "@/lib/auth/safe-next"

export function SoftGateDialog() {
  const { state, close } = useSoftGate()
  const copy = softGateCopy(state.reason)

  return (
    <Dialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <BookOpen className="size-4" strokeWidth={1.75} />
            <span className="text-xs font-medium tracking-wide">RememberQuran</span>
          </div>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={`/login?next=${encodeURIComponent(state.nextPath)}`}
            onClick={close}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
          >
            Sign in
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(state.nextPath)}`}
            onClick={close}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            Create account
          </Link>
          <button
            type="button"
            onClick={close}
            className="mt-1 py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Not now — keep reading
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
