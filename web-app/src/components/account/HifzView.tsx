"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Brain } from "lucide-react"
import { useHifz } from "@/context/HifzContext"
import { getAyahCount } from "@/lib/quran/verse-key"
import { JUZ_RANGES, getJuzAyahCount, getJuzForVerse } from "@/lib/quran/juz"
import { cn } from "@/lib/utils"

export interface HifzAyahDto {
  verseKey: string
  surahId: number
  ayahId: number
  surahName: string
  surahArabic: string
  memorisedAt: string
}

interface HifzViewProps {
  initialAyahs: HifzAyahDto[]
}

type Tab = "surah" | "juz"

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function HifzView({ initialAyahs }: HifzViewProps) {
  const { refresh } = useHifz()
  const [ayahs, setAyahs] = useState(initialAyahs)
  const [tab, setTab] = useState<Tab>("surah")
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const totalMemorised = ayahs.length

  const bySurah = useMemo(() => {
    const map = new Map<
      number,
      { surahId: number; name: string; arabic: string; count: number; ayahs: HifzAyahDto[] }
    >()
    for (const a of ayahs) {
      const entry = map.get(a.surahId) ?? {
        surahId: a.surahId,
        name: a.surahName,
        arabic: a.surahArabic,
        count: 0,
        ayahs: [],
      }
      entry.count += 1
      entry.ayahs.push(a)
      map.set(a.surahId, entry)
    }
    return [...map.values()].sort((a, b) => a.surahId - b.surahId)
  }, [ayahs])

  const byJuz = useMemo(() => {
    const counts = new Map<number, number>()
    for (const a of ayahs) {
      const juz = getJuzForVerse(a.surahId, a.ayahId)
      if (juz === null) continue
      counts.set(juz, (counts.get(juz) ?? 0) + 1)
    }
    return JUZ_RANGES.map((range) => {
      const memorised = counts.get(range.juz) ?? 0
      const total = getJuzAyahCount(range.juz)
      return {
        juz: range.juz,
        memorised,
        total,
        pct: total > 0 ? Math.round((memorised / total) * 100) : 0,
        start: `${range.startSurah}:${range.startAyah}`,
        end: `${range.endSurah}:${range.endAyah}`,
      }
    })
  }, [ayahs])

  async function unmark(verseKey: string) {
    if (pendingKey) return
    setPendingKey(verseKey)
    const prev = ayahs
    setAyahs((list) => list.filter((a) => a.verseKey !== verseKey))
    try {
      const res = await fetch(
        `/api/account/hifz?verseKey=${encodeURIComponent(verseKey)}`,
        { method: "DELETE" },
      )
      if (!res.ok) throw new Error(`Unmark failed: ${res.status}`)
      await refresh()
    } catch {
      setAyahs(prev)
    } finally {
      setPendingKey(null)
    }
  }

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={cn(
        "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-[120ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tab === id
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-serif text-2xl font-medium tabular-nums tracking-tight">
              {totalMemorised.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              of 6,236 ayahs marked memorised
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={(totalMemorised / 6236) * 100} />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Hifz views"
        className="flex gap-1 rounded-lg bg-muted/60 p-0.5"
      >
        {tabBtn("surah", "By surah")}
        {tabBtn("juz", "By juz")}
      </div>

      {tab === "surah" && (
        <div className="flex flex-col gap-3">
          {bySurah.length === 0 ? (
            <EmptyHifz />
          ) : (
            bySurah.map((s) => {
              const total = getAyahCount(s.surahId) ?? 0
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
              return (
                <section
                  key={s.surahId}
                  className="rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium">
                        <span className="tabular-nums text-muted-foreground">
                          {s.surahId}.
                        </span>{" "}
                        {s.name}
                      </h2>
                      <p
                        className="mt-0.5 font-uthmani text-base text-muted-foreground"
                        dir="rtl"
                        lang="ar"
                      >
                        {s.arabic}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {s.count}/{total} · {pct}%
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={pct} />
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {s.ayahs.map((a) => (
                      <li key={a.verseKey}>
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 pl-2 text-xs">
                          <Link
                            href={`/${a.surahId}/${a.ayahId}`}
                            className="tabular-nums text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {a.ayahId}
                          </Link>
                          <button
                            type="button"
                            title="Unmark memorised"
                            aria-label={`Unmark ${a.verseKey}`}
                            disabled={pendingKey === a.verseKey}
                            onClick={() => void unmark(a.verseKey)}
                            className="rounded-r-md px-1.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                          >
                            ×
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })
          )}
        </div>
      )}

      {tab === "juz" && (
        <div className="flex flex-col gap-2">
          {byJuz.map((j) => (
            <div
              key={j.juz}
              className="rounded-xl border border-border px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Juz {j.juz}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {j.start} – {j.end}
                  </p>
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {j.memorised}/{j.total} · {j.pct}%
                </p>
              </div>
              <div className="mt-2">
                <ProgressBar value={j.pct} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyHifz() {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <Brain className="mx-auto size-8 text-muted-foreground/50" strokeWidth={1.5} />
      <p className="mt-3 text-sm font-medium">No memorised ayahs yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Open any ayah and tap the brain icon to mark it memorised.
      </p>
      <Link
        href="/1"
        className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        Start with Al-Fatihah
      </Link>
    </div>
  )
}
