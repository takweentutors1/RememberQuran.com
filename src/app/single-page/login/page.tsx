import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#3a352a] dark:bg-[#121110] dark:text-[#e4dfd3] flex flex-col items-center justify-center p-4">
      <LayoutSync layoutMode="single-page" />
      
      <div className="w-full max-w-md bg-white dark:bg-[#1a1918] border border-[#e6dec8] dark:border-[#2a2825] rounded-2xl shadow-2xl p-10 flex flex-col items-center">
        
        <div className="size-16 rounded-full bg-[#8c6b3e]/10 flex items-center justify-center mb-6 text-[#8c6b3e]">
          <BookOpen className="size-8" strokeWidth={1.5} />
        </div>
        
        <h1 className="font-serif text-3xl font-bold mb-2 text-center text-[#8c6b3e]">Welcome Back</h1>
        <p className="text-center text-[#5c5445] dark:text-[#a39c8e] mb-10">Sign in to save your bookmarks and reading progress across all devices.</p>
        
        <form className="w-full space-y-6">
          <div>
            <label className="block text-sm font-serif font-medium mb-2 text-[#5c5445] dark:text-[#a39c8e]">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#fcf9f2] dark:bg-[#121110] border border-[#e6dec8] dark:border-[#2a2825] rounded-md px-4 py-3 font-serif focus:outline-none focus:ring-2 focus:ring-[#8c6b3e]/50 transition-all"
              placeholder="reader@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-serif font-medium text-[#5c5445] dark:text-[#a39c8e]">Password</label>
              <a href="#" className="text-xs text-[#8c6b3e] hover:underline">Forgot?</a>
            </div>
            <input 
              type="password" 
              className="w-full bg-[#fcf9f2] dark:bg-[#121110] border border-[#e6dec8] dark:border-[#2a2825] rounded-md px-4 py-3 font-serif focus:outline-none focus:ring-2 focus:ring-[#8c6b3e]/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button className="w-full bg-[#8c6b3e] text-[#fcf9f2] p-4 rounded-md font-serif font-bold text-lg hover:bg-[#7a5c34] transition-colors mt-8">
            Sign In
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-[#5c5445] dark:text-[#a39c8e]">
          Don't have an account? <Link href="#" className="text-[#8c6b3e] hover:underline font-medium">Create one</Link>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#8c6b3e]/5 blur-[100px] pointer-events-none -z-10"></div>
    </div>
  )
}
