import { getChapters } from "@/lib/quranApi"
import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"
import { BookOpen, EyeOff, Bookmark, PlayCircle, Book } from "lucide-react"

export const revalidate = 3600

export default async function SinglePageLayoutHome() {
  const chapters = await getChapters()

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#3a352a] dark:bg-[#121110] dark:text-[#e4dfd3] selection:bg-[#8c6b3e]/20">
      <LayoutSync layoutMode="single-page" />
      
      {/* 1. Enhanced Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 pt-20 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-5 dark:opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#8c6b3e 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium border border-[#8c6b3e]/30 rounded-full text-[#8c6b3e] bg-[#8c6b3e]/5">
            <BookOpen className="size-4" />
            <span>The Traditional Reading Experience</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-[#8c6b3e] leading-tight">
            The Digital Mushaf.<br/>
            <span className="text-[#3a352a] dark:text-[#e4dfd3]">Zero Distractions.</span>
          </h1>
          
          <p className="font-serif text-xl md:text-2xl max-w-2xl text-[#5c5445] dark:text-[#a39c8e] mb-12 leading-relaxed">
            Experience the Quran exactly as it was printed. Chrome tucked away, authentic typography, just you and the divine words.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            {/* TODO: Implement client-side check for Last Read. For now, static default */}
            <Link 
              href="/1" 
              className="w-full sm:w-auto bg-[#8c6b3e] text-[#fcf9f2] px-8 py-4 rounded-md font-serif text-lg md:text-xl hover:bg-[#7a5c34] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
            >
              Start Reading
            </Link>
            <a 
              href="#directory" 
              className="w-full sm:w-auto bg-transparent border border-[#8c6b3e]/30 text-[#8c6b3e] px-8 py-4 rounded-md font-serif text-lg md:text-xl hover:bg-[#8c6b3e]/5 transition-colors flex items-center justify-center gap-3"
            >
              Browse Surahs
            </a>
          </div>
        </div>

        {/* CSS-based Mockup Representation */}
        <div className="mt-20 w-full max-w-5xl aspect-[16/9] md:aspect-[2/1] bg-white dark:bg-[#1a1918] rounded-t-2xl shadow-2xl border-t border-x border-[#e6dec8] dark:border-[#2a2825] p-8 md:p-12 relative overflow-hidden flex flex-col items-center">
          <div className="w-1/3 h-1 bg-[#8c6b3e]/20 rounded-full mb-12"></div>
          <div className="text-center font-serif text-[#8c6b3e] text-2xl md:text-4xl leading-loose max-w-3xl opacity-80" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ <br/>
            الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
          </div>
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white dark:from-[#1a1918] to-transparent"></div>
        </div>
      </section>

      {/* 2. Features / Value Proposition */}
      <section className="py-24 px-4 bg-[#f4ebd8] dark:bg-[#181716] border-y border-[#e6dec8] dark:border-[#2a2825]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-[#8c6b3e]/10 flex items-center justify-center mb-6 text-[#8c6b3e]">
              <EyeOff className="size-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3">Distraction-Free</h3>
            <p className="text-[#5c5445] dark:text-[#a39c8e] leading-relaxed">
              All UI elements, menus, and sidebars are tucked away. It's just you and the words of Allah.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-[#8c6b3e]/10 flex items-center justify-center mb-6 text-[#8c6b3e]">
              <Book className="size-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3">Authentic Typography</h3>
            <p className="text-[#5c5445] dark:text-[#a39c8e] leading-relaxed">
              High-fidelity Madina script rendering that feels identical to reading a physical printed book.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-[#8c6b3e]/10 flex items-center justify-center mb-6 text-[#8c6b3e]">
              <Bookmark className="size-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3">Smart Resumption</h3>
            <p className="text-[#5c5445] dark:text-[#a39c8e] leading-relaxed">
              Never lose your place. Your bookmarks and reading progress sync seamlessly as you read.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Quick Access */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl mb-12 text-center text-[#5c5445] dark:text-[#a39c8e]">
          Daily Sunnah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 18, name: "Al-Kahf", desc: "For protection and light on Fridays" },
            { id: 36, name: "Ya-Sin", desc: "The heart of the Quran" },
            { id: 67, name: "Al-Mulk", desc: "For protection in the grave before sleep" }
          ].map((surah) => (
            <Link 
              key={surah.id} 
              href={`/${surah.id}`}
              className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-[#1a1918] border border-[#e6dec8] dark:border-[#2a2825] rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-4xl text-[#8c6b3e] mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                {String(surah.id).padStart(2, '0')}
              </span>
              <h3 className="font-serif text-2xl font-semibold mb-2">Surah {surah.name}</h3>
              <p className="text-sm text-center text-[#5c5445] dark:text-[#a39c8e]">{surah.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Surah Directory */}
      <section id="directory" className="max-w-6xl mx-auto px-4 pb-24 pt-12 border-t border-[#e6dec8] dark:border-[#2a2825]">
        <div className="flex flex-col items-center mb-16">
          <h2 className="font-serif text-4xl font-semibold mb-4 text-[#8c6b3e]">Full Directory</h2>
          <p className="text-[#5c5445] dark:text-[#a39c8e]">Browse all 114 Surahs of the Holy Quran</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {chapters.map((chapter) => (
            <Link 
              key={chapter.id} 
              href={`/${chapter.id}`}
              className="flex flex-col items-center justify-center aspect-[2/3] bg-white dark:bg-[#1a1918] rounded-md shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#e6dec8] dark:border-[#2a2825] p-4 text-center group"
            >
              <div className="text-[#8c6b3e] font-serif text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {chapter.id}
              </div>
              <div className="font-serif text-xl font-semibold mb-1">{chapter.name_simple}</div>
              <div className="text-sm text-[#5c5445] dark:text-[#a39c8e]">{chapter.translated_name.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-24 px-4 bg-[#8c6b3e] text-[#fcf9f2] text-center">
        <h2 className="font-serif text-4xl md:text-5xl mb-6">Ready to deepen your connection?</h2>
        <p className="text-lg md:text-xl text-[#fcf9f2]/80 mb-10 max-w-2xl mx-auto">
          Join thousands of readers who have found peace in the pure, distraction-free reading experience.
        </p>
        <Link 
          href="/1" 
          className="inline-flex items-center gap-3 bg-[#fcf9f2] text-[#8c6b3e] px-8 py-4 rounded-md font-serif text-lg font-bold hover:bg-white transition-colors"
        >
          <PlayCircle className="size-5" />
          Begin Reading Now
        </Link>
      </section>
    </div>
  )
}
