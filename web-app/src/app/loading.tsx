import { Skeleton } from "@/components/ui/skeleton"

function SurahCardSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Skeleton className="mt-0.5 h-4 w-7 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="site-shell px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-3">
        <Skeleton className="h-14 w-48 sm:h-16" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <SurahCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
