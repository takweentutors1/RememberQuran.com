import { LayoutSync } from "@/components/layout/LayoutSync"
import { Play, SkipBack, SkipForward, Repeat, Shuffle, ChevronDown, ListMusic } from "lucide-react"

export default function FlowRadioPage() {
  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-sans flex flex-col overflow-hidden">
      <LayoutSync layoutMode="flow" />
      
      {/* Dynamic Canvas Background (CSS simulated) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#38bdf8]/40 via-[#818cf8]/10 to-transparent blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 right-0 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b]/80 via-transparent to-transparent blur-[80px] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 pt-16">
        
        {/* Top Header (Collapsible) */}
        <div className="flex justify-between items-center mb-8">
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
            <ChevronDown className="size-6" />
          </button>
          <div className="text-xs font-bold tracking-widest text-white/50 uppercase">
            Now Playing from Flow
          </div>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
            <ListMusic className="size-6" />
          </button>
        </div>
        
        {/* Album Art / Focus Area */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="w-full max-w-[320px] aspect-square rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-center p-8 relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="text-center">
              <div className="text-5xl font-arabic font-bold text-white mb-4 drop-shadow-lg" dir="rtl">
                سورة الكهف
              </div>
              <div className="text-sm font-medium text-white/50 tracking-widest uppercase">
                Al-Kahf
              </div>
            </div>
          </div>
        </div>
        
        {/* Track Info */}
        <div className="mb-8 px-4">
          <h2 className="text-3xl font-bold mb-1">Mishary Al-Afasy</h2>
          <p className="text-white/50 text-lg">Surah Al-Kahf • Studio</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-10 px-4">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2 cursor-pointer relative">
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-white rounded-full"></div>
            {/* Playhead thumb */}
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 -ml-1.5 size-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
          </div>
          <div className="flex justify-between text-xs text-white/50 font-medium">
            <span>12:04</span>
            <span>-28:16</span>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex justify-between items-center px-4 pb-8">
          <button className="text-white/40 hover:text-white transition-colors">
            <Shuffle className="size-6" />
          </button>
          <button className="text-white hover:scale-110 active:scale-95 transition-all">
            <SkipBack className="size-10 fill-current" />
          </button>
          <button className="size-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <Play className="size-8 ml-1 fill-current" />
          </button>
          <button className="text-white hover:scale-110 active:scale-95 transition-all">
            <SkipForward className="size-10 fill-current" />
          </button>
          <button className="text-[#38bdf8] hover:text-[#7dd3fc] transition-colors relative">
            <Repeat className="size-6" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 size-1 bg-[#38bdf8] rounded-full"></div>
          </button>
        </div>

      </div>
    </div>
  )
}
