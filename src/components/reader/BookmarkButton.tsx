"use client"

import { useState, type FormEvent } from "react"
import { Bookmark, Loader2, Plus, Star } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "next-auth/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useBookmarks } from "@/context/BookmarksContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  verseKey: string
  className?: string
  iconClassName?: string
}

const SPARK_COUNT = 6

/** Six dots radiating outward in a ring, precomputed once. */
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (i / SPARK_COUNT) * Math.PI * 2
  return { x: Math.cos(angle) * 16, y: Math.sin(angle) * 16 }
})

function BookmarkIcon({
  saved,
  sparking,
  sparkId,
  iconClassName,
}: {
  saved: boolean
  sparking: boolean
  sparkId: number
  iconClassName?: string
}) {
  return (
    <>
      <motion.span
        className="flex"
        animate={sparking ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Bookmark
          className={iconClassName}
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
        />
      </motion.span>

      <AnimatePresence>
        {sparking && (
          <span
            key={sparkId}
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {SPARKS.map((spark, i) => (
              <motion.span
                key={i}
                className="absolute size-1 rounded-full bg-gold-leaf"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: spark.x, y: spark.y, opacity: 0, scale: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Bookmark toggle for one ayah, with a "save to…" collection picker —
 * previously every save landed in Favourites with no way to choose, which is
 * the gap reported both here and in the mobile app.
 *
 * Saving is a two-step affordance kept deliberately cheap for the common
 * case: tapping an *unsaved* ayah opens a small popover to pick the
 * collection (Favourites is always the first option, one tap away). Tapping
 * an already-saved ayah just removes it — no popover, matching the muscle
 * memory the icon already had.
 */
export function BookmarkButton({
  verseKey,
  className,
  iconClassName,
}: BookmarkButtonProps) {
  const { data: session, status } = useSession()
  const { requireAuth } = useSoftGate()
  const { loaded, collections, isBookmarked, isPending, toggle, saveTo, createCollection } =
    useBookmarks()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [busy, setBusy] = useState(false)
  const [sparkId, setSparkId] = useState(0)
  const [sparking, setSparking] = useState(false)

  const saved = isBookmarked(verseKey)
  const pending = isPending(verseKey)
  const signedIn = Boolean(session?.user)
  // Signed-in users wait for their keys so toggle knows save vs remove
  const waitingForKeys = signedIn && !loaded

  function fireSpark() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setSparkId((id) => id + 1)
    setSparking(true)
    setTimeout(() => setSparking(false), 650)
  }

  function handleRemoveClick() {
    if (status === "loading" || waitingForKeys) return
    if (!session?.user) {
      requireAuth("bookmark")
      return
    }
    void toggle(verseKey)
  }

  async function handleSaveToCollection(collectionId: string) {
    setBusy(true)
    const ok = await saveTo(verseKey, collectionId)
    setBusy(false)
    if (ok) {
      setOpen(false)
      setCreating(false)
      setNewName("")
      fireSpark()
    }
  }

  async function handleCreateAndSave(event: FormEvent) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    const collection = await createCollection(name)
    if (collection) {
      await handleSaveToCollection(collection.id)
    } else {
      setBusy(false)
    }
  }

  // Already saved, not signed in, or still loading: a plain button, no
  // picker — clicking removes the bookmark (or opens the soft-gate for a
  // guest, same as before).
  if (saved || !signedIn || status === "loading") {
    return (
      <button
        type="button"
        title={saved ? "Remove bookmark" : "Bookmark"}
        aria-label={saved ? `Remove bookmark ${verseKey}` : `Bookmark ${verseKey}`}
        aria-pressed={saved}
        disabled={pending || waitingForKeys}
        onClick={handleRemoveClick}
        className={cn(className, "relative", saved && "text-primary hover:text-primary")}
      >
        <BookmarkIcon saved={saved} sparking={sparking} sparkId={sparkId} iconClassName={iconClassName} />
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title="Bookmark"
        aria-label={`Bookmark ${verseKey}`}
        aria-pressed={false}
        disabled={pending || waitingForKeys}
        className={cn(className, "relative")}
      >
        <BookmarkIcon saved={false} sparking={sparking} sparkId={sparkId} iconClassName={iconClassName} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
          Save {verseKey} to
        </p>
        <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              disabled={busy}
              onClick={() => void handleSaveToCollection(collection.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                "transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {collection.isDefault && (
                <Star className="size-3 shrink-0 fill-primary text-primary" strokeWidth={1.75} />
              )}
              <span className="min-w-0 flex-1 truncate">{collection.name}</span>
              {busy && <Loader2 className="size-3 shrink-0 animate-spin" strokeWidth={2} />}
            </button>
          ))}
        </div>

        <div className="mt-1 border-t border-border pt-1.5">
          {creating ? (
            <form onSubmit={handleCreateAndSave} className="flex gap-1.5">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                maxLength={80}
                autoFocus
                disabled={busy}
                className="h-7 text-xs"
              />
              <button
                type="submit"
                disabled={busy || !newName.trim()}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium",
                  "bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                Add
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground",
                "transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Plus className="size-3.5" strokeWidth={1.75} />
              New collection
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
