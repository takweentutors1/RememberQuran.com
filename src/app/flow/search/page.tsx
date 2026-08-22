import { LayoutSync } from "@/components/layout/LayoutSync"
import { Search as SearchIcon, X, Clock, ArrowUpRight } from "lucide-react"

export default function FlowSearchPage() {
  return (
    <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-3xl text-white font-sans flex flex-col z-50">
      <LayoutSync layoutMode="flow" />
      
      {/* Search Input Area */}
      <div className="p-6 md:p-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <SearchIcon className="size-8 text-white/40" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            autoFocus
            className="flex-1 bg-transparent border-none text-4xl md:text-6xl font-light focus:outline-none focus:ring-0 placeholder:text-white/20"
          />
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors ml-auto">
            <X className="size-6" />
          </button>
        </div>
      </div>

      {/* Command-K Style Results */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-10">
            <h3 className="text-xs font-bold tracking-widest text-white/30 uppercase mb-4">Recent Searches</h3>
            <div className="flex flex-wrap gap-3">
              {['Sabr', 'Tawakkul', 'Surah Maryam'].map(tag => (
                <button key={tag} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-white/70 transition-colors">
                  <Clock className="size-3" /> {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/30 uppercase mb-4">Instant Results</h3>
            <div className="space-y-2">
              
              <div className="group flex items-center justify-between p-4 -mx-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-[#38bdf8]/20 transition-colors">
                    18
                  </div>
                  <div>
                    <div className="font-bold text-lg">Al-Kahf</div>
                    <div className="text-sm text-white/50">The Cave • 110 Ayahs</div>
                  </div>
                </div>
                <ArrowUpRight className="size-5 text-white/20 group-hover:text-white transition-colors" />
              </div>

              <div className="group flex items-center justify-between p-4 -mx-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-[#818cf8]/20 transition-colors text-xs font-bold">
                    Ayah
                  </div>
                  <div>
                    <div className="font-bold text-lg">"Indeed, with hardship [will be] ease."</div>
                    <div className="text-sm text-white/50">Ash-Sharh (94:6)</div>
                  </div>
                </div>
                <ArrowUpRight className="size-5 text-white/20 group-hover:text-white transition-colors" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
