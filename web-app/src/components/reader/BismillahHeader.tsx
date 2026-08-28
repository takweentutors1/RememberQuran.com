export function BismillahHeader() {
  return (
    <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-gold/30 sm:w-24" />
        <div className="size-1.5 rotate-45 bg-gold/50" />
        <div className="h-px w-16 bg-gold/30 sm:w-24" />
      </div>
      <p
        className="quran-arabic text-[1.85rem] leading-[2] text-gold sm:text-[2.1rem]"
        dir="rtl"
        lang="ar"
        style={{ fontSize: "1.95rem" }}
      >
        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
      </p>
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-gold/30 sm:w-24" />
        <div className="size-1.5 rotate-45 bg-gold/50" />
        <div className="h-px w-16 bg-gold/30 sm:w-24" />
      </div>
    </div>
  )
}
