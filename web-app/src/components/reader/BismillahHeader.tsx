export function BismillahHeader() {
  return (
    <div className="mb-8 flex flex-col items-center justify-center gap-4 text-center">
      <div className="h-[1px] w-24 bg-gold/30"></div>
      <p
        className="quran-arabic text-[1.75rem] leading-[2] text-gold sm:text-[2rem]"
        dir="rtl"
        lang="ar"
        style={{ fontSize: "1.85rem" }}
      >
        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
      </p>
      <div className="h-[1px] w-24 bg-gold/30"></div>
    </div>
  )
}
