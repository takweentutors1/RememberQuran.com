export function BismillahHeader() {
  return (
    <div className="my-1.5 sm:my-2.5 flex flex-col items-center justify-center text-center select-none">
      <p
        className="quran-arabic text-[1.65rem] sm:text-[1.85rem] md:text-[2.05rem] leading-none text-[#A37F46] dark:text-[#D4AF37] drop-shadow-2xs font-normal"
        dir="rtl"
        lang="ar"
      >
        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
      </p>
    </div>
  )
}
