import { LayoutSync } from "@/components/layout/LayoutSync"
import { Download, Share2, Sparkles, Image as ImageIcon, Smile, Type, MousePointerClick } from "lucide-react"

export default function ChildMediaMakerPage() {
  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#0f172a] dark:bg-[#0f172a] dark:text-[#f8fafc] font-sans flex flex-col">
      <LayoutSync layoutMode="child" />
      
      <main className="flex-1 flex flex-col md:flex-row pt-16">
        {/* Playful Canvas Area */}
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center bg-[url('/img/grid.svg')] dark:bg-none dark:bg-[#0f172a] relative border-r-4 border-[#bae6fd] dark:border-[#1e293b]">
          
          <div className="absolute top-4 left-4 bg-white dark:bg-[#1e293b] px-4 py-2 rounded-full font-bold text-[#0ea5e9] flex items-center gap-2 border-2 border-[#bae6fd] shadow-sm">
            <MousePointerClick className="size-4" /> Drag stickers!
          </div>

          <div className="w-full max-w-lg aspect-square bg-[#fffbeb] dark:bg-[#78350f] rounded-[3rem] shadow-2xl border-8 border-[#fcd34d] dark:border-[#b45309] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            
            {/* Draggable Stickers (Visual representation) */}
            <div className="absolute top-10 left-10 text-5xl transform rotate-12 cursor-grab">🌙</div>
            <div className="absolute bottom-10 right-10 text-5xl transform -rotate-12 cursor-grab">🌸</div>
            <div className="absolute top-20 right-12 text-4xl transform rotate-45 cursor-grab text-[#0ea5e9]">✨</div>

            <div className="font-bold text-[#b45309] dark:text-[#fef08a] text-4xl leading-loose mb-6 z-10 drop-shadow-md" dir="rtl">
              وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ
            </div>
            <div className="font-black text-[#78350f] dark:text-[#fef08a] text-xl z-10">
              "And He is with you wherever you are."
            </div>
            <div className="mt-6 inline-block bg-white dark:bg-[#b45309] text-[#b45309] dark:text-[#fef08a] px-4 py-1 rounded-full font-bold border-2 border-[#fcd34d] z-10">
              Al-Hadid 57:4
            </div>
          </div>
        </div>
        
        {/* Chunky Toolbar */}
        <div className="w-full md:w-96 bg-white dark:bg-[#1e293b] p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-3xl font-black mb-6 text-[#0ea5e9] flex items-center gap-2">
              <Sparkles className="size-8 text-[#f59e0b]" /> Sticker Book
            </h2>
            
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 p-4 bg-[#f0f9ff] dark:bg-[#0f172a] border-4 border-[#bae6fd] dark:border-[#38bdf8] rounded-2xl hover:scale-105 transition-transform text-left">
                <div className="bg-[#38bdf8] p-2 rounded-xl"><Type className="size-6 text-white" /></div>
                <span className="font-bold text-lg text-[#0ea5e9] dark:text-[#38bdf8]">Pick an Ayah</span>
              </button>
              
              <button className="w-full flex items-center gap-4 p-4 bg-[#f0fdf4] dark:bg-[#14532d] border-4 border-[#86efac] dark:border-[#22c55e] rounded-2xl hover:scale-105 transition-transform text-left">
                <div className="bg-[#22c55e] p-2 rounded-xl"><ImageIcon className="size-6 text-white" /></div>
                <span className="font-bold text-lg text-[#16a34a] dark:text-[#4ade80]">Backgrounds</span>
              </button>

              <button className="w-full flex items-center gap-4 p-4 bg-[#fffbeb] dark:bg-[#78350f] border-4 border-[#fcd34d] dark:border-[#f59e0b] rounded-2xl hover:scale-105 transition-transform text-left">
                <div className="bg-[#f59e0b] p-2 rounded-xl"><Smile className="size-6 text-white" /></div>
                <span className="font-bold text-lg text-[#d97706] dark:text-[#fbbf24]">Stickers & Emojis</span>
              </button>
            </div>
          </div>
          
          <div className="mt-auto space-y-4 pt-8">
            <button className="w-full bg-[#10b981] text-white p-5 rounded-2xl font-black text-xl hover:bg-[#059669] transition-colors flex items-center justify-center gap-3 shadow-[0_6px_0_0_#047857] hover:shadow-[0_2px_0_0_#047857] hover:translate-y-1">
              <Download className="size-6" strokeWidth={3} /> Save Picture!
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
