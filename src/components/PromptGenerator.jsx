import { useEffect, useState } from "react"
import { buildPrompt } from "../logic/promptBuilder"
import { load } from "../logic/storage"

function PromptGenerator({ userProfile, recommendedPaths, guideType, setCurrentScreen }) {
  const [prompt, setPrompt] = useState("")
  const [copied, setCopied] = useState(false)
  const [pathName, setPathName] = useState("")

  useEffect(() => {
    const profile = userProfile || load("profile")
    const paths = recommendedPaths || load("paths")
    const guide = guideType || load("guideType")

    if (!profile || !paths) return

    // Use chosen path first, fall back to best match
    const chosenPathId = load("selectedPath")
    const pathId = chosenPathId || paths.best?.[0] || paths.best

    setPathName(pathId)

    const generated = buildPrompt(profile, pathId, guide || "free")
    setPrompt(generated)
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      const el = document.getElementById("prompt-textarea")
      el.select()
      document.execCommand("copy")
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>STEP 3 OF 4</div>
        <h2 style={styles.title}>Your Personalised Prompt is Ready</h2>
        <p style={styles.subtitle}>
          This prompt was built specifically from your profile and chosen path.
        </p>

        <div style={styles.steps}>
          {[
            "Copy the prompt below",
            "Open chatgpt.com or claude.ai in a new tab",
            "Paste it and press Send",
            "Wait for the full response",
            "Come back here and click the button below"
          ].map((step, i) => (
            <div key={i} style={styles.stepRow}>
              <div style={styles.stepNum}>{i + 1}</div>
              <span style={styles.stepText}>{step}</span>
            </div>
          ))}
        </div>

        <div style={styles.promptWrap}>
          <div style={styles.promptHeader}>
            <span style={styles.promptLabel}>YOUR PROMPT</span>
            <button onClick={handleCopy} style={copied ? styles.copiedBtn : styles.copyBtn}>
              {copied ? "✓ Copied!" : "Copy Prompt"}
            </button>
          </div>
          <textarea
            id="prompt-textarea"
            readOnly
            value={prompt}
            style={styles.textarea}
          />
        </div>

        <button onClick={() => setCurrentScreen("paste")} style={styles.nextBtn}>
          I Have My AI Response →
        </button>
        <button onClick={() => setCurrentScreen("guideSelect")} style={styles.backBtn}>
          ← Back
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
  steps: { background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" },
  stepRow: { display: "flex", alignItems: "center", gap: "12px" },
  stepNum: { width: "24px", height: "24px", borderRadius: "50%", background: "#00ff88", color: "#000", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepText: { color: "#ccc", fontSize: "14px" },
  promptWrap: { border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden" },
  promptHeader: { background: "#1a1a1a", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a2a" },
  promptLabel: { color: "#555", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px" },
  copyBtn: { padding: "6px 16px", background: "#00ff88", border: "none", borderRadius: "5px", color: "#000", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  copiedBtn: { padding: "6px 16px", background: "#1a4a2e", border: "1px solid #00ff88", borderRadius: "5px", color: "#00ff88", fontSize: "13px", fontWeight: "700", cursor: "default" },
  textarea: { width: "100%", minHeight: "260px", background: "#0d0d0d", color: "#ccc", border: "none", padding: "16px", fontSize: "13px", lineHeight: "1.7", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box", outline: "none" },
  nextBtn: { padding: "14px", background: "#00ff88", border: "none", borderRadius: "8px", color: "#000", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%" },
  backBtn: { padding: "10px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#666", fontSize: "13px", cursor: "pointer", width: "100%" }
}

export default PromptGenerator