import type { ReactNode } from "react"

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Legal
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>
      </header>
      <div className="legal-prose flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </article>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl font-medium tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  )
}
