import { useState, useEffect } from "react"
import { load, deleteReport } from "../logic/storage"

function SavedReports({ setCurrentScreen }) {
  const [reports, setReports] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const saved = load("reports") || []
    setReports(saved)

    function handleFocus() {
      const refreshed = load("reports") || []
      setReports(refreshed)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  function handleDelete(id) {
    if (!window.confirm("Delete this report?")) return
    deleteReport(id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Saved Reports</h2>
            <p style={styles.subtitle}>{reports.length} report{reports.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button onClick={() => setCurrentScreen("welcome")} style={styles.homeBtn}>
            ← Home
          </button>
        </div>

        {reports.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No reports yet.</p>
            <p style={styles.emptySubtext}>Complete the full flow to generate and save your first guide.</p>
            <button onClick={() => setCurrentScreen("form")} style={styles.startBtn}>
              Start My Path →
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {[...reports].reverse().map(report => (
              <div key={report.id} style={styles.reportCard}>

                <div style={styles.reportHeader}>
                  <div style={styles.reportMeta}>
                    <span style={styles.reportPath}>{report.pathName}</span>
                    <span style={styles.reportBadge}>{report.guideType}</span>
                  </div>
                  <span style={styles.reportDate}>{report.date}</span>
                </div>

                <div style={styles.reportActions}>
                  <button
                    onClick={() => toggleExpand(report.id)}
                    style={styles.expandBtn}
                  >
                    {expandedId === report.id ? "Hide Guide ▲" : "Read Guide ▼"}
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>

                {expandedId === report.id && (
                  <div style={styles.reportContent}>
                    <pre style={styles.reportText}>{report.content}</pre>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        <button onClick={() => setCurrentScreen("tracker")} style={styles.trackerBtn}>
          Go to My Tracker →
        </button>

      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px", fontFamily: "'Segoe UI', sans-serif" },
  card: { width: "100%", maxWidth: "720px", background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title: { color: "#fff", fontSize: "22px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#555", fontSize: "13px", marginTop: "4px" },
  homeBtn: { padding: "8px 16px", background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#666", fontSize: "13px", cursor: "pointer" },
  emptyBox: { background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  emptyText: { color: "#fff", fontSize: "16px", fontWeight: "600", margin: 0 },
  emptySubtext: { color: "#555", fontSize: "13px", margin: 0 },
  startBtn: { padding: "12px 24px", background: "#00ff88", border: "none", borderRadius: "8px", color: "#000", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "8px" },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  reportCard: { background: "#0f0f0f", border: "1px solid #222", borderRadius: "10px", overflow: "hidden" },
  reportHeader: { padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a1a" },
  reportMeta: { display: "flex", alignItems: "center", gap: "10px" },
  reportPath: { color: "#fff", fontSize: "14px", fontWeight: "600" },
  reportBadge: { padding: "3px 8px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#00ff88", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
  reportDate: { color: "#555", fontSize: "12px" },
  reportActions: { padding: "12px 20px", display: "flex", gap: "10px", borderBottom: "1px solid #1a1a1a" },
  expandBtn: { padding: "7px 14px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", color: "#ccc", fontSize: "12px", cursor: "pointer" },
  deleteBtn: { padding: "7px 14px", background: "transparent", border: "1px solid #440000", borderRadius: "6px", color: "#ff4444", fontSize: "12px", cursor: "pointer" },
  reportContent: { padding: "20px", borderTop: "1px solid #1a1a1a" },
  reportText: { color: "#bbb", fontSize: "13px", lineHeight: "1.8", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontFamily: "'Segoe UI', sans-serif" },
  trackerBtn: { padding: "14px", background: "#00ff88", border: "none", borderRadius: "8px", color: "#000", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%" }
}

export default SavedReports