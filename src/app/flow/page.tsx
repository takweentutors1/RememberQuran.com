import { getChapters } from "@/lib/quranApi"
import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"
import { Play, Disc3 } from "lucide-react"

export const revalidate = 3600

export default async function FlowLayoutHome() {
  const chapters = await getChapters()

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
      <LayoutSync layoutMode="flow" />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center border-b border-white/10">
        <div className="relative size-32 md:size-48 mb-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
          <div className="absolute inset-1 bg-[#09090b] rounded-full flex items-center justify-center">
            <Disc3 className="size-16 text-white/50" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Audio Flow</h1>
        <p className="text-lg text-zinc-400 max-w-md mb-8">
          Distraction-free, continuous Quranic recitation.
        </p>
        <Link 
          href="/1" 
          className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95"
        >
          <Play className="size-5 fill-current" />
          Start Listening
        </Link>
      </section>

      {/* Playlist Grid */}
      <section className="max-w-4xl mx-auto px-4 py-12 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">All Surahs</h2>
        </div>
        
        <div className="flex flex-col">
          {chapters.map((chapter) => (
            <Link 
              key={chapter.id} 
              href={`/${chapter.id}`}
              className="flex items-center gap-6 p-4 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="text-zinc-500 font-medium w-8 text-right group-hover:text-white transition-colors">
                {chapter.id}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">{chapter.name_simple}</div>
                <div className="text-zinc-400 text-sm">{chapter.translated_name.name}</div>
              </div>
              <div className="text-zinc-500 group-hover:text-white transition-colors">
                {chapter.name_arabic}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
