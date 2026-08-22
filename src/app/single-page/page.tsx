import { getChapters } from "@/lib/quranApi"
import { LayoutSync } from "@/components/layout/LayoutSync"
import Link from "next/link"

export const revalidate = 3600

export default async function SinglePageLayoutHome() {
  const chapters = await getChapters()

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#3a352a] dark:bg-[#121110] dark:text-[#e4dfd3]">
      <LayoutSync layoutMode="single-page" />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="font-serif text-5xl md:text-7xl mb-4 text-[#8c6b3e]">القرآن الكريم</h1>
        <p className="font-serif text-lg md:text-xl max-w-xl text-[#5c5445] dark:text-[#a39c8e] mb-8">
          Immerse yourself in the divine words with an authentic, distraction-free reading experience.
        </p>
        <Link 
          href="/1" 
          className="bg-[#8c6b3e] text-[#fcf9f2] px-8 py-3 rounded-md font-serif text-lg hover:bg-[#7a5c34] transition-colors"
        >
          Resume Reading
        </Link>
      </section>

      {/* Surah List Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="font-serif text-3xl mb-8 text-center text-[#5c5445] dark:text-[#a39c8e]">Browse Surahs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {chapters.map((chapter) => (
            <Link 
              key={chapter.id} 
              href={`/${chapter.id}`}
              className="flex flex-col items-center justify-center aspect-[2/3] bg-white dark:bg-[#1a1918] rounded-md shadow-sm hover:shadow-md transition-shadow border border-[#e6dec8] dark:border-[#2a2825] p-4 text-center group"
            >
              <div className="text-[#8c6b3e] font-serif text-3xl mb-2 group-hover:scale-105 transition-transform">
                {chapter.id}
              </div>
              <div className="font-serif text-xl font-semibold">{chapter.name_simple}</div>
              <div className="text-sm mt-2 text-[#5c5445] dark:text-[#a39c8e]">{chapter.translated_name.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
