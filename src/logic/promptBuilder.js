import { AI_WEB3_OPPORTUNITIES } from "../data/paths"

export function buildPrompt(profile, pathId, guideType) {
  const path = AI_WEB3_OPPORTUNITIES.find(p => p.pathId === pathId)
  const pathName = path ? path.name : pathId

  const guideInstructions = {
    free: "Only include free resources: YouTube, free courses, free tools. No paid products.",
    paid: "Include paid courses and tools. Mention costs clearly.",
    mixed: "Mix free and paid. Label each resource clearly as FREE or PAID."
  }

  const urgencyMap = {
    very: "The user needs first income in 30–60 days. Prioritize speed.",
    soon: "The user wants results within 3 months. Balance learning with action.",
    longterm: "The user is building for 6–12 months. Prioritize depth."
  }

  const hoursText = `${profile.hoursPerDay} hour${profile.hoursPerDay > 1 ? "s" : ""} per day`

  return `You are a senior AI/Web3 career coach. Create a complete, actionable guide for this specific person.

USER PROFILE:
- Name: ${profile.name}
- Interest area: ${profile.interest?.toUpperCase()}
- Chosen path: ${pathName}
- Experience level: ${profile.experience}
- Natural strengths: ${(profile.strengths || []).join(", ")}
- Background: ${profile.background}
- Available time: ${hoursText}
- Urgency: ${urgencyMap[profile.urgency] || ""}
- Learning style: ${profile.learningStyle}
- Budget: ${guideType}

RESOURCE RULES:
${guideInstructions[guideType]}

YOUR TASK — include ALL sections below:

1. PATH SUMMARY (2-3 sentences — why this path fits ${profile.name} specifically, referencing their background)

2. PHASE-BY-PHASE LEARNING PLAN
- Phase 1: Foundation (Week 1–2)
- Phase 2: Core Skills (Week 3–6)
- Phase 3: Practice (Week 7–10)
- Phase 4: Build & Publish (Week 11–14)
- Phase 5: Earn & Apply (Week 15+)
For each phase: what to learn, specific resources, estimated hours, what done looks like.

3. TOP 5 RESOURCES
(Name, URL, why it's good, FREE or PAID, time to complete)

4. TOOLS TO USE
(Specific tools for this path)

5. FIRST 48-HOUR ACTION PLAN
(Exactly what ${profile.name} should do in the next 48 hours. Be very specific.)

6. TASK CHECKLIST (25–30 tasks)
Format: [CATEGORY] Task title | Estimated time
Categories: Learn / Practice / Build / Publish-Share / Earn-Apply

7. FIRST MONEY ROUTE
(How does ${profile.name} realistically make their first $50–$500 given their background: ${profile.background}?)

8. WARNING SIGNS
(3–5 mistakes beginners make on this path)

9. SUCCESS MILESTONES
(30 days / 60 days / 90 days / 6 months)

Be direct. Be honest. If something is hard, say so. Address ${profile.name} directly throughout.`
}