import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-arabic text-6xl leading-none text-foreground/15" dir="rtl" lang="ar">
        ٤٠٤
      </p>
      <div>
        <h1 className="text-lg font-medium text-foreground">Not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page does not exist in the record.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <BookOpen data-icon="inline-start" className="size-4" />
          Browse all surahs
        </Link>
      </Button>
    </div>
  )
}
