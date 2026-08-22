import { getChapters } from "@/lib/quranApi"
import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"
import { Play, ArrowRight, BookOpen, Headphones, Compass } from "lucide-react"

export const revalidate = 3600

export default async function FlowLayoutHome() {
  const chapters = await getChapters()

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-sans selection:bg-[#38bdf8]/30">
      <LayoutSync layoutMode="flow" />
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-[85vh] flex flex-col justify-end pb-24 px-6 md:px-12 overflow-hidden">
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-10"></div>
          <div className="absolute top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#38bdf8]/15 via-transparent to-transparent opacity-60 blur-3xl mix-blend-screen"></div>
          <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#818cf8]/10 via-transparent to-transparent opacity-50 blur-3xl mix-blend-screen"></div>
        </div>
        
        <div className="relative z-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium border border-white/10 rounded-full text-white/70 bg-white/5 backdrop-blur-md">
            <span>Last Read: Al-Kahf 18:10</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
            Find your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#818cf8]">flow.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-lg font-light leading-relaxed">
            An immersive, uninterrupted reading experience designed for deep focus and beautiful typography.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/1" 
              className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 active:scale-95 transition-transform"
            >
              <Play className="size-5" fill="currentColor" />
              Resume Reading
            </Link>
            <Link 
              href="/flow/radio" 
              className="group relative inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 active:scale-95 transition-colors"
            >
              <Headphones className="size-5" />
              Listen to Radio
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Horizontal Carousels */}
      <section className="py-12 px-6 md:px-12 relative z-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Explore Collections</h2>
          <Link href="/flow/search" className="text-sm font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1">
            See All <ArrowRight className="size-4" />
          </Link>
        </div>
        
        {/* Horizontal scroll container */}
        <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:-mx-12 md:px-12">
          
          {/* Card 1 */}
          <Link href="/18" className="snap-start shrink-0 w-72 md:w-96 aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/5 p-8 flex flex-col justify-end group relative overflow-hidden hover:border-white/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="relative z-20">
              <div className="text-xs font-bold tracking-widest text-[#38bdf8] uppercase mb-2">Friday Sunnah</div>
              <h3 className="text-3xl font-bold mb-2">Al-Kahf</h3>
              <p className="text-white/50 text-sm line-clamp-2">The Cave. Read every Friday for a light that shines between the two Fridays.</p>
            </div>
          </Link>
          
          {/* Card 2 */}
          <Link href="/36" className="snap-start shrink-0 w-72 md:w-96 aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-[#2e1065] to-[#170535] border border-white/5 p-8 flex flex-col justify-end group relative overflow-hidden hover:border-white/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="relative z-20">
              <div className="text-xs font-bold tracking-widest text-[#a78bfa] uppercase mb-2">Heart of the Quran</div>
              <h3 className="text-3xl font-bold mb-2">Ya-Sin</h3>
              <p className="text-white/50 text-sm line-clamp-2">O Ya-Sin. Often recited for seeking forgiveness and ease.</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/67" className="snap-start shrink-0 w-72 md:w-96 aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-[#064e3b] to-[#022c22] border border-white/5 p-8 flex flex-col justify-end group relative overflow-hidden hover:border-white/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="relative z-20">
              <div className="text-xs font-bold tracking-widest text-[#34d399] uppercase mb-2">Nightly Protection</div>
              <h3 className="text-3xl font-bold mb-2">Al-Mulk</h3>
              <p className="text-white/50 text-sm line-clamp-2">The Sovereignty. A protection from the punishment of the grave.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Modern List Directory */}
      <section className="py-12 px-6 md:px-12 max-w-5xl mx-auto relative z-20">
        <div className="flex items-center gap-3 mb-10 text-white/80">
          <BookOpen className="size-6" />
          <h2 className="text-2xl font-bold tracking-tight">Index</h2>
        </div>
        
        <div className="flex flex-col gap-2">
          {chapters.map((chapter) => (
            <Link 
              key={chapter.id} 
              href={`/${chapter.id}`}
              className="flex items-center p-4 rounded-2xl hover:bg-white/5 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-sm font-medium text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors shrink-0 mr-4">
                {chapter.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-white group-hover:text-[#38bdf8] transition-colors truncate">
                  {chapter.name_simple}
                </div>
                <div className="text-sm text-white/40 truncate">
                  {chapter.translated_name.name}
                </div>
              </div>
              <div className="text-2xl font-arabic text-white/70 group-hover:text-white transition-colors ml-4 shrink-0" dir="rtl">
                {chapter.name_arabic}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
