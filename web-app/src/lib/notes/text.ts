/**
 * Client-safe note constants + helpers. Must never import the Mongoose model
 * (this file is bundled into client components like NoteEditor).
 */
export const NOTE_TEXT_MAX_LENGTH = 10_000

/**
 * Normalize note body from a client/API payload.
 * - Rejects non-strings
 * - Trims ends (empty after trim → delete semantics at the API layer)
 * - Rejects oversize before DB write
 */
export function normalizeNoteText(
  input: unknown,
): { ok: true; text: string } | { ok: false; error: string } {
  if (typeof input !== "string") {
    return { ok: false, error: "Note text must be a string." }
  }
  const text = input.trim()
  if (text.length > NOTE_TEXT_MAX_LENGTH) {
    return {
      ok: false,
      error: `Notes can be at most ${NOTE_TEXT_MAX_LENGTH.toLocaleString()} characters.`,
    }
  }
  return { ok: true, text }
}
