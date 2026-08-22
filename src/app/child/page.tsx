import { getChapters } from "@/lib/quranApi"
import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"
import { PlayCircle, Star, Sparkles, Heart, Moon, Sun, BookOpen } from "lucide-react"

export const revalidate = 3600

export default async function ChildLayoutHome() {
  const chapters = await getChapters()

  // For the child theme, we want a vibrant, playful palette.
  // We'll use a soft sky blue as the main background, with bright yellow and white accents.
  
  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#0f172a] dark:bg-[#0f172a] dark:text-[#f8fafc] font-sans selection:bg-[#fcd34d]/50">
      <LayoutSync layoutMode="child" />
      
      {/* 1. Playful Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-[#fef08a] dark:text-[#fcd34d] animate-bounce" style={{ animationDuration: '3s' }}>
          <Star className="size-16" fill="currentColor" />
        </div>
        <div className="absolute top-20 right-20 text-[#bae6fd] dark:text-[#38bdf8] animate-pulse">
          <CloudIcon className="size-24" />
        </div>
        
        <div className="z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-bold border-2 border-[#fcd34d] rounded-full text-[#b45309] bg-[#fef08a] dark:bg-[#b45309] dark:text-[#fef08a] shadow-sm transform hover:scale-105 transition-transform">
            <Sparkles className="size-4" />
            <span>Welcome to Quran Explorer!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-[#0ea5e9] dark:text-[#38bdf8] drop-shadow-sm tracking-tight leading-tight">
            Read, Play,<br/>
            <span className="text-[#f59e0b] dark:text-[#fbbf24]">& Learn!</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#334155] dark:text-[#cbd5e1] mb-10 font-medium">
            Your fun journey to learning the words of Allah starts here.
          </p>
          
          {/* Progress / Start CTA */}
          <Link 
            href="/1" 
            className="group relative inline-flex items-center justify-center gap-3 bg-[#f59e0b] text-white px-10 py-5 rounded-full text-2xl font-black hover:bg-[#d97706] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_0_0_#b45309] hover:shadow-[0_4px_0_0_#b45309] hover:translate-y-1"
          >
            <PlayCircle className="size-8" fill="white" stroke="#f59e0b" />
            Start Your Journey!
            
            {/* Confetti element on hover */}
            <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
              <Star className="absolute top-0 left-0 size-4 text-[#fef08a] animate-spin" />
              <Star className="absolute bottom-0 right-0 size-6 text-[#bae6fd] animate-pulse" />
            </div>
          </Link>
        </div>
      </section>

      {/* 2. Visual Categories (Quick Tap) */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-[#334155] dark:text-[#f8fafc]">
            What do you want to explore?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard 
              href="/child/search?q=prophets"
              title="Stories of Prophets"
              subtitle="Learn about brave messengers"
              color="bg-[#bfdbfe] border-[#93c5fd] dark:bg-[#1e3a8a] dark:border-[#1e40af]"
              icon={<Moon className="size-12 text-[#3b82f6] dark:text-[#60a5fa]" fill="currentColor" />}
            />
            <CategoryCard 
              href="/child/search?q=animals"
              title="Animals in Quran"
              subtitle="Elephants, birds, and ants!"
              color="bg-[#bbf7d0] border-[#86efac] dark:bg-[#14532d] dark:border-[#166534]"
              icon={<Sun className="size-12 text-[#22c55e] dark:text-[#4ade80]" fill="currentColor" />}
            />
            <CategoryCard 
              href="/child/search?q=short"
              title="Short Surahs"
              subtitle="Perfect for bedtime reading"
              color="bg-[#fecaca] border-[#fca5a5] dark:bg-[#7f1d1d] dark:border-[#991b1b]"
              icon={<Heart className="size-12 text-[#ef4444] dark:text-[#f87171]" fill="currentColor" />}
            />
          </div>
        </div>
      </section>

      {/* 3. Bubbly Surah Directory */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-8 md:p-12 shadow-xl border-4 border-[#e2e8f0] dark:border-[#334155]">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4 text-[#0ea5e9] dark:text-[#38bdf8] flex items-center gap-3">
              <BookOpen className="size-8" /> All Surahs
            </h2>
            <p className="text-lg text-[#64748b] dark:text-[#94a3b8] font-medium">Pick a chapter to start reading!</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {chapters.map((chapter) => {
              // Alternate border colors for a playful look
              const colors = [
                "border-[#fca5a5] hover:bg-[#fef2f2] dark:border-[#ef4444] dark:hover:bg-[#7f1d1d]",
                "border-[#fcd34d] hover:bg-[#fffbeb] dark:border-[#f59e0b] dark:hover:bg-[#78350f]",
                "border-[#86efac] hover:bg-[#f0fdf4] dark:border-[#22c55e] dark:hover:bg-[#14532d]",
                "border-[#93c5fd] hover:bg-[#eff6ff] dark:border-[#3b82f6] dark:hover:bg-[#1e3a8a]",
                "border-[#c4b5fd] hover:bg-[#f5f3ff] dark:border-[#8b5cf6] dark:hover:bg-[#4c1d95]"
              ];
              const colorClass = colors[chapter.id % colors.length];

              return (
                <Link 
                  key={chapter.id} 
                  href={`/${chapter.id}`}
                  className={`flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0f172a] rounded-3xl border-4 ${colorClass} shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-y-1 transition-all group`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#f1f5f9] dark:bg-[#334155] flex items-center justify-center text-3xl font-bold text-[#475569] dark:text-[#cbd5e1] mb-4 group-hover:scale-110 transition-transform">
                    {chapter.id}
                  </div>
                  <div className="font-bold text-xl mb-1 text-center text-[#334155] dark:text-[#f8fafc]">
                    {chapter.name_simple}
                  </div>
                  <div className="text-sm font-medium text-[#64748b] dark:text-[#94a3b8] text-center">
                    {chapter.translated_name.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.25 10.5C6.25 8.42893 7.92893 6.75 10 6.75C11.5317 6.75 12.8465 7.6681 13.4357 8.98971C13.6121 8.95669 13.7946 8.9375 13.9821 8.9375C15.8461 8.9375 17.3571 10.4485 17.3571 12.3125C17.3571 12.5937 17.3227 12.8669 17.2584 13.1274C17.8931 13.6669 18.3036 14.4716 18.3036 15.375C18.3036 17.0319 16.9604 18.375 15.3036 18.375H6.25C4.17893 18.375 2.5 16.6961 2.5 14.625C2.5 12.637 4.04781 10.9998 6.00228 10.8856C6.08272 10.7588 6.16439 10.6309 6.25 10.5Z" />
    </svg>
  )
}

function CategoryCard({ href, title, subtitle, color, icon }: { href: string, title: string, subtitle: string, color: string, icon: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-4 ${color} hover:scale-105 active:scale-95 transition-transform`}
    >
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-extrabold text-[#1e293b] dark:text-[#f8fafc] text-center mb-2">{title}</h3>
      <p className="text-[#475569] dark:text-[#cbd5e1] font-medium text-center">{subtitle}</p>
    </Link>
  )
}
