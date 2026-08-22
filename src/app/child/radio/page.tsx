import { LayoutSync } from "@/components/layout/LayoutSync"
import { Play, SkipBack, SkipForward, Volume2, Smile, Heart, Star } from "lucide-react"

export default function ChildRadioPage() {
  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#0f172a] dark:bg-[#0f172a] dark:text-[#f8fafc] font-sans flex flex-col">
      <LayoutSync layoutMode="child" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24">
        
        <div className="w-full max-w-lg bg-white dark:bg-[#1e293b] border-4 border-[#bae6fd] dark:border-[#38bdf8] rounded-[3rem] shadow-xl p-10 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Decorative floating icons */}
          <Star className="absolute top-8 left-8 size-8 text-[#fef08a] animate-spin-slow" fill="currentColor" />
          <Heart className="absolute bottom-12 right-8 size-6 text-[#fca5a5] animate-bounce" fill="currentColor" />
          
          <div className="bg-[#f0f9ff] dark:bg-[#0f172a] text-[#0ea5e9] dark:text-[#38bdf8] px-6 py-2 rounded-full font-black text-xl mb-8 border-2 border-[#bae6fd] dark:border-[#38bdf8]">
            Quran Radio
          </div>
          
          {/* Animated visualizer representation */}
          <div className="size-48 rounded-full border-8 border-[#fef08a] dark:border-[#f59e0b] bg-[#fffbeb] dark:bg-[#78350f] flex items-center justify-center mb-10 shadow-inner relative overflow-hidden">
            <div className="flex gap-2 items-end h-20">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-4 bg-[#f59e0b] rounded-t-full animate-bounce`} style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <Smile className="absolute bottom-4 size-8 text-[#b45309] dark:text-[#fcd34d]" />
          </div>
          
          <h2 className="text-2xl font-extrabold mb-1 text-[#334155] dark:text-[#f8fafc]">Sheikh Minshawi</h2>
          <p className="text-[#64748b] dark:text-[#94a3b8] font-bold mb-8">Children's Repeat (Muallim)</p>
          
          {/* Big Playful Controls */}
          <div className="flex items-center gap-6">
            <button className="p-4 bg-[#f1f5f9] dark:bg-[#334155] rounded-full hover:scale-110 active:scale-95 transition-transform text-[#0ea5e9] dark:text-[#38bdf8]">
              <SkipBack className="size-8" fill="currentColor" />
            </button>
            <button className="p-6 bg-[#0ea5e9] dark:bg-[#38bdf8] rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[0_6px_0_0_#0284c7] hover:shadow-[0_2px_0_0_#0284c7] hover:translate-y-1 text-white">
              <Play className="size-12 ml-2" fill="currentColor" />
            </button>
            <button className="p-4 bg-[#f1f5f9] dark:bg-[#334155] rounded-full hover:scale-110 active:scale-95 transition-transform text-[#0ea5e9] dark:text-[#38bdf8]">
              <SkipForward className="size-8" fill="currentColor" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-4 mt-12 text-[#94a3b8]">
            <Volume2 className="size-6" strokeWidth={3} />
            <div className="h-4 flex-1 bg-[#f1f5f9] dark:bg-[#334155] rounded-full overflow-hidden border-2 border-[#e2e8f0] dark:border-[#475569]">
              <div className="w-2/3 h-full bg-[#38bdf8] rounded-full"></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
