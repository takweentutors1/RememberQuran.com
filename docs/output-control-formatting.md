---
name: output-control-formatting
description: Master formatting, structure, and presentation of AI outputs. Use this whenever the user needs content in a specific format (bullet points, tables, summaries, lists), wants plain English instead of jargon, needs pros/cons analysis, wants to explain concepts simply, or needs to control readability and clarity of responses.
---

# Output Control & Formatting: Tricks 11-20

Transform raw responses into exactly what you need.

## 10 Output Control Techniques

### 11. Ask for Bullet Points & Tables
**Use structured formats** for scannable, organized information.

**When to use:**
- Comparing options (tables excel here)
- Lists with related info (bullets work)
- Decision frameworks (tables with rows for each option)
- Quick reference guides (bullets)

**How to prompt:**
```
Format as a table with columns for:
- Feature name
- How it works
- Best for
- Pricing tier
```

**vs:**

```
Use bullet points with this structure:
• [Main point]: [2-3 word explanation]
  - Subpoint 1
  - Subpoint 2
```

### 12. Demand Plain English
**Eliminate jargon** and get clarity everyone can understand.

**Phrases that work:**
- "Use plain English. No jargon."
- "Explain like I'm 5 (ELI5)"
- "Avoid technical terms"
- "Explain like you're talking to a friend"
- "Remove all acronyms or spell them out"

**Example:**
```
Explain blockchain to a 70-year-old.
No technical jargon. Use everyday analogies.
```

### 13. Say "Be Concise"
**Cut to the essentials** and eliminate fluff.

**Magic phrases:**
- "Be concise" (10-20% reduction)
- "Get to the point" (stronger emphasis)
- "Tighten this" (remove verbose language)
- "Strip this down to essentials"
- "No filler, just facts"

**Example:**
```
Be concise. Every word should earn its place.
No introductions, no transitions, just the content.
```

### 14. Ask for Pros & Cons
**Get balanced analysis** with explicit tradeoffs.

**Formats:**

Option A: Simple list
```
List 3 pros and 3 cons of [decision].
```

Option B: Scoring
```
For each pro/con, rate importance (1-10).
```

Option C: Weighted
```
Pros and cons ranked by impact on [specific goal].
```

**Example:**
```
Should I hire this person? Give me 4 pros and 4 cons 
ranked by how much each matters for this role.
```

### 15. Request Analogies
**Make abstract ideas concrete** through comparisons.

**How to prompt:**
- "Use 3 analogies to explain this"
- "Find a sports analogy for this business concept"
- "Compare this to something from nature"
- "What's this like in terms of cooking/building/sports?"

**Example:**
```
Explain how machine learning works using only analogies.
Use: cooking, sports, and teaching as your three frameworks.
```

### 16. Ask for Counterarguments
**Strengthen your thinking** by exploring opposing views.

**Patterns:**
- "What's the strongest argument against this?"
- "Play devil's advocate: why is this a bad idea?"
- "Give me the opposing view in its strongest form"
- "What would a skeptic say?"

**Example:**
```
I believe remote work is better. Give me the 3 strongest 
arguments FROM someone who disagrees, argued as persuasively as possible.
```

### 17. Request "Explain Like I'm 5"
**Strip complexity** and get the essence.

**Variations:**
- "Explain like I'm 5" (extreme simplification)
- "Explain like I'm 10" (simple but not overly so)
- "Explain like I have 0 background" (foundational)
- "Explain the core concept in 1 sentence"

**Example:**
```
Explain photosynthesis like I'm 5 years old.
Use analogies. Make it fun. No big words.
```

### 18. Ask for Counterarguments
**Build stronger arguments** by understanding objections.

**How to frame:**
- "Poke holes in my thinking"
- "What assumptions am I making?"
- "What could go wrong?"
- "Devil's advocate: why shouldn't I do this?"

**Example:**
```
I'm planning to quit my job to start a business.
Give me 5 questions a skeptical friend would ask, 
argued as persuasively as possible.
```

### 19. Request Numbered Lists
**Create skimmable, organized content** that's easy to follow.

**Why it works:**
- Numbered lists feel complete ("3 reasons" is more satisfying than bullets)
- Easier to reference ("point #2")
- Better for procedures and steps
- Psychology: numbers add authority

**Example:**
```
Give me 5 reasons this project failed, numbered.
Each reason should be one sentence.
```

### 20. Ask for a Summary
**Get condensed versions** at multiple levels of detail.

**Depth options:**
- 1-sentence summary (headline)
- 1-paragraph summary (executive summary)
- 3-bullet summary (key takeaways)
- 1-page summary (detailed but concise)

**Example:**
```
After explaining [topic] in detail:
"Now give me a 2-sentence summary that captures 
the essence. A CEO should get it in 30 seconds."
```

---

## Format Decision Tree

**Are you comparing things?**
→ Use a **table** with rows for each option

**Do you need to scan quickly?**
→ Use **bullet points** or **numbered lists**

**Do people need step-by-step?**
→ Use **numbered list** with clear sequence

**Do you need simple?**
→ Use **plain English**, no jargon

**Do you need balanced?**
→ Use **pros/cons format**

**Do you need conciseness?**
→ Say **"be concise"** explicitly

**Do you need to explain?**
→ Use **analogies** or **ELI5 format**

**Do you need arguments?**
→ Ask for **counterarguments** and devil's advocate

---

## Output Control Prompting Template

```
[Task]: [What you want done]

Format: [Specific structure]
- Bullet points / Table / Numbered list / Prose

Tone: [Communication style]
- Plain English / Professional / Casual / Simple

Length: [How much detail]
- Under [X] words / One sentence / One paragraph / Full detail

Audience: [Who reads this]
- Expert / Beginner / CEO / 8-year-old

If comparing options:
- Use a table with these columns: [list them]
- Rank by: [what matters most]

Additional constraints:
- No jargon
- Include [what to include]
- Exclude [what to skip]
```

---

## Real-World Example

**Weak Output Request:**
```
Analyze this job offer for me.
```

**Strong Output Request:**
```
Analyze this job offer against my current role.

Format: A comparison table with these rows:
- Salary & benefits
- Growth opportunity
- Work-life balance
- Team & culture
- Learning potential
- Commute/logistics

For each row, add a "Verdict" column with my likely satisfaction (1-10).

Tone: Honest. If something seems like a red flag, say so.

Then give me 3 counterarguments I should consider 
(reasons the new job might actually be worse than it looks).

Finally: In one sentence, what should I do?
```

**The difference:** Structured format + explicit criteria + devil's advocate = decision-ready analysis.
