"use client"

import dynamic from "next/dynamic"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useStudyPanel, type StudyView } from "@/context/StudyPanelContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { useIsMobile } from "@/hooks/use-mobile"
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
  "flex size-7 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
  "disabled:opacity-30 disabled:pointer-events-none",
)

/**
 * The shared study panel: bottom sheet on mobile, non-modal side panel on
 * desktop (reader stays scrollable, audio keeps playing). One shell for
 * tafsir, asbab (Context), and word-morphology (Phase 5).
 */
export function StudyPanel() {
  const { target, setView, navigateAyah, close } = useStudyPanel()
  const { chapter } = useSurahContent()
  const isMobile = useIsMobile()

  const open = target !== null
  const ayahNumber = target ? Number(target.verseKey.split(":")[1]) : null
  const versesCount = chapter?.verses_count ?? null

  return (
    <Sheet
      open={open}
      modal={isMobile}
      onOpenChange={(nextOpen, eventDetails) => {
        if (nextOpen) return
        // Desktop panel is non-modal: clicking or focusing the reader must
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
                  {chapter ? `${chapter.name_simple} · ${target.verseKey}` : target.verseKey}
                </SheetTitle>
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
              </div>
              <SheetDescription className="sr-only">
                Study tools for ayah {target.verseKey}
              </SheetDescription>
              {VIEWS.length > 1 && (
                <div className="mt-3 flex items-center gap-1">
                  {VIEWS.map(({ view, label }) => {
                    const disabled =
                      view === "word" && target.wordPosition === undefined
                    return (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setView(view)}
                        disabled={disabled}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-[120ms]",
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
              )}
            </header>

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
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
