import type { Metadata } from "next"
import { SearchPageClient } from "@/components/search/SearchPageClient"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  const title = q ? `"${q}" — Search` : "Search the Quran"
  return { title, description: "Search the Quran by keyword in Arabic or English." }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  return <SearchPageClient initialQuery={q ?? ""} />
}
