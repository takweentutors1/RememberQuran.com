import { LayoutSync } from "@/components/layout/LayoutSync"
import { Search as SearchIcon } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#3a352a] dark:bg-[#121110] dark:text-[#e4dfd3] flex flex-col">
      <LayoutSync layoutMode="single-page" />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-32 pb-24">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8 text-[#8c6b3e] text-center">Library Search</h1>
        
        {/* Search Input */}
        <div className="relative mb-16 shadow-lg rounded-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="size-6 text-[#8c6b3e]" strokeWidth={2} />
          </div>
          <input 
            type="text" 
            placeholder="Search by verse, translation, or topic..." 
            className="w-full bg-white dark:bg-[#1a1918] border border-[#e6dec8] dark:border-[#2a2825] rounded-full py-6 pl-16 pr-8 text-xl font-serif focus:outline-none focus:ring-2 focus:ring-[#8c6b3e]/50 transition-all placeholder:text-[#e6dec8] dark:placeholder:text-[#2a2825]"
          />
        </div>
        
        {/* Placeholder Results (Theme Showcase) */}
        <div className="space-y-8">
          <p className="text-sm text-[#5c5445] dark:text-[#a39c8e] uppercase tracking-widest font-semibold mb-6">Recent Searches</p>
          
          {[1, 2, 3].map((i) => (
            <Link key={i} href="/1" className="block group">
              <div className="bg-white dark:bg-[#1a1918] border border-[#e6dec8] dark:border-[#2a2825] p-8 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-semibold text-[#8c6b3e]">Surah Al-Baqarah (2:255)</div>
                  <div className="font-serif text-[#8c6b3e] text-xl" dir="rtl">اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ</div>
                </div>
                <p className="font-serif text-[#5c5445] dark:text-[#a39c8e] text-lg leading-relaxed">
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
