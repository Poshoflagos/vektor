import { AI_WEB3_OPPORTUNITIES } from "../data/paths"

export function buildPrompt(profile, selectedPath, guideType) {
  const guide = guideType || "free"

  const path =
    typeof selectedPath === "object" && selectedPath !== null
      ? selectedPath
      : AI_WEB3_OPPORTUNITIES.find(p => p.pathId === selectedPath)

  const pathName =
    path?.name ||
    (typeof selectedPath === "string" ? selectedPath : "Selected Path")

  const guideInstructions = {
    free: "BUDGET RULE: Recommend ONLY completely free resources. No paid courses, no trials that require credit cards, no freemium traps. Every single resource must be accessible with zero money. If you cannot find a free version, say so honestly and suggest the closest free alternative.",
    paid: "BUDGET RULE: Include premium paid resources where they create genuine acceleration. Include exact current pricing. For every paid resource, write one sentence justifying why it is worth the cost specifically for this person's situation and goals. Do not recommend paid resources just to fill space.",
    mixed: "BUDGET RULE: Use free resources for foundations, paid only where they create a clear, measurable skill jump. Label every resource [FREE] or [PAID]. Never recommend a paid resource without explaining what the free alternative is and why it falls short."
  }

  const urgencyMap = {
    very: "URGENCY LEVEL — CRITICAL (30 days to first income): Every recommendation must be filtered through one question: does this directly lead to a paid outcome within 4 weeks? Remove anything that does not. Skip theory phases entirely. Start with the minimum viable skill set to charge for something. This person cannot afford to spend weeks learning before earning.",
    soon: "URGENCY LEVEL — MODERATE (60-90 days to first results): Balance skill-building with fast application. No phase should be longer than 2 weeks before producing something tangible. Every week must end with a deliverable that could be shown to a potential client.",
    longterm: "URGENCY LEVEL — LONG-TERM BUILD (6-12 months): Prioritise depth and compounding skills. It is acceptable to spend time on fundamentals. But every month must still produce visible proof-of-work. Depth without output is invisible."
  }

  const experienceContext = {
    beginner: "EXPERIENCE CONTEXT: Complete beginner. Assume zero prior knowledge of AI tools, Web3, or the industry. Define every acronym on first use. Explain why each tool exists before explaining how to use it. Do not skip steps that feel obvious — what is obvious to an expert is invisible to a beginner.",
    some: "EXPERIENCE CONTEXT: Some exposure, no track record. They understand surface-level concepts but have not shipped work or earned from this skill yet. Skip the very basics. Focus on the gap between knowing about something and actually doing it professionally.",
    intermediate: "EXPERIENCE CONTEXT: Real experience, some track record. They have shipped work before. Do not explain fundamentals. Focus entirely on closing the specific gaps between their current level and the income targets on this path.",
    advanced: "EXPERIENCE CONTEXT: Advanced practitioner. Treat them as a peer. Skip all foundational content. Focus on positioning, high-leverage moves, scaling existing skills, and finding the specific edge that separates top 10% earners from the rest on this path."
  }

  const learningStyleMap = {
    videos: "LEARNING STYLE: Video-first learner. Prioritise YouTube channels, structured video courses, and visual demonstrations. For every concept, lead with the best video resource. Only suggest text/documentation as a supplement.",
    reading: "LEARNING STYLE: Reading-first learner. Prioritise written guides, official documentation, long-form articles, newsletters, and books. Suggest video content only where text resources genuinely do not exist.",
    building: "LEARNING STYLE: Build-first learner. Every phase must include something to create, ship, or publish. Do not recommend consuming content without a corresponding build task. Theory without a project is wasted for this person.",
    tasks: "LEARNING STYLE: Checklist-driven learner. Structure everything as numbered action steps. Do not explain concepts in paragraph form — convert every concept into a task. This person needs to know exactly what to do next, not what to think about.",
    mixed: "LEARNING STYLE: Mixed learner. Alternate between video, reading, and hands-on projects. No more than 3 consecutive days on any single format. Variety is not optional for this person — monotony kills their momentum."
  }

  const hoursText = profile.hoursPerDay === 1
    ? "1 hour per day (treat every minute as non-renewable — zero tolerance for low-leverage activities)"
    : profile.hoursPerDay === 2
    ? "2 hours per day (split: 45 mins learning, 75 mins doing/building)"
    : profile.hoursPerDay >= 3
    ? `${profile.hoursPerDay} hours per day (use extra time for building proof-of-work and outreach, not more content consumption)`
    : `${profile.hoursPerDay} hours per day`

  const market2026 = `
CRITICAL 2026 MARKET CONTEXT — READ BEFORE WRITING:
The AI/Web3 landscape has shifted significantly. These facts must inform every recommendation:

AI MARKET 2026:
- Prompt engineering as a standalone skill has commoditised — the market now pays for AI + domain expertise combinations
- The highest-paying AI roles in 2026 combine AI tool proficiency with a vertical (legal, medical, finance, marketing, Web3)
- AI agents and automation workflows (n8n, Make.com, Zapier + AI) are the fastest-growing freelance category
- Video AI tools (Sora, Runway, Kling) have created an entirely new content production category
- Companies are paying $500-5000/month for AI workflow consultants who can audit and automate their operations
- The "AI wrapper" business model (building products on top of GPT/Claude APIs) is now saturated at the basic level — differentiation requires deep domain knowledge

WEB3 MARKET 2026:
- DeFi has matured — most protocols now pay community managers $2000-8000/month in tokens + stablecoins
- The best-paid Web3 writers in 2026 specialise: DeFi mechanics, L2 infrastructure, or RWA (Real World Assets)
- NFTs as profile pictures are dead — NFTs as utility (ticketing, credentials, memberships) are growing
- Account abstraction and wallet UX improvements have made Web3 more accessible — community management is harder because users expect Web2-level experience
- The biggest Web3 opportunity in 2026 for non-technical people: protocol documentation, user education content, and onboarding flows
- L2 ecosystem wars (Base, Arbitrum, Optimism, zkSync) are creating sustained demand for ecosystem contributors
`

  return `You are a world-class AI/Web3 career strategist writing in May 2026. You have a precise understanding of what the market is actually paying for right now, not what it was paying 2 years ago.

You are creating a single comprehensive document for one specific person. This is not a template filled with their name. Every recommendation must be genuinely calibrated to their background, strengths, time, and urgency.

${market2026}

═══════════════════════════════════════════════════
PERSON PROFILE — READ EVERY LINE BEFORE WRITING
═══════════════════════════════════════════════════
Full name: ${profile.name}
Chosen career path: ${pathName}
Primary interest: ${profile.interest?.toUpperCase()}
Experience level: ${profile.experience}
Natural strengths: ${profile.strengths?.join(", ") || "not specified"}
Background: ${profile.background || "not provided"}
Available time: ${hoursText}
Budget: ${guide}
Learning style: ${profile.learningStyle}

${profile.strengths?.length ? `STRENGTHS INSTRUCTION: Their strengths (${profile.strengths.join(", ")}) are not background information — they are the competitive advantage you must design the entire path around. Where can these strengths make them 10x faster than someone starting from zero?` : ""}

${profile.background?.length > 10 ? `BACKGROUND INSTRUCTION: "${profile.background}" — this is the most important line in this profile. Find the transferable value in this background. Every person has an unfair advantage from their past. Find theirs and make it the centre of their positioning strategy.` : ""}

═══════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════
${guideInstructions[guide] || guideInstructions.free}
${urgencyMap[profile.urgency] || ""}
${experienceContext[profile.experience] || ""}
${learningStyleMap[profile.learningStyle] || ""}

═══════════════════════════════════════════════════
QUALITY STANDARDS — NON-NEGOTIABLE
═══════════════════════════════════════════════════
- Never use the phrase "it depends" without immediately saying what it depends on and giving a specific answer
- Never recommend a resource without a URL or clear way to find it
- Never give a time estimate without explaining the assumptions behind it
- Never say "consider doing X" — say "do X" or "do not do X"
- If you are about to write something that applies to every person on this path, stop and rewrite it to apply specifically to ${profile.name}
- Every income figure must be sourced from 2025-2026 market data, not aspirational thinking
- If a path has a known failure rate or common trap, name it explicitly

═══════════════════════════════════════════════════
OUTPUT FORMAT — FOLLOW EXACTLY
═══════════════════════════════════════════════════
Use these exact section headers. Do not add sections. Do not skip sections.

---SECTION-1-PATH-ANALYSIS---
---SECTION-2-REALITY-CHECK---
---SECTION-3-LEARNING-PLAN---
---SECTION-4-RESOURCES---
---SECTION-5-TOOLS---
---SECTION-6-48HR-PLAN---
---SECTION-7-TASK-CHECKLIST---
---SECTION-8-FIRST-MONEY---
---SECTION-9-WARNINGS---
---SECTION-10-MILESTONES---
---SECTION-11-STUDY-CURRICULUM---

These markers allow VEKTÖR to parse and display each section correctly. Do not omit them.

═══════════════════════════════════════════════════
CONTENT INSTRUCTIONS PER SECTION
═══════════════════════════════════════════════════

---SECTION-1-PATH-ANALYSIS---
PERSONAL PATH ANALYSIS
Write 4-5 sentences. Answer: Why does ${pathName} fit ${profile.name} specifically — not generally? What does their background in "${profile.background || "their stated background"}" give them that someone starting from zero does not have? What is their single strongest competitive angle on this path in 2026?

---SECTION-2-REALITY-CHECK---
HONEST REALITY CHECK
Three things. For each: the hard truth, why it catches people with ${profile.name}'s profile specifically, and the exact counter-move.
1. The thing that makes most people quit at week 3 on this path
2. The income expectation gap (what people think they will earn vs what they actually earn in month 1-3)
3. The skill they think they need but do not, and the skill they do not know they need but do

---SECTION-3-LEARNING-PLAN---
PHASE-BY-PHASE LEARNING PLAN
Calibrated to: ${hoursText} | ${profile.urgency} urgency | ${profile.learningStyle} learning style

For each phase write:
PHASE NAME & DURATION:
GOAL: (one sentence — what this phase produces)
DAILY SCHEDULE: (exact hour-by-hour breakdown for ${profile.hoursPerDay} hours)
RESOURCES: (name, URL, why this one for this person)
WEEK-END DELIVERABLE: (the specific thing they must have built/published/sent by end of phase)
PHASE COMPLETE WHEN: (measurable criteria, not a feeling)

Phase 1: Foundation
Phase 2: Core Skills  
Phase 3: Practice
Phase 4: Build and Publish
Phase 5: Earn and Apply

---SECTION-4-RESOURCES---
TOP 5 RESOURCES
Chosen for: ${profile.learningStyle} learning style + ${guide} budget + ${pathName} path
Format each as:
RESOURCE NAME:
URL:
WHY FOR ${profile.name.toUpperCase()} SPECIFICALLY:
COST: [FREE/PAID — exact price if paid]
TIME TO COMPLETE:
WHAT TO DO WITH IT AFTER: (how to apply what they learned immediately)

---SECTION-5-TOOLS---
TOOLS TO MASTER IN 2026
The exact tools that pay on the ${pathName} path right now. Not tools from 2022.
For each: Tool name | What it does | Why it matters for this path in 2026 | Time to basic competency | Free or Paid | Priority (learn first / learn later)

---SECTION-6-48HR-PLAN---
FIRST 48 HOURS — EXACT ACTIONS
${profile.name} opens this guide right now. What do they do?
Write numbered steps. Each step has: the action, the exact link or command, and how long it takes.
Total time must fit within ${profile.hoursPerDay * 2} hours across 2 days.
No step can be vague. "Research X" is not a step. "Open [URL], read [specific section], do [specific action]" is a step.

---SECTION-7-TASK-CHECKLIST---
COMPLETE TASK CHECKLIST
25-30 tasks. Every task must be specific to ${pathName} in 2026.
Format each task on its own line exactly as:
[CATEGORY] Task title | Estimated time
Categories: Learn / Practice / Build / Publish-Share / Earn-Apply
Tasks must progress logically from foundation to earning. No task should be vague.

---SECTION-8-FIRST-MONEY---
FIRST MONEY ROUTE
How does ${profile.name} — with their background in "${profile.background || "their background"}", ${hoursText}, and ${guide} budget — make their first $50-$500?
Write a numbered sequence. Include:
- The exact platform or channel to use
- The exact offer or service to sell
- The exact pitch or message to send
- Realistic timeframe (be honest — not "day 3" if it is more likely week 6)
- What to do if the first attempt fails

---SECTION-9-WARNINGS---
5 CRITICAL WARNINGS
The 5 mistakes that will cost ${profile.name} the most time and money on this path.
For each:
MISTAKE: (name it plainly)
WHY IT HAPPENS: (the psychological or practical reason)
THE COST: (what it actually costs in time and money)
THE FIX: (the exact counter-behaviour)

---SECTION-10-MILESTONES---
SUCCESS MILESTONES
What does success look like for ${profile.name} at each stage? Be specific with numbers.
30 DAYS: (skill acquired, deliverable produced, income: realistic figure or $0 with explanation)
60 DAYS: (skill level, portfolio pieces, income range)
90 DAYS: (market positioning, client count or job applications, income range)
6 MONTHS: (where they should be career and income-wise if they execute consistently)

---SECTION-11-STUDY-CURRICULUM---
STRUCTURED STUDY CURRICULUM
This section is a standalone learning guide for ${pathName} in 2026.
Designed for self-study. Can be used independently of the career plan above.

CURRICULUM OVERVIEW:
Total duration: X weeks at ${hoursText}
Prerequisite knowledge: (what they must know before starting — be specific)
What this curriculum does NOT cover: (set expectations clearly)

MODULE 1: [Foundation Topic]
- Learning objective: (what they will be able to do after this module)
- Core concepts: (bullet list — concepts only, no fluff)
- Study materials: (specific resources with URLs)
- Practice exercise: (one specific exercise to cement the learning)
- Self-assessment: (how they know they have understood it — a question to answer or task to complete)
- Estimated time: X hours

MODULE 2: [Core Skill 1]
(same structure)

MODULE 3: [Core Skill 2]
(same structure)

MODULE 4: [Core Skill 3]
(same structure)

MODULE 5: [Applied Practice]
(same structure)

MODULE 6: [Portfolio Building]
(same structure)

MODULE 7: [Monetisation & Market Entry]
(same structure)

CURRICULUM COMPLETION TEST:
List 5 questions or tasks. If ${profile.name} can answer/complete all 5, they are ready to charge for this skill.

Write the full content for all modules. Do not abbreviate. Do not say "see resources above." This curriculum must stand alone.`
}