"use client"

import { BookOpen, Check, Languages } from "lucide-react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import {
  MAX_ACTIVE_TRANSLATIONS,
  translationsByLanguage,
  type TranslationResource,
} from "@/lib/translations"
import { cn } from "@/lib/utils"

export function TranslationSelector() {
  const {
    showTranslation,
    activeTranslations,
    setShowTranslation,
    setActiveTranslations,
    toggleTranslation,
  } = useReaderSettings()

  const arabicOnly = !showTranslation || activeTranslations.length === 0
  const atCap =
    showTranslation && activeTranslations.length >= MAX_ACTIVE_TRANSLATIONS
  const groups = translationsByLanguage()

  function selectArabicOnly() {
    setShowTranslation(false)
  }

  function selectTranslation(t: TranslationResource) {
    if (arabicOnly) {
      setShowTranslation(true)
      setActiveTranslations([t.id])
      return
    }
    if (activeTranslations.includes(t.id)) {
      const next = activeTranslations.filter((id) => id !== t.id)
      if (next.length === 0) {
        setShowTranslation(false)
        setActiveTranslations([])
      } else {
        setActiveTranslations(next)
      }
      return
    }
    if (activeTranslations.length >= MAX_ACTIVE_TRANSLATIONS) return
    toggleTranslation(t.id)
    setShowTranslation(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={arabicOnly}
        onClick={selectArabicOnly}
        className={cn(
          "flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left",
          "transition-colors duration-[120ms]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          arabicOnly
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-accent",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
            arabicOnly
              ? "border-primary/25 bg-primary/10"
              : "border-border bg-muted/60 text-muted-foreground",
          )}
        >
          <BookOpen className="size-3.5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Arabic only</span>
          <span
            className={cn(
              "mt-0.5 block text-[11px] leading-snug",
              arabicOnly ? "text-primary/75" : "text-muted-foreground",
            )}
          >
            Hide translations while you read
          </span>
        </span>
        {arabicOnly && <Check className="mt-1 size-3.5 shrink-0" strokeWidth={2} />}
      </button>

      <p className="text-[11px] text-muted-foreground">
        Choose up to {MAX_ACTIVE_TRANSLATIONS} translations
        {!arabicOnly && (
          <span className="tabular-nums">
            {" "}
            · {activeTranslations.length}/{MAX_ACTIVE_TRANSLATIONS}
          </span>
        )}
      </p>

      {groups.map(({ language, items }) => (
        <div key={language} className="flex flex-col gap-1.5">
          <h4 className="px-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {language}
          </h4>
          <div role="group" aria-label={`${language} translations`} className="flex flex-col gap-1">
            {items.map((t) => {
              const active = !arabicOnly && activeTranslations.includes(t.id)
              const disabled = atCap && !active
              return (
                <button
                  key={t.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  disabled={disabled}
                  onClick={() => selectTranslation(t)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left",
                    "transition-colors duration-[120ms]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent",
                    disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
                      active
                        ? "border-primary/25 bg-primary/10"
                        : "border-border bg-muted/60 text-muted-foreground",
                    )}
                  >
                    <Languages className="size-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px] leading-snug",
                        active ? "text-primary/75" : "text-muted-foreground",
                      )}
                    >
                      {t.direction === "rtl" ? "RTL · " : ""}
                      {t.author ?? t.language}
                    </span>
                  </span>
                  {active && (
                    <Check className="mt-1 size-3.5 shrink-0" strokeWidth={2} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
