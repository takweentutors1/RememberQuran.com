import { LayoutSync } from "@/components/layout/LayoutSync"
import { Download, Share2, Type, Image as ImageIcon } from "lucide-react"

export default function MediaMakerPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#3a352a] dark:bg-[#121110] dark:text-[#e4dfd3] flex flex-col">
      <LayoutSync layoutMode="single-page" />
      
      <main className="flex-1 flex flex-col md:flex-row pt-16">
        {/* Workspace Canvas */}
        <div className="flex-1 p-8 flex items-center justify-center bg-[#f4ebd8] dark:bg-[#0a0908] border-r border-[#e6dec8] dark:border-[#2a2825]">
          <div className="w-full max-w-lg aspect-square bg-white dark:bg-[#1a1918] shadow-2xl border border-[#e6dec8] dark:border-[#2a2825] flex flex-col items-center justify-center p-12 text-center relative">
            <div className="absolute top-4 left-4 right-4 bottom-4 border border-[#8c6b3e]/20 pointer-events-none"></div>
            <div className="font-serif text-[#8c6b3e] text-3xl leading-loose mb-8" dir="rtl">
              وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ
            </div>
            <div className="font-serif text-[#5c5445] dark:text-[#a39c8e] text-lg">
              "And He is with you wherever you are."
            </div>
            <div className="mt-8 text-sm text-[#8c6b3e]/60 font-serif">Surah Al-Hadid (57:4)</div>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="w-full md:w-80 bg-white dark:bg-[#1a1918] p-6 flex flex-col gap-8 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-6 text-[#8c6b3e]">Media Maker</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-3 border border-[#e6dec8] dark:border-[#2a2825] rounded-md hover:bg-[#8c6b3e]/5 transition-colors text-left">
                <Type className="size-5 text-[#8c6b3e]" />
                <span className="font-medium">Change Verse</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-[#e6dec8] dark:border-[#2a2825] rounded-md hover:bg-[#8c6b3e]/5 transition-colors text-left">
                <ImageIcon className="size-5 text-[#8c6b3e]" />
                <span className="font-medium">Background Style</span>
              </button>
            </div>
          </div>
          
          <div className="mt-auto space-y-4">
            <button className="w-full bg-[#8c6b3e] text-[#fcf9f2] p-4 rounded-md font-serif font-bold hover:bg-[#7a5c34] transition-colors flex items-center justify-center gap-2">
              <Download className="size-5" /> Export Image
            </button>
            <button className="w-full border border-[#8c6b3e]/30 text-[#8c6b3e] p-4 rounded-md font-serif font-bold hover:bg-[#8c6b3e]/5 transition-colors flex items-center justify-center gap-2">
              <Share2 className="size-5" /> Share
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
