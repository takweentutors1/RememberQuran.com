"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"

/**
 * Fade-up-into-view wrapper for footer content. A small, dedicated client
 * boundary rather than converting the whole (mostly static) `Footer` to a
 * client component — the footer's links and headings stay server-rendered;
 * only the reveal animation itself needs the browser.
 */
export function FooterReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const prefersReducedMotion = useSafeReducedMotion()

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
