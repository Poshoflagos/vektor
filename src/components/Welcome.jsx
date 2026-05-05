// src/components/Welcome.jsx
import { useState } from "react"

function Welcome({
  setCurrentScreen,
  userProfile,
  selectedPath,
  savedReports,
  trackerTasks
}) {
  const [feedbackSent, setFeedbackSent] = useState(false)

  const name = userProfile?.name || null
  const pathName = selectedPath?.name || null

  const reports = Array.isArray(savedReports) ? savedReports : []
  const reportsCount = reports.length

  const tasks = Array.isArray(trackerTasks) ? trackerTasks : []
  const completedTasks = tasks.filter(task => task.completed).length

  const completionPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const nextTask = tasks.find(task => !task.completed) || null
  const latestReport = reportsCount > 0 ? reports[reports.length - 1] : null

  function navigate(screen) {
    if (typeof setCurrentScreen === "function") {
      setCurrentScreen(screen)
    }
  }

  function getPrimaryCTA() {
    if (!userProfile) {
      return {
        label: "Start My Path",
        screen: "form"
      }
    }

    if (!selectedPath) {
      return {
        label: "View My Path Results",
        screen: "results"
      }
    }

    if (reportsCount === 0 && tasks.length === 0) {
      return {
        label: "Generate My Guide",
        screen: "guideSelect"
      }
    }

    return {
      label: "Continue My Tracker",
      screen: "tracker"
    }
  }

  function saveFeedback(type) {
    try {
      const existing = JSON.parse(
        localStorage.getItem("vektor_feedback") || "[]"
      )

      const newFeedback = {
        id: "fb_" + Date.now(),
        type,
        screen: "welcome",
        createdAt: new Date().toISOString()
      }

      localStorage.setItem(
        "vektor_feedback",
        JSON.stringify([...existing, newFeedback])
      )
    } catch (error) {
      console.warn("Feedback save failed:", error)
    }

    setFeedbackSent(true)
  }

  const cta = getPrimaryCTA()

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HERO */}
        <section style={styles.hero}>
          <p style={styles.kicker}>VEKTÖR — COMMAND CENTER</p>

          <h1 style={styles.heroTitle}>
            {name ? `Welcome back, ${name}.` : "Welcome to VEKTÖR."}
          </h1>

          <p style={styles.heroSub}>
            Find your best path into AI, Web3, or AI x Web3 — then turn it
            into an execution plan.
          </p>

          {pathName ? (
            <div style={styles.pathBadge}>
              Current path:{" "}
              <span style={styles.pathBadgeAccent}>{pathName}</span>
            </div>
          ) : (
            <div style={styles.pathBadgeMuted}>No path selected yet.</div>
          )}

          <div style={styles.ctaRow}>
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={() => navigate(cta.screen)}
            >
              {cta.label} →
            </button>

            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => navigate("introLesson")}
            >
              Read Beginner Intro
            </button>
          </div>
        </section>

        {/* PROGRESS SNAPSHOT */}
        <p style={styles.sectionLabel}>YOUR PROGRESS</p>

        <div style={styles.cardRow}>
          <div style={styles.snapshotCard}>
            <p style={styles.snapshotTitle}>Path</p>
            <p style={styles.snapshotValue}>
              {pathName || "Not selected yet"}
            </p>
          </div>

          <div style={styles.snapshotCard}>
            <p style={styles.snapshotTitle}>Reports</p>
            <p style={styles.snapshotValue}>
              {reportsCount > 0 ? reportsCount : "No reports yet"}
            </p>
          </div>

          <div style={styles.snapshotCard}>
            <p style={styles.snapshotTitle}>Tracker</p>
            <p style={styles.snapshotValue}>
              {tasks.length > 0
                ? `${completionPercent}% complete`
                : "No tracker yet"}
            </p>

            {tasks.length > 0 && (
              <div style={styles.progressBarWrap}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${completionPercent}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* TODAY'S NEXT STEP */}
        <p style={styles.sectionLabel}>TODAY'S NEXT STEP</p>

        <div style={styles.nextStepCard}>
          {nextTask ? (
            <>
              <p style={styles.nextStepCategory}>
                {nextTask.category || "Task"}
              </p>

              <p style={styles.nextStepTitle}>
                {nextTask.title || "Untitled task"}
              </p>
            </>
          ) : (
            <p style={styles.nextStepEmpty}>
              No tracker tasks yet. Generate or paste a guide to create your
              execution tracker.
            </p>
          )}

          <button
            type="button"
            style={styles.outlineBtn}
            onClick={() => navigate("tracker")}
          >
            Open Tracker
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <p style={styles.sectionLabel}>QUICK ACTIONS</p>

        <div style={styles.quickGrid}>
          {[
            { label: "Beginner Intro", screen: "introLesson" },
            { label: "Path Results", screen: "results" },
            { label: "Saved Reports", screen: "reports" },
            { label: "Task Tracker", screen: "tracker" },
            { label: "Update Answers", screen: "form" }
          ].map(item => (
            <button
              key={item.label}
              type="button"
              style={styles.quickBtn}
              onClick={() => navigate(item.screen)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* LATEST REPORT */}
        <p style={styles.sectionLabel}>LATEST REPORT</p>

        <div style={styles.card}>
          {latestReport ? (
            <>
              <p style={styles.reportPath}>
                {latestReport.pathName || "Saved Guide"}
              </p>

              <p style={styles.reportMeta}>
                {latestReport.guideType
                  ? `${capitalize(latestReport.guideType)} guide`
                  : "Guide"}

                {latestReport.date ? ` · ${latestReport.date}` : ""}
              </p>

              <button
                type="button"
                style={styles.outlineBtn}
                onClick={() => navigate("reports")}
              >
                View Reports
              </button>
            </>
          ) : (
            <p style={styles.emptyText}>
              No saved reports yet. Generate or paste your first guide to save
              one here.
            </p>
          )}
        </div>

        {/* FEEDBACK */}
        <p style={styles.sectionLabel}>PRIVATE BETA FEEDBACK</p>

        <div style={styles.card}>
          <p style={styles.feedbackQuestion}>
            Did VEKTÖR give you a useful direction?
          </p>

          {feedbackSent ? (
            <p style={styles.feedbackSuccess}>Feedback saved. Thank you.</p>
          ) : (
            <div style={styles.feedbackBtnRow}>
              {["Useful", "Confusing", "Wrong Path", "Bug"].map(type => (
                <button
                  key={type}
                  type="button"
                  style={styles.feedbackBtn}
                  onClick={() => saveFeedback(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SECURITY NOTICE */}
        <div style={styles.securityCard}>
          <p style={styles.securityText}>
            <strong style={{ color: "#aa8800" }}>Security Notice:</strong>{" "}
            Do not enter seed phrases, private keys, wallet passwords, bank
            passwords, or highly sensitive personal information. VEKTÖR v1
            stores data on this device only.
          </p>
        </div>
      </div>
    </div>
  )
}

function capitalize(text) {
  if (!text || typeof text !== "string") return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    fontFamily: "'Courier New', monospace",
    padding: "86px 20px 70px",
    boxSizing: "border-box"
  },
  container: {
    width: "100%",
    maxWidth: "860px",
    margin: "0 auto"
  },

  hero: {
    marginBottom: "40px"
  },
  kicker: {
    color: "#00ff88",
    fontSize: "11px",
    letterSpacing: "3px",
    margin: "0 0 12px"
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 10px",
    lineHeight: "1.2"
  },
  heroSub: {
    color: "#888",
    fontSize: "14px",
    lineHeight: "1.7",
    maxWidth: "600px",
    margin: "0 0 16px"
  },
  pathBadge: {
    display: "inline-block",
    background: "#001a0d",
    border: "1px solid #00ff88",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "24px"
  },
  pathBadgeAccent: {
    color: "#00ff88",
    fontWeight: "bold"
  },
  pathBadgeMuted: {
    display: "inline-block",
    background: "#111",
    border: "1px solid #222",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    color: "#555",
    marginBottom: "24px"
  },
  ctaRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  primaryBtn: {
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "13px 22px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    flex: "1",
    minWidth: "200px"
  },
  secondaryBtn: {
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "13px 22px",
    fontSize: "14px",
    cursor: "pointer",
    flex: "1",
    minWidth: "180px"
  },
  outlineBtn: {
    background: "transparent",
    color: "#00ff88",
    border: "1px solid #00ff88",
    borderRadius: "6px",
    padding: "10px 18px",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "14px"
  },

  sectionLabel: {
    color: "#444",
    fontSize: "11px",
    letterSpacing: "2px",
    marginBottom: "10px",
    marginTop: "32px"
  },

  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px"
  },
  snapshotCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "10px",
    padding: "18px"
  },
  snapshotTitle: {
    color: "#555",
    fontSize: "11px",
    letterSpacing: "1px",
    margin: "0 0 8px"
  },
  snapshotValue: {
    color: "#fff",
    fontSize: "15px",
    fontWeight: "bold",
    margin: 0,
    lineHeight: "1.5"
  },
  progressBarWrap: {
    background: "#1a1a1a",
    borderRadius: "4px",
    height: "4px",
    marginTop: "10px",
    overflow: "hidden"
  },
  progressBarFill: {
    background: "#00ff88",
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease"
  },

  nextStepCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "10px",
    padding: "20px"
  },
  nextStepCategory: {
    color: "#00ff88",
    fontSize: "11px",
    letterSpacing: "1px",
    margin: "0 0 6px"
  },
  nextStepTitle: {
    color: "#fff",
    fontSize: "15px",
    margin: 0,
    lineHeight: "1.5"
  },
  nextStepEmpty: {
    color: "#555",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },

  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "10px",
    padding: "20px"
  },

  quickGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },
  quickBtn: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "8px",
    color: "#888",
    fontSize: "13px",
    padding: "10px 16px",
    cursor: "pointer"
  },

  reportPath: {
    color: "#fff",
    fontSize: "15px",
    fontWeight: "bold",
    margin: "0 0 6px"
  },
  reportMeta: {
    color: "#555",
    fontSize: "12px",
    margin: 0
  },
  emptyText: {
    color: "#555",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },

  feedbackQuestion: {
    color: "#aaa",
    fontSize: "14px",
    margin: "0 0 14px"
  },
  feedbackBtnRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  feedbackBtn: {
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "#888",
    fontSize: "13px",
    padding: "8px 16px",
    cursor: "pointer"
  },
  feedbackSuccess: {
    color: "#00ff88",
    fontSize: "13px",
    margin: 0
  },

  securityCard: {
    background: "#1a1200",
    border: "1px solid #3a2800",
    borderRadius: "10px",
    padding: "16px 20px",
    marginTop: "32px"
  },
  securityText: {
    color: "#888",
    fontSize: "12px",
    lineHeight: "1.7",
    margin: 0
  }
}

export default Welcome