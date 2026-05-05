import { useState } from "react"
import { resetAll } from "../logic/storage"

const VEKTOR_LOCAL_KEYS = [
  "vektor_access",
  "vektor_profile",
  "vektor_scores",
  "vektor_paths",
  "vektor_guideType",
  "vektor_prompt",
  "vektor_aiResult",
  "vektor_reports",
  "vektor_selectedPath",
  "vektor_tracker",
  "vektor_hasSeenIntro",
  "vektor_feedback",
  "vektor_darkmode"
]

export default function Settings({
  setCurrentScreen,
  setIsAuthenticated,
  setUserProfile,
  setPathScores,
  setRecommendedPaths,
  setGuideType,
  setGeneratedPrompt,
  setAiResult,
  setSavedReports,
  setSelectedPath,
  setTrackerTasks
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  function clearVektorLocalStorage() {
    try {
      VEKTOR_LOCAL_KEYS.forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn("Could not clear localStorage:", error)
    }
  }

  function resetAppState() {
    if (setIsAuthenticated) setIsAuthenticated(false)
    if (setUserProfile) setUserProfile(null)
    if (setPathScores) setPathScores(null)
    if (setRecommendedPaths) setRecommendedPaths(null)
    if (setGuideType) setGuideType(null)
    if (setGeneratedPrompt) setGeneratedPrompt("")
    if (setAiResult) setAiResult("")
    if (setSavedReports) setSavedReports([])
    if (setSelectedPath) setSelectedPath(null)
    if (setTrackerTasks) setTrackerTasks([])
  }

  function handleReset() {
    setResetting(true)

    setTimeout(() => {
      try {
        resetAll()
      } catch (error) {
        console.warn("resetAll failed, using fallback clear:", error)
      }

      clearVektorLocalStorage()
      resetAppState()

      setCurrentScreen("password")
      setResetting(false)
      setShowConfirm(false)
    }, 800)
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Settings</h1>
            <p style={styles.subtitle}>
              Manage your VEKTÖR data, security, and app status.
            </p>
          </div>

          <span style={styles.version}>v1.0.0</span>
        </div>

        {/* Security Warning */}
        <div style={styles.warningBox}>
          <p style={styles.warningTitle}>⚠️ Security Warning</p>
          <p style={styles.warningText}>
            VEKTÖR stores all data locally in your browser. Never enter seed
            phrases, private keys, wallet passwords, bank details, or real
            passwords into this app. This tool is for career planning only.
          </p>
        </div>

        {/* App Status */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>App Status</h2>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Version</span>
            <span style={styles.infoValue}>v1.0.0</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Mode</span>
            <span style={styles.infoValue}>Private Beta</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Storage</span>
            <span style={styles.infoValue}>localStorage — this device only</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Backend</span>
            <span style={styles.infoValue}>None — $0 to run</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>AI Mode</span>
            <span style={styles.infoValue}>Manual prompt flow</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Access</span>
            <span style={styles.infoValue}>Shared password</span>
          </div>
        </div>

        {/* Appearance */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Appearance</h2>
          <p style={styles.cardText}>
            VEKTÖR v1 uses a fixed dark interface to keep the prototype stable.
            Light mode is planned for a later version.
          </p>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Current theme</span>
            <span style={styles.infoValue}>Dark</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Light mode</span>
            <span style={styles.infoValue}>Planned for v2</span>
          </div>
        </div>

        {/* About */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>About VEKTÖR</h2>
          <p style={styles.cardText}>
            VEKTÖR is a personal AI/Web3 path engine. It helps users find their
            best career path, generate a personalised learning guide, and track
            progress — all stored privately on this device in v1.
          </p>
        </div>

        {/* Reset */}
        <div style={styles.dangerCard}>
          <h2 style={styles.dangerTitle}>Danger Zone</h2>
          <p style={styles.cardText}>
            This will permanently delete your profile, scores, selected path,
            reports, tracker tasks, prompt data, beginner intro status, and beta
            feedback from this browser. You will be returned to the password
            screen. This cannot be undone.
          </p>

          {!showConfirm ? (
            <button
              style={styles.dangerBtn}
              onClick={() => setShowConfirm(true)}
            >
              Reset All Data
            </button>
          ) : (
            <div style={styles.confirmBox}>
              <p style={styles.confirmText}>
                Confirm reset. This deletes everything permanently.
              </p>

              <div style={styles.confirmBtns}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowConfirm(false)}
                  disabled={resetting}
                >
                  Cancel
                </button>

                <button
                  style={styles.confirmDangerBtn}
                  onClick={handleReset}
                  disabled={resetting}
                >
                  {resetting ? "Resetting..." : "Yes, Reset Everything"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    padding: "86px 16px 70px",
    fontFamily: "'Courier New', monospace",
    boxSizing: "border-box"
  },
  inner: {
    maxWidth: "680px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px"
  },
  title: {
    color: "#fff",
    fontSize: "28px",
    margin: "0 0 8px"
  },
  subtitle: {
    color: "#888",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: 0
  },
  version: {
    color: "#00ff88",
    border: "1px solid #222",
    background: "#111",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "12px",
    fontFamily: "monospace",
    whiteSpace: "nowrap"
  },
  warningBox: {
    background: "#1a1200",
    border: "1px solid #3a2800",
    borderRadius: "10px",
    padding: "16px 20px"
  },
  warningTitle: {
    color: "#aa8800",
    fontSize: "13px",
    fontWeight: "700",
    margin: "0 0 8px"
  },
  warningText: {
    color: "#998866",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: 0
  },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  cardTitle: {
    color: "#fff",
    fontSize: "16px",
    margin: 0
  },
  cardText: {
    color: "#888",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    paddingTop: "10px",
    borderTop: "1px solid #1a1a1a"
  },
  infoLabel: {
    color: "#555",
    fontSize: "12px"
  },
  infoValue: {
    color: "#aaa",
    fontSize: "12px",
    textAlign: "right"
  },
  dangerCard: {
    background: "#111",
    border: "1px solid #3a1111",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  dangerTitle: {
    color: "#ff4444",
    fontSize: "16px",
    margin: 0
  },
  dangerBtn: {
    padding: "12px 24px",
    background: "transparent",
    border: "1px solid #ff4444",
    borderRadius: "8px",
    color: "#ff4444",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%"
  },
  confirmBox: {
    background: "#1a0000",
    border: "1px solid #440000",
    borderRadius: "8px",
    padding: "16px"
  },
  confirmText: {
    color: "#ff8888",
    fontSize: "13px",
    margin: "0 0 14px"
  },
  confirmBtns: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "#666",
    fontSize: "13px",
    cursor: "pointer",
    minWidth: "140px"
  },
  confirmDangerBtn: {
    flex: 1,
    padding: "10px",
    background: "#ff4444",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    minWidth: "180px"
  }
}