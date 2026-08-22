"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"
import { SurahCard } from "./SurahCard"
import { SurahFilter, type SurahFilterValue } from "./SurahFilter"

/**
 * Horizontal, snap-scrolling explorer for the 114 surahs — replaces the old
 * server-rendered vertical grid. Embla needs hooks, so this is the one
 * client boundary in the surah list; `SurahListPage` (a server component)
 * just hands it the chapters it already fetched.
 *
 * The revelation-place filter now lives here as plain state rather than a
 * DOM attribute: once the list itself is a client-hydrated carousel, there
 * is no server-rendered output left to preserve by filtering-by-attribute,
 * and Embla needs to `reInit()` whenever the slide count changes anyway.
 */
export function SurahExplorer({ chapters }: { chapters: Chapter[] }) {
  const [filter, setFilter] = useState<SurahFilterValue>("all")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
  })

  const filtered = useMemo(
    () =>
      filter === "all"
        ? chapters
        : chapters.filter((c) => c.revelation_place === filter),
    [chapters, filter],
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    queueMicrotask(onSelect)
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    emblaApi?.reInit()
    queueMicrotask(() => setSelectedIndex(0))
  }, [emblaApi, filtered.length])

  return (
    <section aria-labelledby="all-surahs-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
            Directory
          </p>
          <h2
            id="all-surahs-heading"
            className="mt-1 text-xl font-medium tracking-tight"
          >
            {filtered.length} surahs
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <SurahFilter value={filter} onChange={setFilter} />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous surah"
              onClick={() => emblaApi?.scrollPrev()}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="size-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Next surah"
              onClick={() => emblaApi?.scrollNext()}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div
          className="flex touch-pan-y gap-2.5 py-2"
          role="list"
          aria-label="List of surahs"
        >
          {filtered.map((chapter, index) => (
            <div
              key={chapter.id}
              role="listitem"
              className={cn(
                "w-[280px] shrink-0 grow-0 rounded-xl transition-shadow duration-(--dur-base) ease-(--ease-out) sm:w-[320px]",
                index === selectedIndex && "gold-leaf-glow",
              )}
            >
              <SurahCard chapter={chapter} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
