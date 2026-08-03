"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { LogoWordmark } from "@/components/layout/Logo"

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/**
 * Calm sacred-minimal auth shell — warm stone + teal, brand-first,
 * one composition (not a dashboard). Matches RememberQuran tokens.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      {/* Atmosphere: stone wash + soft teal bloom + paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,var(--brand-gold-soft),transparent_55%),radial-gradient(ellipse_at_90%_80%,var(--brand-gold-soft),transparent_50%),var(--background)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Faint Arabic watermark */}
      <p
        aria-hidden
        className="pointer-events-none absolute top-[18%] right-[-4%] select-none font-arabic text-[clamp(6rem,22vw,14rem)] leading-none text-primary/[0.06] dark:text-primary/[0.09]"
        dir="rtl"
      >
        قرآن
      </p>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-sm text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogoWordmark size="lg" />
          </Link>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          {footer}
        </motion.div>
      </div>
    </div>
  )
}
