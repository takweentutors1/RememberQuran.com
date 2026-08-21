"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChaptersProvider } from "@/context/ChaptersContext"
import { ReaderSettingsProvider } from "@/context/ReaderSettingsContext"
import { AudioPlayerProvider } from "@/context/AudioPlayerContext"
import { UIProvider } from "@/context/UIContext"
import { SurahContentProvider } from "@/context/SurahContentContext"
import { StudyPanelProvider } from "@/context/StudyPanelContext"
import { SoftGateProvider } from "@/context/SoftGateContext"
import { BookmarksProvider } from "@/context/BookmarksContext"
import { NotesProvider } from "@/context/NotesContext"
import { HifzProvider } from "@/context/HifzContext"
import { SoftGateDialog } from "@/components/auth/SoftGateDialog"
import { RouteChangeEffect } from "@/components/layout/RouteChangeEffect"
import type { Chapter } from "@/types/quran"

export default function Providers({
  children,
  chapters,
}: {
  children: React.ReactNode
  chapters: Chapter[]
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        themes={['light', 'dark', 'apple', 'spotify', 'airtable']}
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delay={150}>
          <ChaptersProvider chapters={chapters}>
            <UIProvider>
              <SurahContentProvider>
                <ReaderSettingsProvider>
                  <AudioPlayerProvider>
                    <StudyPanelProvider>
                      <SoftGateProvider>
                        <BookmarksProvider>
                          <NotesProvider>
                            <HifzProvider>
                              <RouteChangeEffect />
                              {children}
                              <SoftGateDialog />
                            </HifzProvider>
                          </NotesProvider>
                        </BookmarksProvider>
                      </SoftGateProvider>
                    </StudyPanelProvider>
                  </AudioPlayerProvider>
                </ReaderSettingsProvider>
              </SurahContentProvider>
            </UIProvider>
          </ChaptersProvider>
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
