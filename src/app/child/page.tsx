import { getChapters } from "@/lib/quranApi"
import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"
import { Star } from "lucide-react"

export const revalidate = 3600

export default async function ChildLayoutHome() {
  const chapters = await getChapters()

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#0f172a] dark:bg-[#0f172a] dark:text-[#f8fafc] font-sans">
      <LayoutSync layoutMode="child" />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm inline-flex flex-col items-center mb-8 border-4 border-yellow-400">
          <div className="flex gap-2 mb-3 text-yellow-400">
            <Star className="size-8 fill-current" />
            <Star className="size-8 fill-current" />
            <Star className="size-8 fill-current" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">You earned 3 stars this week!</h2>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-sky-500 tracking-tight">Let's Read Quran!</h1>
        <p className="text-xl max-w-md text-slate-600 dark:text-slate-400 mb-8 font-medium">
          Pick a Surah and start reading with big, easy-to-read letters.
        </p>
      </section>

      {/* Surah List Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chapters.map((chapter) => (
            <Link 
              key={chapter.id} 
              href={`/${chapter.id}`}
              className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border-2 border-sky-100 dark:border-slate-700"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 font-bold text-lg shrink-0">
                {chapter.id}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-lg truncate text-slate-800 dark:text-slate-100">{chapter.name_simple}</div>
                <div className="text-sm truncate text-slate-500 dark:text-slate-400">{chapter.translated_name.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
