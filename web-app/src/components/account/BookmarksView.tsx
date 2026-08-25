"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  Bookmark,
  Check,
  ChevronRight,
  FolderInput,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useBookmarks } from "@/context/BookmarksContext"
import { cn } from "@/lib/utils"

export interface CollectionDto {
  id: string
  name: string
  isDefault: boolean
}

export interface BookmarkDto {
  verseKey: string
  surahId: number
  ayahId: number
  collectionId: string
  surahName: string
  surahArabic: string
}

const iconBtn = cn(
  "flex size-7 items-center justify-center rounded-md",
  "text-muted-foreground/60 transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-30",
)

async function api(
  method: "POST" | "PATCH" | "DELETE",
  endpoint: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }> {
  try {
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    return {
      ok: res.ok,
      error: typeof data.error === "string" ? data.error : undefined,
      data,
    }
  } catch {
    return { ok: false }
  }
}

export function BookmarksView({
  initialCollections,
  initialBookmarks,
}: {
  initialCollections: CollectionDto[]
  initialBookmarks: BookmarkDto[]
}) {
  const { refresh } = useBookmarks()
  const [collections, setCollections] = useState(initialCollections)
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [newName, setNewName] = useState("")

  const byCollection = useMemo(() => {
    const map = new Map<string, BookmarkDto[]>()
    for (const b of bookmarks) {
      const list = map.get(b.collectionId)
      if (list) list.push(b)
      else map.set(b.collectionId, [b])
    }
    return map
  }, [bookmarks])

  const favourites = collections.find((c) => c.isDefault) ?? null

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null)
    setBusy(true)
    const result = await action()
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.")
    }
    setBusy(false)
    return result.ok
  }

  async function createCollection(event: FormEvent) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    await run(async () => {
      const result = await api("POST", "/api/account/collections", { name })
      if (result.ok) {
        const created = result.data?.collection as CollectionDto | undefined
        if (created) setCollections((prev) => [...prev, created])
        setNewName("")
      }
      return result
    })
  }

  async function renameCollection(id: string, name: string) {
    return run(async () => {
      const result = await api("PATCH", "/api/account/collections", { id, name })
      if (result.ok) {
        setCollections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name } : c)),
        )
      }
      return result
    })
  }

  async function deleteCollection(id: string) {
    const favouritesId = favourites?.id
    await run(async () => {
      const result = await api("DELETE", "/api/account/collections", { id })
      if (result.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id))
        if (favouritesId) {
          setBookmarks((prev) =>
            prev.map((b) =>
              b.collectionId === id ? { ...b, collectionId: favouritesId } : b,
            ),
          )
        }
      }
      return result
    })
  }

  async function removeBookmark(verseKey: string) {
    await run(async () => {
      const result = await api("DELETE", "/api/account/bookmarks", { verseKey })
      if (result.ok) {
        setBookmarks((prev) => prev.filter((b) => b.verseKey !== verseKey))
        void refresh() // keep reader icons in sync
      }
      return result
    })
  }

  async function moveBookmark(verseKey: string, collectionId: string) {
    await run(async () => {
      const result = await api("PATCH", "/api/account/bookmarks", {
        verseKey,
        collectionId,
      })
      if (result.ok) {
        setBookmarks((prev) =>
          prev.map((b) => (b.verseKey === verseKey ? { ...b, collectionId } : b)),
        )
      }
      return result
    })
  }

  // Collections should always include Favourites (seeded on this page). If
  // somehow empty, still show the create form + empty state — never a hard wall.
  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <form onSubmit={createCollection} className="mb-7 flex gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New collection — e.g. Memorisation"
          maxLength={80}
          aria-label="New collection name"
          className="h-9 max-w-xs"
          disabled={busy}
        />
        <Button
          type="submit"
          variant="outline"
          className="h-9"
          disabled={busy || !newName.trim()}
        >
          <Plus data-icon="inline-start" className="size-3.5" />
          Create
        </Button>
      </form>

      {collections.length === 0 && (
        <p className="mb-7 border-y border-border py-8 text-center text-sm text-muted-foreground">
          No collections yet. Create one above to organise your bookmarks.
        </p>
      )}

      {bookmarks.length === 0 && (
        <div className="border-y border-border py-14 text-center">
          <Bookmark
            className="mx-auto size-5 text-muted-foreground/50"
            strokeWidth={1.5}
          />
          <p className="mt-3 text-sm font-medium">No bookmarks yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Tap the bookmark icon next to any ayah while reading and it will
            appear here.
          </p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
          >
            Start reading
          </Link>
        </div>
      )}

      <div className="space-y-9">
        {collections.map((collection) => (
          <CollectionSection
            key={collection.id}
            collection={collection}
            collections={collections}
            items={byCollection.get(collection.id) ?? []}
            busy={busy}
            hideWhenEmpty={bookmarks.length === 0}
            onRename={renameCollection}
            onDelete={deleteCollection}
            onRemoveBookmark={removeBookmark}
            onMoveBookmark={moveBookmark}
          />
        ))}
      </div>
    </div>
  )
}

function CollectionSection({
  collection,
  collections,
  items,
  busy,
  hideWhenEmpty,
  onRename,
  onDelete,
  onRemoveBookmark,
  onMoveBookmark,
}: {
  collection: CollectionDto
  collections: CollectionDto[]
  items: BookmarkDto[]
  busy: boolean
  hideWhenEmpty: boolean
  onRename: (id: string, name: string) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
  onRemoveBookmark: (verseKey: string) => Promise<void>
  onMoveBookmark: (verseKey: string, collectionId: string) => Promise<void>
}) {
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(collection.name)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // With zero bookmarks the global empty state carries the page — only the
  // custom (deletable) folders still need a row so they can be managed
  if (hideWhenEmpty && collection.isDefault) return null

  async function saveRename(event: FormEvent) {
    event.preventDefault()
    const name = draftName.trim()
    if (!name || name === collection.name) {
      setRenaming(false)
      setDraftName(collection.name)
      return
    }
    const ok = await onRename(collection.id, name)
    if (ok) setRenaming(false)
  }

  const otherCollections = collections.filter((c) => c.id !== collection.id)

  return (
    <section aria-label={collection.name}>
      <div className="flex min-h-9 items-center justify-between gap-3 border-b border-border pb-2">
        {renaming ? (
          <form onSubmit={saveRename} className="flex flex-1 items-center gap-2">
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={80}
              autoFocus
              aria-label={`Rename ${collection.name}`}
              className="h-8 max-w-55"
              disabled={busy}
            />
            <button
              type="submit"
              title="Save name"
              aria-label="Save name"
              className={iconBtn}
              disabled={busy}
            >
              <Check className="size-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              title="Cancel"
              aria-label="Cancel"
              className={iconBtn}
              onClick={() => {
                setRenaming(false)
                setDraftName(collection.name)
              }}
            >
              <X className="size-3.5" strokeWidth={1.75} />
            </button>
          </form>
        ) : (
          <h2 className="flex items-center gap-2 font-serif text-lg font-medium">
            {collection.isDefault && (
              <Star
                className="size-3.5 fill-primary text-primary"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            )}
            {collection.name}
            <span className="text-xs font-normal text-muted-foreground">
              {items.length}
            </span>
          </h2>
        )}

        {!collection.isDefault && !renaming && (
          <div className="flex items-center gap-0.5">
            {confirmingDelete ? (
              <>
                <span className="mr-1 text-xs text-muted-foreground">
                  {items.length > 0
                    ? `Move ${items.length} to Favourites and delete?`
                    : "Delete this collection?"}
                </span>
                <Button
                  variant="destructive"
                  size="xs"
                  disabled={busy}
                  onClick={() => {
                    setConfirmingDelete(false)
                    void onDelete(collection.id)
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  title="Rename collection"
                  aria-label="Rename collection"
                  className={iconBtn}
                  disabled={busy}
                  onClick={() => setRenaming(true)}
                >
                  <Pencil className="size-3.5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  title="Delete collection"
                  aria-label="Delete collection"
                  className={iconBtn}
                  disabled={busy}
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No ayahs in this collection yet.
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {items.map((bookmark) => (
            <li
              key={bookmark.verseKey}
              className="group flex items-center gap-1"
            >
              <Link
                href={`/${bookmark.surahId}/${bookmark.ayahId}`}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 py-3 transition-colors",
                  "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <span className="w-14 shrink-0 text-sm text-primary tabular-nums">
                  {bookmark.verseKey}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {bookmark.surahName}
                  <span className="ml-2 text-xs text-muted-foreground">
                    Ayah {bookmark.ayahId}
                  </span>
                </span>
                {bookmark.surahArabic && (
                  <span
                    lang="ar"
                    dir="rtl"
                    className="hidden shrink-0 font-arabic text-base text-muted-foreground sm:block"
                  >
                    {bookmark.surahArabic}
                  </span>
                )}
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground/40"
                  strokeWidth={1.75}
                />
              </Link>
              {otherCollections.length > 0 && (
                <MoveMenu
                  targets={otherCollections}
                  busy={busy}
                  onMove={(collectionId) =>
                    onMoveBookmark(bookmark.verseKey, collectionId)
                  }
                />
              )}
              <button
                type="button"
                title={`Remove bookmark ${bookmark.verseKey}`}
                aria-label={`Remove bookmark ${bookmark.verseKey}`}
                className={iconBtn}
                disabled={busy}
                onClick={() => void onRemoveBookmark(bookmark.verseKey)}
              >
                <X className="size-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function MoveMenu({
  targets,
  busy,
  onMove,
}: {
  targets: CollectionDto[]
  busy: boolean
  onMove: (collectionId: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title="Move to collection"
        aria-label="Move to collection"
        disabled={busy}
        className={iconBtn}
      >
        <FolderInput className="size-3.5" strokeWidth={1.75} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-1.5">
        <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
          Move to
        </p>
        <div className="flex flex-col">
          {targets.map((target) => (
            <button
              key={target.id}
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                "transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              onClick={() => {
                setOpen(false)
                onMove(target.id)
              }}
            >
              {target.isDefault && (
                <Star
                  className="size-3 fill-primary text-primary"
                  strokeWidth={1.75}
                />
              )}
              <span className="truncate">{target.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
