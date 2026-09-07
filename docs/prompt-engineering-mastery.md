---
name: prompt-engineering-mastery
description: Master core prompt engineering techniques to unlock Claude's full potential. Use this skill whenever the user wants better results from their prompts, needs to structure requests effectively, or wants to understand how to write prompts that actually work. Covers acting as an expert, adding context, specifying formats, setting tone, using examples, chaining prompts, word limits, multiple options, step-by-step reasoning, and defining goals upfront.
---

# Prompt Engineering Mastery: Core Techniques 1-10

The gap between average and extraordinary results lies in knowing which prompts to use.

## The 10 Core Prompt Techniques

### 1. Act As an Expert
**Transform** generic requests into expert-level responses by assigning a specific persona.

**How:**
- Replace "help me with X" with "You are a [specific expert role]. Help me with X."
- Examples: Harvard professor, financial advisor, skeptical editor, experienced manager
- The AI calibrates its response depth, vocabulary, and perspective to that role

**Example:**
```
❌ Write a business plan
✅ You are a venture capitalist with 20 years of experience. 
   Review this business concept and identify the 3 biggest risks 
   as you would to a founder pitching you.
```

### 2. Add Rich Context
**Provide** background information that shapes better, more relevant responses.

**What to include:**
- Your background/expertise level
- What you'll do with the answer
- Constraints or requirements
- What's already been tried
- Success criteria

**Example:**
```
I'm a non-technical founder (no coding experience) building an MVP. 
I need to explain API integration to my dev team to ensure we're 
aligned. We have $5K budget and 2 weeks.
```

### 3. Specify Output Format
**Be explicit** about how you want the result structured.

**Options:**
- Bullet points, numbered lists, tables
- Markdown, JSON, CSV, HTML
- Length: "under 200 words" or "5-7 paragraphs"
- Tone: casual, formal, technical, ELI5
- Structure: Executive summary + details, pros/cons format, step-by-step

**Example:**
```
Return as a numbered list with 1-2 sentence explanations. 
Format: [Problem]: [Concise Solution]
```

### 4. Set Tone & Audience
**Calibrate** the communication style for your specific need.

**Specify:**
- Audience level: expert, beginner, children, mixed
- Tone: professional, casual, humorous, urgent, diplomatic
- Language style: simple, technical, persuasive, educational
- Formality: formal/informal

**Example:**
```
Explain this to my 8-year-old so they actually understand. 
Use analogies from their daily life (video games, sports, school).
```

### 5. Use Examples & Analogies
**Ground** abstract concepts in concrete, relatable examples.

**Provide:**
- 2-3 examples of what you want (positive examples)
- Examples of what you don't want (negative examples)
- Analogies that bridge to their experience
- Real-world scenarios they can visualize

**Example:**
```
I want energizing subject lines that create urgency without feeling pushy.

Good examples: "Last spots available for Thursday's workshop"
Bad examples: "URGENT! ACT NOW!!!!"

Think: curiosity + scarcity + benefit (but never all-caps panic)
```

### 6. Chain Prompts Together
**Sequence** multiple prompts instead of one massive request.

**Strategy:**
1. First prompt: Generate raw ideas/content
2. Second prompt: Refine based on feedback
3. Third prompt: Reformat, expand, or adjust tone
4. Build on outputs progressively

**Example:**
```
Prompt 1: Generate 10 blog post ideas on [topic]
Prompt 2: Expand the top 3 into 2-sentence descriptions
Prompt 3: Turn one into a full outline with this structure...
```

### 7. Set Strict Word Limits
**Enforce constraints** to keep responses focused and scannable.

**How:**
- "Under 150 words" forces clarity
- "No more than 3 bullet points per section"
- "Keep each explanation to one sentence"
- Use for emails, summaries, social posts, headlines

**Example:**
```
Write a professional email asking for a deadline extension.
Maximum 75 words. No jargon.
```

### 8. Ask for Multiple Options
**Get variety** instead of single answers, then pick the best.

**Patterns:**
- "Give me 3 different ways to approach this"
- "Provide 5 subject line options"
- "Generate 3 competing strategies with pros/cons for each"
- "Write 2 versions: one formal, one conversational"

**Example:**
```
Give me 5 different LinkedIn post angles on this achievement. 
Rank them by likely engagement.
```

### 9. Request Step-by-Step Reasoning
**Unlock detailed thinking** instead of just final answers.

**Trigger words:**
- "Walk me through your thinking"
- "Show your work"
- "What's your reasoning here?"
- "Break this down step-by-step"
- "Explain the logic behind this"

**Example:**
```
I'm negotiating salary. Walk me through your reasoning on what's 
market rate for [role] in [location] with [experience].
```

### 10. Define Your Goal Upfront
**Clarify desired outcomes** so responses stay focused.

**State explicitly:**
- What decision are you making?
- What action will this enable?
- What's success?
- What's the deadline?
- Who else is involved?

**Example:**
```
Goal: I'm deciding whether to leave my job. Give me a framework 
to evaluate the tradeoffs, not advice on what to do. I need to 
make a decision by Friday.
```

---

## The Prompt Engineering Workflow

1. **Choose your persona** → Who should respond?
2. **Add context** → What do they need to know?
3. **Specify format** → How should it be structured?
4. **Set tone** → What's the communication style?
5. **Provide examples** → Show, don't just tell
6. **Define the goal** → What are you actually trying to achieve?
7. **Use constraints** → Keep it focused
8. **Ask for alternatives** → Don't accept the first answer
9. **Request reasoning** → Understand the thinking
10. **Chain if needed** → Build progressively

---

## Real-World Example: Before & After

**❌ Weak Prompt:**
```
Help me write a resignation letter.
```

**✅ Strong Prompt:**
```
You are an HR professional who has seen hundreds of resignations. 
I'm leaving my job on good terms and want to maintain relationships. 

Write a resignation letter that:
- Is formal but warm (we genuinely like the company)
- Gives 2 weeks notice (last day: [date])
- Offers to help with transition
- Positions me well for future opportunities
- Is under 200 words

Tone: Professional but human. No corporate jargon.
Format: Ready to copy/paste with [brackets] for personalization.
```

**The difference:** Context + format + tone + constraints = dramatically better output.
