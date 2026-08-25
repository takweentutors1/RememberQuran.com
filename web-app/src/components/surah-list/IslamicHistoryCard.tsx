"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getHistoryFactsFrom } from "@/lib/islamic-history"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"

const TICKER_INTERVAL_MS = 1500
const FACTS = getHistoryFactsFrom()

export function IslamicHistoryCard() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const fact = useMemo(() => FACTS[index % FACTS.length], [index])
  const prefersReducedMotion = useSafeReducedMotion()

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % FACTS.length)
    }, TICKER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#0e6b57] p-6 text-white shadow-sm transition-shadow hover:shadow-md sm:p-8"
    >
      {/* Decorative pattern could go here */}
      <div className="absolute -right-16 -top-16 opacity-10 blur-xl">
        <div className="size-64 rounded-full bg-gold" />
      </div>

      <div className="relative z-10">
        <p className="eyebrow text-gold-leaf tracking-widest uppercase opacity-90">
          On this day in Islamic history
        </p>

        <div className="relative mt-4 min-h-[5rem] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={fact.title}
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.35 }}
            >
              <p className="text-lg font-medium leading-tight text-white">{fact.title}</p>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">{fact.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Indicator dots */}
      <div className="relative z-10 mt-6 flex gap-1.5">
        {FACTS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index % FACTS.length ? "w-4 bg-gold" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
