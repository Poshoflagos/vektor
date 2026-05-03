import { useState } from "react"
import { saveReport, load, save } from "../logic/storage"
import { parseTasksFromAIResult } from "../logic/trackerData"

function PasteResult({ recommendedPaths, guideType, setCurrentScreen, setSavedReports }) {
  const [aiText, setAiText] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  function handleSave() {
    if (aiText.trim().length < 100) {
      setError("That looks too short. Paste the full AI response before saving.")
      return
    }

    const paths = recommendedPaths || load("paths")
    const guide = guideType || load("guideType")
    const selectedPathId = load("selectedPath")
    const bestPathId = selectedPathId || paths?.best?.[0] || paths?.best || "Unknown Path"

    // Save the report
    const report = saveReport(bestPathId, guide || "free", aiText.trim())

    if (setSavedReports) {
      setSavedReports(prev => [...(prev || []), report])
    }

    // Parse tasks from AI response and save to tracker
    const tasks = parseTasksFromAIResult(aiText)
    if (tasks.length > 0) {
      save("tracker", {
        pathName: bestPathId,
        tasks
      })
    }

    setSaved(true)
    setError("")

    setTimeout(() => {
      setCurrentScreen("reports")
    }, 1500)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.badge}>STEP 4 OF 4</div>
        <h2 style={styles.title}>Paste Your AI Guide Here</h2>
        <p style={styles.subtitle}>
          Go to ChatGPT or Claude, copy the full response, and paste it below. Then click Save.
        </p>

        <div style={styles.instructions}>
          {[
            "Open ChatGPT or Claude in another tab",
            "Paste the prompt you copied and press Send",
            "Select ALL of the response (Ctrl+A) and copy it",
            "Come back here and paste it in the box below"
          ].map((text, i) => (
            <div key={i} style={styles.instructionRow}>
              <span style={styles.icon}>{i + 1}</span>
              <span style={styles.instructionText}>{text}</span>
            </div>
          ))}
        </div>

        <div style={styles.textareaWrap}>
          <div style={styles.textareaHeader}>
            <span style={styles.textareaLabel}>YOUR AI GUIDE</span>
            {aiText.length > 0 && (
              <span style={styles.charCount}>{aiText.length} characters</span>
            )}
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Paste the full AI response here..."
            value={aiText}
            onChange={e => {
              setAiText(e.target.value)
              setError("")
            }}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {saved ? (
          <div style={styles.successBox}>
            ✓ Report saved! Tasks added to your tracker. Taking you to reports...
          </div>
        ) : (
          <button onClick={handleSave} style={styles.saveBtn}>
            Save This Report →
          </button>
        )}

        <button onClick={() => setCurrentScreen("prompt")} style={styles.backBtn}>
          ← Back to Prompt
        </button>

      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px", fontFamily: "'Segoe UI', sans-serif" },
  card: { width: "100%", maxWidth: "680px", background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "20px" },
  badge: { display: "inline-block", background: "#1a1a1a", border: "1px solid #333", color: "#00ff88", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", padding: "4px 10px", borderRadius: "4px", width: "fit-content" },
  title: { color: "#fff", fontSize: "22px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#888", fontSize: "14px", margin: 0, lineHeight: "1.5" },
  instructions: { background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" },
  instructionRow: { display: "flex", alignItems: "center", gap: "12px" },
  icon: { width: "24px", height: "24px", borderRadius: "50%", background: "#00ff88", color: "#000", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  instructionText: { color: "#ccc", fontSize: "14px" },
  textareaWrap: { border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden" },
  textareaHeader: { background: "#1a1a1a", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a2a" },
  textareaLabel: { color: "#555", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px" },
  charCount: { color: "#00ff88", fontSize: "11px", fontWeight: "600" },
  textarea: { width: "100%", minHeight: "300px", background: "#0d0d0d", color: "#ccc", border: "none", padding: "16px", fontSize: "13px", lineHeight: "1.7", resize: "vertical", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", outline: "none" },
  error: { color: "#ff4444", fontSize: "13px", margin: 0, padding: "10px 14px", background: "#1a0000", border: "1px solid #440000", borderRadius: "6px" },
  successBox: { padding: "14px", background: "#0a2a1a", border: "1px solid #00ff88", borderRadius: "8px", color: "#00ff88", fontSize: "14px", fontWeight: "600", textAlign: "center" },
  saveBtn: { padding: "14px", background: "#00ff88", border: "none", borderRadius: "8px", color: "#000", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%" },
  backBtn: { padding: "10px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#666", fontSize: "13px", cursor: "pointer", width: "100%" }
}

export default PasteResult