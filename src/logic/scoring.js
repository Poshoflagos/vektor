import { rankPathsForUser, getRecommendationBundle } from "../data/paths"

function mapProfile(profile) {
  const interestMap = {
    ai: ["AI tools", "automation", "content", "AI systems", "productivity"],
    web3: ["crypto", "DeFi", "Web3", "community", "governance"],
    both: ["AI tools", "automation", "content", "crypto", "DeFi", "Web3", "community"]
  }

  const strengthToSkill = {
    writing: ["writing", "content", "research"],
    research: ["research", "synthesis", "ai"],
    community: ["community", "discord", "moderation"],
    design: ["design", "ui"],
    coding: ["python", "javascript", "solidity", "no-code"],
    trading: ["trading", "defi", "risk-analysis"],
    organizing: ["ops", "documentation", "sop", "operations"],
    notsure: []
  }

  const skills = []
  ;(profile.strengths || []).forEach(s => {
    const mapped = strengthToSkill[s] || []
    skills.push(...mapped)
  })

  const capitalMap = { free: "None", mixed: "Low", paid: "Medium" }
  const technicalMap = {
    beginner: "None",
    some: "Low",
    intermediate: "Medium",
    advanced: "High"
  }
  const urgencyMap = {
    very: "Immediate",
    soon: "30-60 days",
    longterm: "3-6 months"
  }

  return {
    skills,
    interests: interestMap[profile.interest] || [],
    personality: [],
    weeklyHours: (profile.hoursPerDay || 1) * 7,
    capitalLevel: capitalMap[profile.budget] || "Low",
    technicalLevel: technicalMap[profile.experience] || "Low",
    urgency: urgencyMap[profile.urgency] || "30-60 days",
    prefers: profile.budget === "free" ? ["freelance", "creator", "research"] : ["freelance", "startup", "career"],
    avoids: [],
    needsBeginnerFriendly: profile.experience === "beginner" || profile.experience === "some",
    riskTolerance: profile.urgency === "very" ? "Low" : profile.urgency === "longterm" ? "High" : "Medium",
    // FIX: add raw interest field for the filter in paths.js
    interest: profile.interest || ""
  }
}

export function calculatePathScores(profile) {
  const mapped = mapProfile(profile)
  const ranked = rankPathsForUser(mapped)
  const scores = {}
  ranked.forEach(p => {
    scores[p.pathId] = Math.round(p.fitScore * 10)
  })
  return scores
}

export function getTop3Paths(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return {
    best: sorted[0],
    alternative: sorted[1],
    stretch: sorted[2]
  }
}

export function getRecommendedBundle(profile) {
  const mapped = mapProfile(profile)
  return getRecommendationBundle(mapped)
}

export function getMainRecommendation(profile, scores) {
  const aiKeys = Object.keys(scores).filter(k => k.startsWith("ai-"))
  const web3Keys = Object.keys(scores).filter(k => k.startsWith("web3") || k.startsWith("on-chain") || k.startsWith("defi") || k.startsWith("dao") || k.startsWith("tokenomics") || k.startsWith("crypto") || k.startsWith("stablecoin") || k.startsWith("zk") || k.startsWith("protocol"))
  const aiTotal = aiKeys.reduce((sum, k) => sum + (scores[k] || 0), 0)
  const web3Total = web3Keys.reduce((sum, k) => sum + (scores[k] || 0), 0)

  if (profile.experience === "beginner" && profile.strengths?.includes("notsure")) return "foundations"
  if (profile.interest === "both" && profile.hoursPerDay >= 3) return "both"
  if (aiTotal > web3Total + 30) return "ai"
  if (web3Total > aiTotal + 30) return "web3"
  return "both"
}