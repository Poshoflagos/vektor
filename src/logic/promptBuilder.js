// src/logic/promptBuilder.js
// Builds the external LLM prompt used by VEKTÖR V1.
// The output contract is strict so PasteResult can validate and parse it.

import { AI_WEB3_OPPORTUNITIES, getPathById } from "../data/paths";

const DEFAULT_GUIDE_TYPE = "free";

const GUIDE_RULES = {
  free:
    "Recommend only completely free resources. No paid courses, no trials requiring cards, no freemium traps. If a paid tool is unavoidable, explain the free workaround instead.",
  paid:
    "Premium resources are allowed only where they create measurable acceleration. Include price estimates where known, but do not invent exact prices. Explain why each paid resource is worth it.",
  mixed:
    "Use free resources for foundations. Include paid resources only when they create a clear skill or income acceleration. Label every resource as [FREE] or [PAID].",
};

const URGENCY_RULES = {
  very:
    "The user needs visible results within 30 days. Prioritize fast proof-of-work, outreach, portfolio samples, small paid offers, and direct execution. Remove low-leverage theory.",
  soon:
    "The user wants results in 60-90 days. Balance learning with execution. Every week must produce something visible: a demo, report, dashboard, content asset, pitch, or case study.",
  longterm:
    "The user is building for 6-12 months. Depth is acceptable, but every month must still produce visible proof-of-work.",
};

const EXPERIENCE_RULES = {
  beginner:
    "The user is a beginner. Define acronyms, avoid hidden assumptions, and give step-by-step actions.",
  some:
    "The user has some exposure but no strong track record. Skip generic motivation and focus on converting knowledge into proof-of-work.",
  intermediate:
    "The user has working familiarity. Do not over-explain basics. Focus on gaps, execution, positioning, and monetization.",
  advanced:
    "The user is advanced. Treat them like a peer. Focus on leverage, differentiation, credibility, and top-tier execution.",
};

const LEARNING_STYLE_RULES = {
  videos:
    "The user prefers videos. Prioritize YouTube, walkthroughs, demos, and visual explanations.",
  reading:
    "The user prefers reading. Prioritize documentation, essays, reports, books, and written guides.",
  building:
    "The user learns by building. Every learning item must pair with a build task.",
  tasks:
    "The user wants checklists. Make tasks specific, numbered, and action-oriented.",
  mixed:
    "The user has a mixed learning style. Combine short reading, video, and practical building.",
};

function normalizeText(value, fallback = "Not specified") {
  if (value === null || value === undefined || value === "") return fallback;

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : fallback;
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function getPath(selectedPath) {
  if (!selectedPath) return null;

  if (typeof selectedPath === "object") return selectedPath;

  return (
    getPathById?.(selectedPath) ||
    AI_WEB3_OPPORTUNITIES.find(
      (path) =>
        path.pathId === selectedPath ||
        path.id === selectedPath ||
        path.name === selectedPath ||
        path.title === selectedPath
    ) ||
    null
  );
}

function getHoursText(profile = {}) {
  const rawHours = Number(profile.hoursPerDay || profile.availableTime || profile.timePerDay || 0);

  if (!rawHours) return "Not specified";

  if (rawHours === 1) {
    return "1 hour per day. Every task must be small, direct, and high leverage.";
  }

  if (rawHours === 2) {
    return "2 hours per day. Split between learning, building, and outreach.";
  }

  if (rawHours >= 3) {
    return `${rawHours} hours per day. Use extra time for proof-of-work, publishing, and outreach, not endless consumption.`;
  }

  return `${rawHours} hours per day.`;
}

function buildPathContext(path) {
  if (!path) {
    return `
SELECTED PATH:
- Name: Selected Path
- Description: Not available
- Required skills: Not available
- Ideal for: Not available
- Timeline: Not available
- Income potential: Not available
- Difficulty: Not available
`;
  }

  return `
SELECTED PATH:
- ID: ${normalizeText(path.id || path.pathId)}
- Name: ${normalizeText(path.title || path.name)}
- Category: ${normalizeText(path.category)}
- Subcategory: ${normalizeText(path.subcategory)}
- Type: ${normalizeText(path.type || path.pathType)}
- Description: ${normalizeText(path.description || path.firstMoneyRoute || path.whyItFits)}
- Required skills: ${normalizeText(path.requiredSkills || path.skillsNeeded)}
- Ideal for: ${normalizeText(path.idealFor || path.bestFor)}
- Tools to learn: ${normalizeText(path.tools || path.toolsToLearn)}
- Minimum proof-of-work: ${normalizeText(path.proofOfWork || path.minimumProofOfWork)}
- Estimated timeline: ${normalizeText(path.estimatedMonths || path.timeline)}
- Income potential: ${normalizeText(path.incomePotential || path.earningPotential)}
- Difficulty: ${normalizeText(path.difficulty)}
- First 7 days from database: ${normalizeText(path.first7Days)}
- First 30 days from database: ${normalizeText(path.first30Days)}
- Next 90 days from database: ${normalizeText(path.next90Days)}
- Risks: ${normalizeText(path.risks)}
`;
}

function buildProfileContext(profile = {}) {
  return `
USER PROFILE:
- Name: ${normalizeText(profile.name || profile.fullName || profile.username)}
- Interest area: ${normalizeText(profile.interestArea || profile.interests || profile.primaryInterest)}
- Experience level: ${normalizeText(profile.experienceLevel || profile.experience)}
- Natural strengths: ${normalizeText(profile.strengths || profile.naturalStrengths)}
- Background: ${normalizeText(profile.background)}
- Available time: ${getHoursText(profile)}
- Urgency: ${normalizeText(profile.urgency)}
- Learning style: ${normalizeText(profile.learningStyle)}
- Budget: ${normalizeText(profile.budget)}
- Main goal: ${normalizeText(profile.goal || profile.mainGoal)}
- Constraints: ${normalizeText(profile.constraints)}
`;
}

export function buildPrompt(profile = {}, selectedPath = null, guideType = DEFAULT_GUIDE_TYPE) {
  const guide = guideType || DEFAULT_GUIDE_TYPE;
  const path = getPath(selectedPath);

  const budgetRule = GUIDE_RULES[guide] || GUIDE_RULES.free;
  const urgencyRule = URGENCY_RULES[profile.urgency] || normalizeText(profile.urgency);
  const experienceRule =
    EXPERIENCE_RULES[profile.experienceLevel] ||
    EXPERIENCE_RULES[profile.experience] ||
    normalizeText(profile.experienceLevel || profile.experience);
  const learningRule =
    LEARNING_STYLE_RULES[profile.learningStyle] || normalizeText(profile.learningStyle);

  return `You are generating a VEKTÖR V1 career execution guide.

CRITICAL OUTPUT CONTRACT:
1. Your response must start with exactly this line and nothing before it:
VEKTOR_GUIDE_V1
2. Do not wrap the JSON in markdown fences.
3. Do not include commentary before the marker.
4. Do not include commentary after the closing JSON brace.
5. If you cannot generate a valid guide, output only:
VEKTOR_GUIDE_ERROR
REASON: [plain English reason]
6. The guide must include TRACKER_JSON exactly once.
7. TRACKER_JSON must be valid JSON.
8. The JSON must contain phases -> weeks -> tasks.
9. Every task must be concrete, trackable, and written as an action.
10. Do not invent impossible income guarantees.
11. Do not recommend dangerous, illegal, or unethical activity.
12. Do not ask the user to provide private keys, seed phrases, passwords, or confidential credentials.

MARKET CONTEXT:
- The year is 2026.
- Prompt engineering alone is commoditized. Practical workflows, domain expertise, proof-of-work, and distribution matter more.
- AI/Web3 opportunities reward visible execution: demos, dashboards, reports, systems, published analysis, community work, and client outcomes.
- For Web3, prioritize credible research, security awareness, user education, analytics, community operations, and protocol-facing proof.
- For AI, prioritize automation workflows, research systems, productized services, applied content systems, and measurable business outcomes.

GUIDE TYPE:
${guide}

BUDGET RULE:
${budgetRule}

URGENCY RULE:
${urgencyRule}

EXPERIENCE RULE:
${experienceRule}

LEARNING STYLE RULE:
${learningRule}

${buildProfileContext(profile)}

${buildPathContext(path)}

OUTPUT STRUCTURE:
Your entire response must follow this exact structure:

VEKTOR_GUIDE_V1

GUIDE_TITLE:
[Create a specific title based on the selected path and user profile]

RECOMMENDED_PATH:
[Selected path name]

USER_LEVEL:
[beginner | intermediate | advanced]

SUMMARY:
[Write 4-6 sentences explaining why this path fits the user, what they should focus on, and the main execution risk.]

EXECUTION_RULES:
- [Rule 1]
- [Rule 2]
- [Rule 3]
- [Rule 4]
- [Rule 5]

TRACKER_JSON:
{
  "guideType": "VEKTOR_GUIDE_V1",
  "guideTitle": "string",
  "recommendedPath": "string",
  "userLevel": "beginner | intermediate | advanced",
  "summary": "string",
  "createdFor": {
    "name": "string",
    "experienceLevel": "string",
    "availableTime": "string",
    "urgency": "string",
    "budget": "string",
    "learningStyle": "string"
  },
  "phases": [
    {
      "phaseId": "phase-1",
      "phaseTitle": "Foundation",
      "phaseGoal": "string",
      "weeks": [
        {
          "weekId": "phase-1-week-1",
          "weekTitle": "Week 1",
          "weekGoal": "string",
          "tasks": [
            {
              "taskId": "phase-1-week-1-task-1",
              "title": "string",
              "category": "Learning | Building | Research | Outreach | Content | Portfolio | Review",
              "description": "string",
              "completionCriteria": "string",
              "estimatedTime": "string"
            }
          ]
        }
      ]
    }
  ],
  "milestones": [
    {
      "milestoneId": "milestone-1",
      "title": "string",
      "targetDate": "string",
      "proofRequired": "string"
    }
  ],
  "resources": [
    {
      "resourceId": "resource-1",
      "title": "string",
      "type": "video | article | documentation | tool | course | community | dataset",
      "cost": "FREE | PAID | MIXED",
      "reason": "string"
    }
  ],
  "risks": [
    {
      "riskId": "risk-1",
      "risk": "string",
      "mitigation": "string"
    }
  ],
  "firstAction": "string"
}

CONTENT REQUIREMENTS:
- Create 3 to 5 phases.
- Each phase must contain 1 to 4 weeks.
- Each week must contain 3 to 7 tasks.
- Do not include "completed" fields in tasks.
- Do not include trailing commas in JSON.
- Use double quotes only inside JSON.
- Keep task IDs unique.
- Make categories consistent.
- Completion criteria must be observable.
- Include at least one outreach, publishing, or proof-of-work task per week unless the selected path is deeply technical.
- For beginner users, include foundational explanations but still force output.
- For urgent users, compress learning and increase execution.
- For free-budget users, use free resources only.

FINAL CHECK BEFORE ANSWERING:
Before sending the final response, silently verify:
- First line is VEKTOR_GUIDE_V1.
- TRACKER_JSON exists exactly once.
- JSON is valid.
- JSON starts with { and ends with }.
- There is no text after the final closing JSON brace.
`;
}

export default buildPrompt;