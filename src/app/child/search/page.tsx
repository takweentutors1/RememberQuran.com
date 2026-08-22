import { LayoutSync } from "@/components/layout/LayoutSync"
import { Search as SearchIcon, Compass, Moon, Sun, Heart, Star } from "lucide-react"
import Link from "next/link"

export default function ChildSearchPage() {
  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#0f172a] dark:bg-[#0f172a] dark:text-[#f8fafc] font-sans flex flex-col">
      <LayoutSync layoutMode="child" />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-24 pb-24">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#0ea5e9] dark:text-[#38bdf8] text-center flex justify-center items-center gap-4">
          <Compass className="size-12 text-[#f59e0b]" /> Let's Explore!
        </h1>
        
        {/* Giant Search Input */}
        <div className="relative mb-12 shadow-xl rounded-[2rem] transform hover:scale-[1.02] transition-transform">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="size-8 text-[#0ea5e9] dark:text-[#38bdf8]" strokeWidth={3} />
          </div>
          <input 
            type="text" 
            placeholder="Search for Prophets, Animals, or anything!" 
            className="w-full bg-white dark:bg-[#1e293b] border-4 border-[#bae6fd] dark:border-[#38bdf8] rounded-[2rem] py-6 pl-20 pr-8 text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-[#fcd34d] transition-all placeholder:text-[#94a3b8] dark:placeholder:text-[#475569]"
          />
        </div>
        
        {/* Quick Tap Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-[#64748b] dark:text-[#94a3b8]">Quick Tap</h2>
          <div className="flex flex-wrap gap-4">
            {['🐘 Animals', '🌙 Prophets', '🤲 Duas', '✨ Angels', '🌴 Nature', '⭐ Bedtime'].map(tag => (
              <button key={tag} className="bg-white dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] px-6 py-3 rounded-full text-xl font-bold hover:border-[#0ea5e9] hover:bg-[#f0f9ff] dark:hover:bg-[#0f172a] hover:scale-105 active:scale-95 transition-all text-[#334155] dark:text-[#cbd5e1] shadow-sm">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Results */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 text-[#f59e0b]">
            <Star className="size-6" fill="currentColor" />
            <h2 className="text-2xl font-bold text-[#334155] dark:text-[#f8fafc]">Found 3 beautiful verses!</h2>
          </div>
          
          {[1, 2, 3].map((i) => (
            <Link key={i} href="/1" className="block group">
              <div className="bg-white dark:bg-[#1e293b] border-4 border-[#e2e8f0] dark:border-[#334155] group-hover:border-[#bae6fd] dark:group-hover:border-[#38bdf8] p-8 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex justify-between items-center mb-6">
                  <div className="inline-block bg-[#fef08a] dark:bg-[#b45309] text-[#b45309] dark:text-[#fef08a] px-4 py-2 rounded-full font-bold border-2 border-[#fcd34d]">
                    Surah Al-Baqarah (2:255)
                  </div>
                  <div className="font-bold text-[#0ea5e9] dark:text-[#38bdf8] text-2xl" dir="rtl">اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ</div>
                </div>
                <p className="font-bold text-[#475569] dark:text-[#cbd5e1] text-xl leading-relaxed">
                  "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence..."
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
