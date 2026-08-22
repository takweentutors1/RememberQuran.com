import { LayoutSync } from "@/components/layout/LayoutSync"
import { X, Type, Layers, Share, Download, Image as ImageIcon } from "lucide-react"

export default function FlowMediaMakerPage() {
  return (
    <div className="fixed inset-0 bg-black text-white font-sans flex flex-col overflow-hidden">
      <LayoutSync layoutMode="flow" />
      
      {/* Top Action Bar */}
      <div className="absolute top-0 inset-x-0 z-50 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
          <X className="size-6" />
        </button>
        <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
          <Share className="size-4" /> Share to Story
        </button>
      </div>

      {/* Main Canvas Area (Story Format) */}
      <div className="flex-1 w-full h-full relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar">
        
        {/* Story 1 */}
        <div className="w-full h-full snap-start relative flex items-center justify-center overflow-hidden">
          {/* Cinematic Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#020617] z-0">
            {/* Grain overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-sm px-8">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              {/* Highlight effect */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              
              <div className="font-arabic text-3xl font-bold leading-loose text-white text-center mb-8" dir="rtl">
                إِنَّ مَعَ الْعُسْرِ يُسْرًا
              </div>
              <div className="font-bold text-xl text-white/90 text-center mb-6">
                "Indeed, with hardship [will be] ease."
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/50">
                <div className="h-px w-8 bg-white/20"></div>
                Ash-Sharh 94:6
                <div className="h-px w-8 bg-white/20"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Tool Palette */}
      <div className="absolute bottom-0 inset-x-0 z-50 p-6 pb-10 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-center gap-8">
          <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white hover:-translate-y-1 transition-all group">
            <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 border border-white/5">
              <Type className="size-6" />
            </div>
            <span className="text-xs font-medium">Font</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white hover:-translate-y-1 transition-all group">
            <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 border border-white/5">
              <ImageIcon className="size-6" />
            </div>
            <span className="text-xs font-medium">Backdrop</span>
          </button>

          <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white hover:-translate-y-1 transition-all group">
            <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 border border-white/5">
              <Layers className="size-6" />
            </div>
            <span className="text-xs font-medium">Style</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white hover:-translate-y-1 transition-all group">
            <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 border border-white/5">
              <Download className="size-6" />
            </div>
            <span className="text-xs font-medium">Save</span>
          </button>
        </div>
      </div>

    </div>
  )
}
