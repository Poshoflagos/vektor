import { useState } from "react"
import { resetAll } from "../logic/storage"

export default function Settings({ setCurrentScreen, setIsAuthenticated }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  function handleReset() {
    setResetting(true)
    setTimeout(() => {
      resetAll()
      setIsAuthenticated(false)
      setCurrentScreen("password")
    }, 800)
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        <div style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <span style={styles.version}>v1.0.0</span>
        </div>

        {/* Security Warning */}
        <div style={styles.warningBox}>
          <p style={styles.warningTitle}>⚠️ Security Warning</p>
          <p style={styles.warningText}>
            VEKTÖR stores all data locally in your browser. Never enter seed phrases, private keys, bank details, or real passwords into this app. This tool is for career planning only.
          </p>
        </div>

        {/* About */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>About VEKTÖR</h2>
          <p style={styles.cardText}>
            VEKTÖR is a personal AI/Web3 path engine. It helps you find your best career path, generates a personalised learning guide, and tracks your progress — all stored privately on your device.
          </p>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Version</span>
            <span style={styles.infoValue}>v1.0.0</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Storage</span>
            <span style={styles.infoValue}>localStorage (your device only)</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Backend</span>
            <span style={styles.infoValue}>None — $0 to run</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>AI</span>
            <span style={styles.infoValue}>Manual (ChatGPT / Claude)</span>
          </div>
        </div>

        {/* Reset */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Reset All Data</h2>
          <p style={styles.cardText}>
            This will permanently delete your profile, scores, reports, tracker tasks, and all saved data. You will be returned to the password screen. This cannot be undone.
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
                Are you sure? This deletes everything permanently.
              </p>
              <div style={styles.confirmBtns}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.confirmDangerBtn}
                  onClick={handleReset}
                  disabled={resetting}
                >
                  {resetting ? "Resetting..." : "Yes, Delete Everything"}
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
  page: { minHeight: "100vh", background: "#0a0a0a", padding: "32px 16px", fontFamily: "'Courier New', monospace" },
  inner: { maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: "24px", margin: 0 },
  version: { color: "#444", fontSize: "12px", fontFamily: "monospace" },
  warningBox: { background: "#1a1000", border: "1px solid #aa8800", borderRadius: "10px", padding: "16px 20px" },
  warningTitle: { color: "#ffcc00", fontSize: "13px", fontWeight: "700", margin: "0 0 8px 0" },
  warningText: { color: "#998866", fontSize: "13px", lineHeight: "1.6", margin: 0 },
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" },
  cardTitle: { color: "#fff", fontSize: "16px", margin: 0 },
  cardText: { color: "#666", fontSize: "13px", lineHeight: "1.6", margin: 0 },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #1a1a1a" },
  infoLabel: { color: "#555", fontSize: "12px" },
  infoValue: { color: "#aaa", fontSize: "12px" },
  dangerBtn: { padding: "12px 24px", background: "transparent", border: "1px solid #ff4444", borderRadius: "8px", color: "#ff4444", fontSize: "13px", fontWeight: "700", cursor: "pointer", width: "100%" },
  confirmBox: { background: "#1a0000", border: "1px solid #440000", borderRadius: "8px", padding: "16px" },
  confirmText: { color: "#ff8888", fontSize: "13px", margin: "0 0 14px 0" },
  confirmBtns: { display: "flex", gap: "10px" },
  cancelBtn: { flex: 1, padding: "10px", background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#666", fontSize: "13px", cursor: "pointer" },
  confirmDangerBtn: { flex: 1, padding: "10px", background: "#ff4444", border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }
}