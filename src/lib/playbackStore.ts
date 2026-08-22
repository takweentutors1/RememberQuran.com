"use client"

import { useSyncExternalStore } from "react"

/**
 * High-frequency playback position, kept outside React context on purpose:
 * the player's rAF loop writes here ~60×/sec, but listeners are only
 * notified when the highlighted word, active verse, or elapsed second
 * actually changes (~2×/sec while playing, never while idle). Components
 * subscribe with primitive-value selectors, so only the verse containing
 * the highlight re-renders — the rest of the reader tree stays untouched.
 */

export interface PlaybackPosition {
  verseKey: string | null
  wordPosition: number | null
  timeMs: number
}

const IDLE: PlaybackPosition = { verseKey: null, wordPosition: null, timeMs: 0 }

let position: PlaybackPosition = IDLE
const listeners = new Set<() => void>()

export function setPosition(next: PlaybackPosition): void {
  const prev = position
  position = next
  if (
    prev.verseKey !== next.verseKey ||
    prev.wordPosition !== next.wordPosition ||
    Math.floor(prev.timeMs / 1000) !== Math.floor(next.timeMs / 1000)
  ) {
    listeners.forEach((l) => l())
  }
}

export function clearPosition(): void {
  setPosition(IDLE)
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/** verse_key currently being recited, or null when idle */
export function usePlaybackVerseKey(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => position.verseKey,
    () => null,
  )
}

/** Word position highlighted in this verse — null unless this verse is current */
export function useHighlightedWord(verseKey: string): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (position.verseKey === verseKey ? position.wordPosition : null),
    () => null,
  )
}

export function useIsVerseActive(verseKey: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => position.verseKey === verseKey,
    () => false,
  )
}

/**
 * True once playback has started and this isn't the verse being recited —
 * drives the reader's "dim everything but the active ayah" treatment. Like
 * `useIsVerseActive`, this is a per-verse boolean selector rather than the
 * raw verse key: when the active verse moves on, exactly two subscribers
 * flip (the one losing focus, the one gaining it) instead of every ayah in
 * the surah re-rendering.
 */
export function useIsVerseDimmed(verseKey: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => position.verseKey !== null && position.verseKey !== verseKey,
    () => false,
  )
}

/** Elapsed playback time rounded to seconds (1 Hz re-render, bar only) */
export function useElapsedSeconds(): number {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(position.timeMs / 1000),
    () => 0,
  )
}

/**
 * One-shot "bring this ayah into view" signal, fired only by explicit user
 * seeks (the scrubber) — never by ordinary playback, so the page stays put
 * while reading. The id makes repeat seeks to the same ayah re-fire.
 */
export interface VerseScrollRequest {
  verseKey: string
  id: number
}

let scrollRequest: VerseScrollRequest | null = null
const scrollListeners = new Set<() => void>()

export function requestScrollToVerse(verseKey: string): void {
  scrollRequest = { verseKey, id: (scrollRequest?.id ?? 0) + 1 }
  scrollListeners.forEach((l) => l())
}

function subscribeScroll(callback: () => void): () => void {
  scrollListeners.add(callback)
  return () => scrollListeners.delete(callback)
}

export function useVerseScrollRequest(): VerseScrollRequest | null {
  return useSyncExternalStore(
    subscribeScroll,
    () => scrollRequest,
    () => null,
  )
}
