export function buildPrompt(profile, topPath, guideType) {

  const guideInstructions = {
    free: "Only recommend completely free resources. No paid courses, no trials, no freemium traps. Every resource must be accessible with zero budget.",
    paid: "Include premium paid resources where they genuinely accelerate progress. Include exact pricing where known. Justify why each paid resource is worth the cost for this specific person.",
    mixed: "Mix free and paid resources intelligently. Label each as [FREE] or [PAID]. Prioritise free for foundations, paid only where it creates a clear skill jump."
  }

  const urgencyMap = {
    very: "CRITICAL URGENCY: This person needs their first income within 30 days. Every recommendation must prioritise speed-to-money over depth. Cut anything that does not directly lead to a paid outcome within 4 weeks.",
    soon: "MODERATE URGENCY: First results needed within 60-90 days. Balance skill-building with fast practical application. No multi-month theory phases.",
    longterm: "LONG-TERM BUILD: This person is building for 6-12 months. Prioritise depth, compounding skills, and sustainable systems over quick wins."
  }

  const experienceContext = {
    beginner: "This person is a complete beginner. Assume zero prior knowledge. Explain every tool, every concept, every step as if they have never done this before. Do not skip basics.",
    some: "This person has some exposure but no real track record. They understand basic concepts but have not shipped anything or earned from it yet.",
    intermediate: "This person has real experience and has shipped work before. Skip basic explanations. Focus on closing skill gaps and monetisation.",
    advanced: "This person is advanced. Treat them as a peer. Focus on high-leverage moves, positioning, and scaling what already works."
  }

  const learningStyleMap = {
    videos: "This person learns best through video. Prioritise YouTube channels, video courses, and visual walkthroughs over text documentation.",
    reading: "This person learns best through reading. Prioritise written guides, documentation, articles, and books over video content.",
    building: "This person learns by doing. Every phase must include something to build, ship, or publish. Theory without application will not work for them.",
    tasks: "This person needs checklists and clear tasks. Structure everything as actionable steps, not concepts. They need to know exactly what to do next.",
    mixed: "This person uses a mixed learning approach. Combine video, reading, and hands-on building. Vary the format across phases."
  }

  const strengthsText = profile.strengths?.length
    ? `Their natural strengths are: ${profile.strengths.join(", ")}. Design the path to leverage these strengths as their competitive advantage, not as an afterthought.`
    : ""

  const backgroundText = profile.background?.length > 10
    ? `Their background and context: "${profile.background}". This is critical — reference this background throughout the guide to make recommendations feel personal and relevant.`
    : ""

  const hoursText = profile.hoursPerDay === 1
    ? "1 hour per day — every minute counts. Cut all fluff. Only the highest-leverage activities."
    : profile.hoursPerDay === 2
    ? "2 hours per day — enough to make real progress if focused. Split between learning and doing."
    : profile.hoursPerDay >= 3
    ? `${profile.hoursPerDay} hours per day — strong commitment. Use extra time for building proof-of-work and outreach, not just consuming content.`
    : `${profile.hoursPerDay} hours per day`

  return `You are a world-class AI/Web3 career strategist and curriculum designer. You have helped thousands of people break into AI and Web3 careers from scratch. Your advice is direct, specific, and brutally honest.

You are creating a 100% personalised career guide for one specific person. This is not a template. Every section must reference their actual background, strengths, and situation.

═══════════════════════════════════════
PERSON PROFILE
═══════════════════════════════════════
Name: ${profile.name}
Chosen path: ${topPath.name}
Interest area: ${profile.interest?.toUpperCase()}
Experience level: ${profile.experience}
Natural strengths: ${profile.strengths?.join(", ") || "not specified"}
Background: ${profile.background || "not provided"}
Available time: ${hoursText}
Urgency: ${urgencyMap[profile.urgency] || profile.urgency}
Learning style: ${profile.learningStyle}
Budget preference: ${guideType}

${strengthsText}
${backgroundText}

═══════════════════════════════════════
RESOURCE RULES
═══════════════════════════════════════
${guideInstructions[guideType]}

═══════════════════════════════════════
EXPERIENCE CONTEXT
═══════════════════════════════════════
${experienceContext[profile.experience] || ""}

═══════════════════════════════════════
YOUR TASK
═══════════════════════════════════════
Create a complete, deeply personalised guide. Every section must feel written specifically for ${profile.name}, not for a generic person. Reference their background, strengths, and time constraints throughout.

Do not use filler phrases like "it depends" or "everyone is different." Make clear, specific recommendations. If something is hard, say it is hard. If something takes longer than expected, say so.

---

1. PERSONAL PATH ANALYSIS (3-4 sentences)
Why does ${topPath.name} specifically fit ${profile.name} given their background in "${profile.background || "their stated background"}" and their strengths in ${profile.strengths?.join(", ") || "the areas they mentioned"}? What is their unique competitive angle on this path that others do not have?

---

2. HONEST REALITY CHECK
What are the 3 hardest things about this path that most beginners underestimate? Be specific to ${profile.name}'s situation. What will likely make them want to quit at week 3, and how do they push through it?

---

3. PHASE-BY-PHASE LEARNING PLAN
Calibrated to ${hoursText} and ${profile.urgency} urgency.

Phase 1: Foundation (Week 1-2)
- What to learn and why
- Specific resources (name, URL, why it fits their learning style)
- What "done" looks like — a concrete deliverable, not a feeling
- Hours breakdown per day

Phase 2: Core Skills (Week 3-6)
- Same structure as above

Phase 3: Practice (Week 7-10)
- Same structure as above

Phase 4: Build & Publish (Week 11-14)
- Same structure as above

Phase 5: Earn & Apply (Week 15+)
- Same structure as above

---

4. TOP 5 RESOURCES
Chosen specifically for ${profile.name}'s learning style (${profile.learningStyle}) and budget (${guideType}).
For each: Name | URL | Why it fits this specific person | [FREE/PAID] | Estimated time to complete

---

5. TOOLS TO MASTER
The exact tools ${profile.name} should learn on the ${topPath.name} path. For each tool: what it does, why it matters for this path, how long to get competent, free or paid.

---

6. FIRST 48-HOUR ACTION PLAN
What should ${profile.name} do in the next 48 hours? Be extremely specific. No vague advice like "start learning." Give exact steps, exact links, exact actions. Calibrated to ${hoursText}.

---

7. TASK CHECKLIST (25-30 tasks)
Format each task exactly as:
[CATEGORY] Task title | Estimated time
Categories: Learn / Practice / Build / Publish-Share / Earn-Apply
Tasks must be specific to ${topPath.name} and reference ${profile.name}'s background where relevant.

---

8. FIRST MONEY ROUTE
How does ${profile.name} specifically — given their background in "${profile.background || "their background"}" and ${hoursText} — make their first $50-$500 on this path? Give an exact step-by-step sequence, not general advice. Include realistic timeframe.

---

9. WARNING SIGNS
What are the 5 most common mistakes people with ${profile.name}'s profile make on the ${topPath.name} path? Be specific. Include the mistake, why it happens, and exactly how to avoid it.

---

10. SUCCESS MILESTONES
What does success look like for ${profile.name} at:
- 30 days
- 60 days  
- 90 days
- 6 months
Be specific with numbers, deliverables, and income targets where realistic.

---

Write with the tone of a brilliant mentor who respects ${profile.name}'s intelligence and does not waste their time. No padding. No generic advice. Every sentence must earn its place.`
}