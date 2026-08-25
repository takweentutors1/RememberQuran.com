import type { Metadata } from "next"
import { RadioTower } from "lucide-react"
import { RadioPanel } from "@/components/audio/RadioPanel"

export const metadata: Metadata = {
  title: "Quran Radio",
  description:
    "Listen to continuous Quran recitation — surah after surah, with your choice of reciter.",
}

export default function RadioPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RadioTower className="size-5" strokeWidth={1.75} />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Quran Radio</h1>
      </header>
      <RadioPanel />
    </div>
  )
}
