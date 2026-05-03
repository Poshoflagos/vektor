import { useEffect } from "react"
import { rankPathsForUser, getRecommendationBundle } from "../data/paths"
import { save } from "../logic/storage"

function PathResults({ userProfile, pathScores, setPathScores, recommendedPaths, setRecommendedPaths, setCurrentScreen, setSelectedPath }) {

  useEffect(() => {
    if (userProfile && !recommendedPaths) {
      // Convert VEKTOR form answers to the scoring engine's format
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
        riskTolerance: userProfile.urgency === "very" ? "Low" : "Medium"
      }

      const bundle = getRecommendationBundle(profile)
      const ranked = rankPathsForUser(profile)

      // Build scores object for display
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

  const bundle = getRecommendationBundle({
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
    riskTolerance: userProfile.urgency === "very" ? "Low" : "Medium"
  })

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
  scoreFill