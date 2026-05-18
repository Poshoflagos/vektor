import { useEffect } from "react"
import { rankPathsForUser, getRecommendationBundle } from "../data/paths"
import { save } from "../logic/storage"

function PathResults({ userProfile, pathScores, setPathScores, recommendedPaths, setRecommendedPaths, setCurrentScreen, setSelectedPath }) {

  useEffect(() => {
    if (userProfile && !recommendedPaths) {
      const profile = {
        skills: userProfile.strengths || [],
        interests: [userProfile.interest, "AI", "Web3"].filter(Boolean),
        personality: [],
        weeklyHours: (userProfile.hoursPerDay || 1) * 7,
        capitalLevel: userProfile.budget === "free" ? "None" : userProfile.budget === "paid" ? "Medium" : "Low",
        technicalLevel: userProfile.experience === "advanced" ? "High" : userProfile.experience === "intermediate" ? "Medium" : "Low",
        urgency: userProfile.urgency === "very" ? "Immediate" : userProfile.urgency === "soon" ? "30-60 days" : "Long-term",
        prefers: [userProfile.interest, userProfile.learningStyle].filter(Boolean),
        avoids: [],
        needsBeginnerFriendly: userProfile.experience === "beginner" || userProfile.experience === "some",
        riskTolerance: userProfile.urgency === "very" ? "Low" : "Medium",
        // ADD the raw interest field for category filtering in paths.js
        interest: userProfile.interest || ""
      }

      const bundle = getRecommendationBundle(profile)
      const ranked = rankPathsForUser(profile)

      const scores = {}
      ranked.forEach(p => { scores[p.pathId] = Math.round(p.fitScore * 10) })

      const top3 = {
        best: [bundle.bestOverallPath?.pathId, scores[bundle.bestOverallPath?.pathId]],
        alternative: [bundle.fastestMoneyPath?.pathId, scores[bundle.fastestMoneyPath?.pathId]],
        stretch: [bundle.highestUpsidePath?.pathId, scores[bundle.highestUpsidePath?.pathId]]
      }

      setPathScores(scores)
      setRecommendedPaths(top3)
      save("scores", scores)
      save("paths", top3)
    }
  }, [userProfile])

  if (!userProfile || !recommendedPaths) return (
    <div style={{ background: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#666", fontFamily: "monospace" }}>Calculating your paths...</p>
    </div>
  )

  const profile = {
    skills: userProfile.strengths || [],
    interests: [userProfile.interest, "AI", "Web3"].filter(Boolean),
    personality: [],
    weeklyHours: (userProfile.hoursPerDay || 1) * 7,
    capitalLevel: userProfile.budget === "free" ? "None" : userProfile.budget === "paid" ? "Medium" : "Low",
    technicalLevel: userProfile.experience === "advanced" ? "High" : userProfile.experience === "intermediate" ? "Medium" : "Low",
    urgency: userProfile.urgency === "very" ? "Immediate" : userProfile.urgency === "soon" ? "30-60 days" : "Long-term",
    prefers: [userProfile.interest, userProfile.learningStyle].filter(Boolean),
    avoids: [],
    needsBeginnerFriendly: userProfile.experience === "beginner" || userProfile.experience === "some",
    riskTolerance: userProfile.urgency === "very" ? "Low" : "Medium",
    // ADD the raw interest field for category filtering
    interest: userProfile.interest || ""
  }

  const bundle = getRecommendationBundle(profile)

  const top3Ids = [
    recommendedPaths.best?.[0],
    recommendedPaths.alternative?.[0],
    recommendedPaths.stretch?.[0]
  ]

  const labels = ["⭐ Best Match", "⚡ Fastest to Money", "🚀 Highest Upside"]

  const paths = top3Ids
    .map(id => bundle.topFive?.find(p => p.pathId === id) || { pathId: id })
    .filter(p => p.pathId)

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <h1 style={styles.title}>Your Path Results</h1>
        <p style={styles.subtitle}>Matched specifically to your profile, strengths and goals</p>

        {bundle?.fastestMoneyPath && (
          <div style={styles.fastMoney}>
            ⚡ Fastest income path for you: <strong style={{ color: "#ffcc00" }}>{bundle.fastestMoneyPath.name}</strong>
          </div>
        )}

        {bundle?.safestBeginnerPath && (
          <div style={styles.safeBox}>
            🛡️ Safest beginner path: <strong style={{ color: "#00aaff" }}>{bundle.safestBeginnerPath.name}</strong>
          </div>
        )}

        <div style={styles.grid}>
          {paths.map((path, i) => (
            <div key={path.pathId} style={styles.card}>
              <p style={styles.label}>{labels[i]}</p>
              <h2 style={styles.pathName}>{path.name || path.pathId}</h2>

              <div style={styles.scoreBar}>
                <div style={{ ...styles.scoreFill, width: `${Math.min(100, (pathScores?.[path.pathId] || 0))}%` }} />
              </div>
              <p style={styles.scoreText}>{pathScores?.[path.pathId] || 0}% fit score</p>

              {path.difficulty && <p style={styles.difficulty}>Difficulty: {path.difficulty}</p>}
              {path.timeline && <p style={styles.meta}>⏱ {path.timeline}</p>}
              {path.firstMoneyRoute && <p style={styles.meta}>💰 {path.firstMoneyRoute}</p>}

              {path.earningPotential && (
                <div style={styles.incomeBox}>
                  <p style={styles.incomeTitle}>REALISTIC EARNINGS</p>
                  <p style={styles.incomeLine}>🌱 Beginner: {path.earningPotential.beginner}</p>
                  <p style={styles.incomeLine}>📈 Early: {path.earningPotential.earlyCompetent}</p>
                  <p style={styles.incomeLine}>💪 Skilled: {path.earningPotential.skilled}</p>
                  <p style={styles.incomeLine}>🏆 Elite: {path.earningPotential.elite}</p>
                </div>
              )}

              {path.whyItFits && <p style={styles.metaGreen}>✅ {path.whyItFits}</p>}
              {path.whyItMayNot && <p style={styles.metaRed}>⚠️ {path.whyItMayNot}</p>}
              {path.beginnerWarning && <p style={styles.warning}>📌 {path.beginnerWarning}</p>}

              <button
                style={styles.chooseBtn}
                onMouseEnter={e => { e.target.style.background = "#00ff88"; e.target.style.color = "#000" }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#00ff88" }}
                onClick={() => {
                  save("selectedPath", path.pathId)
                  if (setSelectedPath) setSelectedPath(path.pathId)
                  setCurrentScreen("guideSelect")
                }}
              >
                Choose This Path →
              </button>
            </div>
          ))}
        </div>

        <button style={styles.btn} onClick={() => setCurrentScreen("guideSelect")}>
          Skip — Generate My AI Learning Guide →
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: "100vh", background: "#050505", padding: "40px 20px", fontFamily: "'Courier New', monospace" },
  inner: { maxWidth: "960px", margin: "0 auto" },
  title: { color: "#00ff88", fontSize: "28px", marginBottom: "8px" },
  subtitle: { color: "#666", marginBottom: "24px" },
  fastMoney: { background: "#111", border: "1px solid #ffcc00", borderRadius: "8px", padding: "12px 24px", color: "#aaa", marginBottom: "12px", fontSize: "13px" },
  safeBox: { background: "#111", border: "1px solid #00aaff", borderRadius: "8px", padding: "12px 24px", color: "#aaa", marginBottom: "24px", fontSize: "13px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" },
  card: { background: "#111", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px" },
  label: { color: "#666", fontSize: "11px", letterSpacing: "1px", marginBottom: "8px" },
  pathName: { color: "white", fontSize: "16px", marginBottom: "16px", lineHeight: "1.4" },
  scoreBar: { background: "#1a1a1a", borderRadius: "4px", height: "6px", marginBottom: "6px" },
  scoreFill: { background: "#00ff88", height: "100%", borderRadius: "4px" },
  scoreText: { color: "#00ff88", fontSize: "13px", marginBottom: "12px" },
  difficulty: { color: "#888", fontSize: "12px", marginBottom: "8px" },
  meta: { color: "#666", fontSize: "12px", marginBottom: "6px" },
  incomeBox: { background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "10px", marginBottom: "12px" },
  incomeTitle: { color: "#666", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" },
  incomeLine: { color: "#aaa", fontSize: "11px", marginBottom: "3px" },
  metaGreen: { color: "#4a9", fontSize: "12px", marginBottom: "6px" },
  metaRed: { color: "#a64", fontSize: "12px", marginBottom: "6px" },
  warning: { color: "#aa8800", fontSize: "11px", background: "#1a1200", padding: "8px", borderRadius: "4px", marginBottom: "6px" },
  chooseBtn: { marginTop: "16px", width: "100%", padding: "12px", background: "transparent", color: "#00ff88", border: "1px solid #00ff88", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "all 0.15s ease" },
  btn: { padding: "16px 32px", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }
}

export default PathResults