"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Play,
  Pause,
  Loader2,
  Settings2,
  Maximize,
  Minimize,
  Focus,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useUI } from "@/context/UIContext"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { useChapterMeta } from "@/context/ChaptersContext"
import { ReaderSettingsPanel } from "./ReaderSettingsPanel"
import { SurahPickerTrigger } from "./SurahPickerTrigger"
import { cn } from "@/lib/utils"

const iconBtn = cn(
  "icon-press flex size-8 items-center justify-center rounded-md",
  "text-muted-foreground hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:opacity-30 disabled:pointer-events-none",
)

function parseSurahId(pathname: string): number | null {
  const match = pathname.match(/^\/(\d+)(?:\/|$)/)
  if (!match) return null
  const id = Number(match[1])
  return id >= 1 && id <= 114 ? id : null
}

export function ReaderControls() {
  const pathname = usePathname()
  const {
    mobileNavOpen,
    setMobileNavOpen,
    sidebarOpen,
    toggleSidebar,
    focusMode,
    toggleFocusMode,
  } = useUI()
  const { chapter, pendingSurahId, isLoading } = useSurahContent()
  const player = useAudioPlayer()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const toolbarId = pendingSurahId ?? chapter?.id ?? parseSurahId(pathname)
  const toolbarChapter = useChapterMeta(toolbarId)

  const isThisChapter = toolbarId != null && player.chapterId === toolbarId
  const isPlayingThis = isThisChapter && player.status === "playing"
  const isLoadingThis = isThisChapter && player.status === "loading"

  function handlePlaySurah() {
    if (!toolbarId) return
    if (isThisChapter && (player.status === "playing" || player.status === "paused")) {
      player.togglePlayPause()
    } else {
      player.playChapter(toolbarId)
    }
  }

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  if (!toolbarChapter) return null

  function toggleSurahNav() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      toggleSidebar()
    } else {
      setMobileNavOpen(!mobileNavOpen)
    }
  }

  const pickerExpanded = sidebarOpen || mobileNavOpen

  return (
    <>
      <div
        className={cn(
          "sticky z-30 border-b border-border/50 bg-background/98 backdrop-blur-sm",
          "transition-[top] duration-200 ease-out",
          focusMode ? "top-0" : "top-14",
        )}
      >
        <div className="flex h-11 items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-0.5">
            <SurahPickerTrigger
              chapter={toolbarChapter}
              expanded={pickerExpanded}
              isLoading={isLoading}
              onClick={toggleSurahNav}
              className="max-w-[min(100%,14rem)] sm:max-w-none md:group-data-[sidebar=open]:hidden"
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              title={isPlayingThis ? "Pause" : "Play surah"}
              aria-label={isPlayingThis ? "Pause" : "Play surah"}
              onClick={handlePlaySurah}
              className={cn(iconBtn, isPlayingThis && "text-primary")}
            >
              {isLoadingThis ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
              ) : isPlayingThis ? (
                <Pause className="size-4" strokeWidth={1.75} />
              ) : (
                <Play className="size-4" strokeWidth={1.75} />
              )}
            </button>

            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
              className={iconBtn}
            >
              <Settings2 className="size-4" strokeWidth={1.75} />
            </button>

            <div className="mx-1 hidden h-4 w-px bg-border/50 sm:block" aria-hidden="true" />

            <button
              type="button"
              title={focusMode ? "Exit focus mode" : "Focus mode"}
              aria-label={focusMode ? "Exit focus mode" : "Focus mode"}
              aria-pressed={focusMode}
              onClick={toggleFocusMode}
              className={cn(iconBtn, focusMode && "text-primary")}
            >
              <Focus className="size-4" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
              className={cn(iconBtn, "hidden sm:flex")}
            >
              {isFullscreen ? (
                <Minimize className="size-4" strokeWidth={1.75} />
              ) : (
                <Maximize className="size-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-sm gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-border/60">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <ReaderSettingsPanel
              onRequestClose={() => setSettingsOpen(false)}
            />
          </div>
          <SheetFooter className="shrink-0 border-t border-border/60 bg-popover">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className={cn(
                "w-full rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground",
                "transition-colors duration-(--dur-base) hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              Done
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
