"use client"

import dynamic from "next/dynamic"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  useStudyPanel,
  type StudyTarget,
  type StudyView,
} from "@/context/StudyPanelContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { useIsMobile, useIsDesktopColumn } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { StudyPanelSkeleton } from "./StudyPanelSkeleton"

const TafsirView = dynamic(
  () => import("./TafsirView").then((m) => m.TafsirView),
  { loading: () => <StudyPanelSkeleton /> },
)
const AsbabView = dynamic(
  () => import("./AsbabView").then((m) => m.AsbabView),
  { loading: () => <StudyPanelSkeleton /> },
)
const WordDetailView = dynamic(
  () => import("./WordDetailView").then((m) => m.WordDetailView),
  { loading: () => <StudyPanelSkeleton /> },
)

const VIEWS: { view: StudyView; label: string }[] = [
  { view: "tafsir", label: "Tafsir" },
  { view: "asbab", label: "Context" },
  { view: "word", label: "Word" },
]

const navBtn = cn(
  "flex min-h-11 min-w-11 items-center justify-center rounded-md pointer-fine:size-8 pointer-fine:min-h-0 pointer-fine:min-w-0",
  "text-muted-foreground transition-colors duration-(--dur-fast)",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1",
  "disabled:opacity-30 disabled:pointer-events-none",
)

/** Prev/next ayah controls — shared by the overlay (Sheet) and in-flow column layouts. */
function StudyPanelNav({
  ayahNumber,
  versesCount,
  navigateAyah,
}: {
  ayahNumber: number | null
  versesCount: number | null
  navigateAyah: (delta: 1 | -1) => void
}) {
  return (
    <div className="ml-auto flex items-center gap-0.5">
      <button
        type="button"
        title="Previous ayah"
        aria-label="Previous ayah"
        className={navBtn}
        disabled={ayahNumber === null || ayahNumber <= 1}
        onClick={() => navigateAyah(-1)}
      >
        <ChevronLeft className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Next ayah"
        aria-label="Next ayah"
        className={navBtn}
        disabled={
          ayahNumber === null ||
          versesCount === null ||
          ayahNumber >= versesCount
        }
        onClick={() => navigateAyah(1)}
      >
        <ChevronRight className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  )
}

/** Tafsir / Context / Word view switcher — shared by both layouts. */
function StudyPanelTabs({
  target,
  setView,
}: {
  target: StudyTarget
  setView: (view: StudyView) => void
}) {
  if (VIEWS.length <= 1) return null
  return (
    <div className="mt-3 flex items-center gap-1">
      {VIEWS.map(({ view, label }) => {
        const disabled = view === "word" && target.wordPosition === undefined
        return (
          <button
            key={view}
            type="button"
            onClick={() => setView(view)}
            disabled={disabled}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-(--dur-fast)",
              target.view === view
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
              disabled && "pointer-events-none opacity-30",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/** Tafsir/asbab/word content — shared by both layouts. */
function StudyPanelBody({ target }: { target: StudyTarget }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
      {target.view === "tafsir" ? (
        <TafsirView verseKey={target.verseKey} />
      ) : null}
      {target.view === "asbab" ? (
        <AsbabView verseKey={target.verseKey} />
      ) : null}
      {target.view === "word" && target.wordPosition !== undefined ? (
        <WordDetailView
          verseKey={target.verseKey}
          wordPosition={target.wordPosition}
        />
      ) : null}
    </div>
  )
}

/**
 * The shared study panel: bottom sheet on mobile, right-side overlay sheet on
 * tablet — and a real in-flow 300px column at `lg` and up (docs/DESIGN-
 * SYSTEM.md §6: "nav 236px / reader fluid / study panel 300px"). The column
 * is non-modal by construction (it's a normal flex sibling, not a portal) so
 * the reader stays scrollable and audio keeps playing while it's open.
 */
export function StudyPanel() {
  const { target, setView, navigateAyah, close } = useStudyPanel()
  const { chapter } = useSurahContent()
  const isMobile = useIsMobile()
  const isDesktopColumn = useIsDesktopColumn()

  const open = target !== null
  const ayahNumber = target ? Number(target.verseKey.split(":")[1]) : null
  const versesCount = chapter?.verses_count ?? null
  const titleLabel = target
    ? chapter
      ? `${chapter.name_simple} · ${target.verseKey}`
      : target.verseKey
    : ""

  if (isDesktopColumn) {
    return (
      <aside
        aria-label="Study panel"
        data-state={open ? "open" : "closed"}
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden border-l border-border bg-popover lg:flex",
          "sticky top-14 h-[calc(100dvh-3.5rem)]",
          "transition-[width,border-color] duration-(--dur-base) ease-(--ease-out)",
          open ? "w-[300px]" : "w-0 border-l-transparent",
        )}
      >
        <div
          className={cn(
            "flex h-full min-h-0 w-[300px] flex-col",
            "transition-opacity duration-(--dur-fast)",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {target && (
            <>
              <header className="border-b border-border px-4 pt-4 pb-3">
                <div className="flex items-center gap-1">
                  <h2 className="min-w-0 truncate font-heading text-base font-medium text-foreground">
                    {titleLabel}
                  </h2>
                  <StudyPanelNav
                    ayahNumber={ayahNumber}
                    versesCount={versesCount}
                    navigateAyah={navigateAyah}
                  />
                  <button
                    type="button"
                    aria-label="Close study panel"
                    className={cn(navBtn, "shrink-0")}
                    onClick={close}
                  >
                    <X className="size-4" strokeWidth={1.75} />
                  </button>
                </div>
                <StudyPanelTabs target={target} setView={setView} />
              </header>
              <StudyPanelBody target={target} />
            </>
          )}
        </div>
      </aside>
    )
  }

  return (
    <Sheet
      open={open}
      modal={isMobile}
      onOpenChange={(nextOpen, eventDetails) => {
        if (nextOpen) return
        // Tablet panel is non-modal: clicking or focusing the reader must
        // not dismiss it — only Escape / the close button do.
        if (
          !isMobile &&
          (eventDetails.reason === "outside-press" ||
            eventDetails.reason === "focus-out")
        ) {
          return
        }
        close()
      }}
    >
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showOverlay={isMobile}
        aria-label="Study panel"
        className={cn(
          "gap-0",
          isMobile
            ? "max-h-[75dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            : "data-[side=right]:sm:max-w-lg",
        )}
      >
        {target && (
          <>
            <header className="border-b border-border px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 pr-9">
                <SheetTitle className="min-w-0 truncate">
                  {titleLabel}
                </SheetTitle>
                <StudyPanelNav
                  ayahNumber={ayahNumber}
                  versesCount={versesCount}
                  navigateAyah={navigateAyah}
                />
              </div>
              <SheetDescription className="sr-only">
                Study tools for ayah {target.verseKey}
              </SheetDescription>
              <StudyPanelTabs target={target} setView={setView} />
            </header>
            <StudyPanelBody target={target} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
