import { LayoutSync } from "@/components/layout/LayoutSync"
import { Star, ArrowRight, User } from "lucide-react"
import Link from "next/link"

export default function ChildLoginPage() {
  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#0f172a] dark:bg-[#0f172a] dark:text-[#f8fafc] font-sans flex flex-col">
      <LayoutSync layoutMode="child" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-16">
        
        <div className="w-full max-w-xl bg-white dark:bg-[#1e293b] border-4 border-[#bae6fd] dark:border-[#38bdf8] rounded-[3rem] shadow-xl p-8 md:p-12 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#fef08a] to-transparent opacity-50 dark:from-[#b45309]"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            
            <div className="size-24 rounded-full bg-[#fef08a] dark:bg-[#f59e0b] border-4 border-white dark:border-[#1e293b] shadow-lg flex items-center justify-center mb-6">
              <Star className="size-12 text-[#b45309] dark:text-[#fffbeb]" fill="currentColor" />
            </div>

            <h1 className="text-3xl font-extrabold mb-2 text-[#0ea5e9] dark:text-[#38bdf8] text-center">
              Welcome to Your Clubhouse!
            </h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] font-bold text-center mb-8">
              Sign in to save your Reading Stars and build your avatar.
            </p>

            <div className="w-full space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-[#334155] dark:text-[#cbd5e1] ml-2">Email or Username</label>
                <input 
                  type="text" 
                  placeholder="Ask a parent for help!" 
                  className="w-full bg-[#f1f5f9] dark:bg-[#0f172a] border-4 border-[#e2e8f0] dark:border-[#334155] rounded-2xl py-4 px-6 text-xl font-bold focus:outline-none focus:border-[#38bdf8] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <label className="font-bold text-[#334155] dark:text-[#cbd5e1] ml-2">Secret Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-[#f1f5f9] dark:bg-[#0f172a] border-4 border-[#e2e8f0] dark:border-[#334155] rounded-2xl py-4 px-6 text-xl font-bold focus:outline-none focus:border-[#38bdf8] transition-colors"
                />
              </div>

              <button className="w-full bg-[#f59e0b] text-white py-5 rounded-2xl font-black text-2xl hover:bg-[#d97706] hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_0_#b45309] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-1 flex items-center justify-center gap-3">
                Let's Go! <ArrowRight className="size-6" strokeWidth={3} />
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-[#e2e8f0] dark:border-[#334155] w-full text-center">
              <p className="text-[#64748b] dark:text-[#94a3b8] font-bold mb-4">New here?</p>
              <button className="bg-white dark:bg-[#1e293b] text-[#0ea5e9] dark:text-[#38bdf8] border-2 border-[#bae6fd] dark:border-[#38bdf8] py-3 px-6 rounded-full font-bold hover:bg-[#f0f9ff] dark:hover:bg-[#0f172a] transition-colors inline-flex items-center gap-2">
                <User className="size-5" /> Create a New Avatar
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
