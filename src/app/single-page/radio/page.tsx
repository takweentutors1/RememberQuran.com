import { LayoutSync } from "@/components/layout/LayoutSync"
import { PlayCircle, SkipBack, SkipForward, Volume2 } from "lucide-react"

export default function RadioPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#3a352a] dark:bg-[#121110] dark:text-[#e4dfd3] flex flex-col">
      <LayoutSync layoutMode="single-page" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md bg-white dark:bg-[#1a1918] border border-[#e6dec8] dark:border-[#2a2825] rounded-2xl shadow-xl p-8 flex flex-col items-center text-center">
          
          {/* Subtle decoration */}
          <div className="w-24 h-1 bg-[#8c6b3e]/20 rounded-full mb-8"></div>
          
          <h1 className="font-serif text-3xl font-bold mb-2 text-[#8c6b3e]">Quran Radio</h1>
          <p className="text-[#5c5445] dark:text-[#a39c8e] mb-12">Continuous 24/7 Recitation</p>
          
          {/* Playing Status */}
          <div className="size-48 rounded-full border-4 border-[#e6dec8] dark:border-[#2a2825] flex items-center justify-center mb-12 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[#8c6b3e] opacity-20 animate-pulse"></div>
            <div className="text-center">
              <div className="font-serif text-2xl font-semibold">Live</div>
              <div className="text-sm text-[#8c6b3e]">Makkah</div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-8 text-[#8c6b3e]">
            <button className="hover:opacity-70 transition-opacity"><SkipBack className="size-8" strokeWidth={1.5} /></button>
            <button className="hover:scale-110 transition-transform"><PlayCircle className="size-16" strokeWidth={1.5} /></button>
            <button className="hover:opacity-70 transition-opacity"><SkipForward className="size-8" strokeWidth={1.5} /></button>
          </div>
          
          <div className="w-full flex items-center gap-4 mt-12 text-[#5c5445] dark:text-[#a39c8e]">
            <Volume2 className="size-5" />
            <div className="h-1 flex-1 bg-[#e6dec8] dark:bg-[#2a2825] rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-[#8c6b3e]"></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
