export interface TajweedRule {
  label: string
  description: string
}

/**
 * Tajweed rule registry — rules observed from the QDC word_fields=text_uthmani_tajweed
 * probe. Unknown rules from future API updates fall through with no class (safe default:
 * no colour, no error).
 */
export const TAJWEED_RULES: Record<string, TajweedRule> = {
  ham_wasl: { label: "Hamzat al-Wasl", description: "Connecting hamza — silent when preceded by another word" },
  laam_shamsiyah: { label: "Laam Shamsiyyah", description: "The laam is assimilated into the following sun letter" },
  madda_normal: { label: "Madd Normal", description: "Natural elongation of two counts" },
  madda_permissible: { label: "Madd Permissible", description: "Permissible elongation of 2, 4 or 6 counts" },
  madda_necessary: { label: "Madd Necessary", description: "Obligatory elongation of 6 counts" },
  madda_obligatory: { label: "Madd Obligatory", description: "Obligatory elongation — must be 4 or 5 counts" },
  ghunnah: { label: "Ghunnah", description: "Nasalisation — 2-count nasal sound through the nose" },
  qalaqah: { label: "Qalqalah", description: "Echoing sound on a stopped consonant (ق ط ب ج د)" },
  ikhafa: { label: "Ikhfāʾ", description: "Concealment — nasal nun/tanwin before 15 letters" },
  ikhafa_shafawi: { label: "Ikhfāʾ Shafawī", description: "Lip concealment — meem saakin before ba" },
  idgham_ghunnah: { label: "Idghām with Ghunnah", description: "Merging with nasalisation into the next letter" },
  idgham_wo_ghunnah: { label: "Idghām without Ghunnah", description: "Merging without nasalisation" },
  idgham_mutajanisayn: { label: "Idghām Mutajānisayn", description: "Merging of two letters sharing the same articulation point" },
  idgham_mutaqaribayn: { label: "Idghām Mutaqāribayn", description: "Merging of two letters with adjacent articulation points" },
  iqlab: { label: "Iqlāb", description: "Conversion — noon saakin/tanwin becomes meem before ba" },
  slnt: { label: "Silent", description: "Letter is written but not pronounced" },
  "custom-alef-maksora": { label: "Alef Maqsura", description: "Superscript alef on alef maqsura — elongated like a regular alef" },
}

/** All known rule slugs — used by the legend and for safe class generation */
export const KNOWN_RULES = new Set(Object.keys(TAJWEED_RULES))

// --- Parser ---

interface TajweedToken {
  text: string
  rule?: string
}

/** Module-level memoization — O(len) parse happens once per unique word markup string */
const parseCache = new Map<string, TajweedToken[]>()

const OPEN_PREFIX = "<rule class="
const CLOSE_TAG = "</rule>"

/**
 * Split a `text_uthmani_tajweed` word string into colourable segments.
 * Plain text between rule tags gets `rule: undefined` (rendered as-is).
 *
 * Stack tokenizer (not a flat regex) — QDC nests rules, e.g.
 *   `<rule class=madda_normal><rule class=custom-alef-maksora>ٰ</rule></rule>`
 * Innermost known rule wins for each character run. Unknown future classes
 * are pushed but skipped when resolving colour (outer known rule still applies).
 * Never uses innerHTML — attrs are unquoted.
 */
export function parseTajweedWord(text: string): TajweedToken[] {
  const cached = parseCache.get(text)
  if (cached) return cached

  const tokens: TajweedToken[] = []
  const stack: string[] = []

  const activeRule = (): string | undefined => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (KNOWN_RULES.has(stack[i])) return stack[i]
    }
    return undefined
  }

  const emit = (chunk: string) => {
    if (!chunk) return
    const rule = activeRule()
    const prev = tokens[tokens.length - 1]
    if (prev && prev.rule === rule) {
      prev.text += chunk
    } else {
      tokens.push(rule ? { text: chunk, rule } : { text: chunk })
    }
  }

  let i = 0
  while (i < text.length) {
    if (text.startsWith(OPEN_PREFIX, i)) {
      const gt = text.indexOf(">", i + OPEN_PREFIX.length)
      if (gt === -1) {
        emit(text.slice(i))
        break
      }
      stack.push(text.slice(i + OPEN_PREFIX.length, gt).trim())
      i = gt + 1
      continue
    }

    if (text.startsWith(CLOSE_TAG, i)) {
      stack.pop()
      i += CLOSE_TAG.length
      continue
    }

    const nextOpen = text.indexOf(OPEN_PREFIX, i)
    const nextClose = text.indexOf(CLOSE_TAG, i)
    let next = text.length
    if (nextOpen !== -1) next = Math.min(next, nextOpen)
    if (nextClose !== -1) next = Math.min(next, nextClose)
    emit(text.slice(i, next))
    i = next
  }

  if (tokens.length === 0) tokens.push({ text })

  parseCache.set(text, tokens)
  return tokens
}

const spanCache = new Map<string, TajweedToken[]>()

/** Arabic tatweel / kashida — tajweed markup often inserts extras the QPC string omits */
const TATWEEL = "\u0640"

function pushSpan(spans: TajweedToken[], ch: string, rule?: string) {
  const prev = spans[spans.length - 1]
  if (prev && prev.rule === rule) {
    prev.text += ch
  } else {
    spans.push(rule ? { text: ch, rule } : { text: ch })
  }
}

function spansFromRules(
  plainChars: string[],
  rules: (string | undefined)[],
): TajweedToken[] {
  const spans: TajweedToken[] = []
  for (let i = 0; i < plainChars.length; i++) {
    pushSpan(spans, plainChars[i], rules[i])
  }
  return spans.length > 0 ? spans : [{ text: plainChars.join("") }]
}

/**
 * Map tajweed rule colours onto the QPC/Uthmani plain glyphs the reader
 * already uses. Rendering the tajweed markup string directly shifts word
 * shapes (extra tatweels, different tanween) — clicks then land on the
 * neighbouring word. Aligns by codepoint, skipping tatweel-only extras.
 */
export function buildTajweedSpans(
  plainText: string,
  tajweedMarkup: string,
): TajweedToken[] {
  const key = `${plainText}\0${tajweedMarkup}`
  const cached = spanCache.get(key)
  if (cached) return cached

  const tokens = parseTajweedWord(tajweedMarkup)
  const marked: { ch: string; rule?: string }[] = []
  for (const token of tokens) {
    for (const ch of [...token.text]) {
      marked.push({ ch, rule: token.rule })
    }
  }

  const plainChars = [...plainText]
  const alignedRules: (string | undefined)[] = []
  let mi = 0
  let aligned = true

  for (let pi = 0; pi < plainChars.length; pi++) {
    const pch = plainChars[pi]

    while (mi < marked.length && marked[mi].ch === TATWEEL && pch !== TATWEEL) {
      mi++
    }

    if (mi >= marked.length) {
      alignedRules.push(undefined)
      continue
    }

    const m = marked[mi]

    if (pch === m.ch) {
      alignedRules.push(m.rule)
      mi++
      continue
    }

    if (pch === TATWEEL && m.ch !== TATWEEL) {
      alignedRules.push(m.rule)
      continue
    }

    aligned = false
    break
  }

  if (aligned && alignedRules.length === plainChars.length) {
    const result = spansFromRules(plainChars, alignedRules)
    spanCache.set(key, result)
    return result
  }

  // Same visible length after dropping tatweels, but some marks differ
  // (e.g. QPC ٗ vs tajweed ً) — colour by index, keep QPC glyphs.
  const markedNoTat = marked.filter((m) => m.ch !== TATWEEL)
  if (markedNoTat.length === plainChars.length) {
    const result = spansFromRules(
      plainChars,
      markedNoTat.map((m) => m.rule),
    )
    spanCache.set(key, result)
    return result
  }

  const fallback = [{ text: plainText }]
  spanCache.set(key, fallback)
  return fallback
}
