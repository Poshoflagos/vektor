import { useState, useEffect } from "react"
import { load, save } from "../logic/storage"
import { AI_WEB3_OPPORTUNITIES } from "../data/paths"
import {
  getCompletionPercent,
  getCurrentPhase,
  getNextTask,
  groupTasksByCategory
} from "../logic/trackerData"

const CATEGORY_COLORS = {
  "Learn": "#3b82f6",
  "Practice": "#a855f7",
  "Build": "#f59e0b",
  "Publish-Share": "#00ff88",
  "Earn-Apply": "#ef4444"
}

const CATEGORY_ICONS = {
  "Learn": "📚",
  "Practice": "🛠",
  "Build": "🏗",
  "Publish-Share": "📢",
  "Earn-Apply": "💰"
}

export default function Tracker({ setCurrentScreen }) {
  const [tasks, setTasks] = useState([])
  const [pathName, setPathName] = useState("")
  const [expandedTask, setExpandedTask] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const tracker = load("tracker")
    const selectedPathId = load("selectedPath")

    console.log("Tracker raw data:", tracker)
    console.log("Tasks found:", tracker?.tasks)

    if (tracker && tracker.tasks && tracker.tasks.length > 0) {
      setTasks(tracker.tasks)
    }

    if (selectedPathId) {
      const pathMeta = AI_WEB3_OPPORTUNITIES.find(p => p.pathId === selectedPathId)
      setPathName(pathMeta?.name || selectedPathId)
    }

    setMounted(true)
  }, [])

  function saveTasks(updatedTasks) {
    const tracker = load("tracker") || {}
    save("tracker", { ...tracker, tasks: updatedTasks })
    setTasks(updatedTasks)
  }

  function toggleTask(taskId) {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
    saveTasks(updated)
  }

  function updateNote(taskId, note) {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, note } : t
    )
    saveTasks(updated)
  }

  function updateProofLink(taskId, proofLink) {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, proofLink } : t
    )
    saveTasks(updated)
  }

  const percent = getCompletionPercent(tasks)
  const phase = getCurrentPhase(percent)
  const nextTask = getNextTask(tasks)
  const grouped = groupTasksByCategory(tasks)

  if (!mounted) return null

  if (tasks.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyBox}>
          <p style={styles.emptyIcon}>📋</p>
          <h2 style={styles.emptyTitle}>No Tasks Yet</h2>
          <p style={styles.emptyText}>
            Complete the full flow first: generate your AI guide, paste the response, and your tasks will appear here automatically.
          </p>
          <button
            style={styles.primaryBtn}
            onClick={() => setCurrentScreen("prompt")}
          >
            Go Generate My Guide →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        <div style={styles.header}>
          <div>
            <p style={styles.headerLabel}>ACTIVE PATH</p>
            <h1 style={styles.headerTitle}>{pathName || "Your Path"}</h1>
          </div>
          <div style={styles.phaseTag}>{phase.name}</div>
        </div>

        <div style={styles.progressCard}>
          <div style={styles.progressTop}>
            <span style={styles.progressLabel}>Overall Progress</span>
            <span style={styles.progressPercent}>{percent}%</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${percent}%` }} />
          </div>
          <p style={styles.progressSub}>
            {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
          </p>
        </div>

        {nextTask && (
          <div style={styles.nextTaskCard}>
            <p style={styles.nextTaskLabel}>⚡ NEXT RECOMMENDED TASK</p>
            <p style={styles.nextTaskTitle}>{nextTask.title}</p>
            <span style={{
              ...styles.categoryBadge,
              background: CATEGORY_COLORS[nextTask.category] + "22",
              color: CATEGORY_COLORS[nextTask.category],
              border: `1px solid ${CATEGORY_COLORS[nextTask.category]}44`
            }}>
              {CATEGORY_ICONS[nextTask.category]} {nextTask.category}
            </span>
          </div>
        )}

        {Object.entries(grouped).map(([category, categoryTasks]) => {
          if (categoryTasks.length === 0) return null
          const color = CATEGORY_COLORS[category]
          const icon = CATEGORY_ICONS[category]
          const doneCount = categoryTasks.filter(t => t.completed).length

          return (
            <div key={category} style={styles.categoryBlock}>
              <div style={styles.categoryHeader}>
                <div style={styles.categoryLeft}>
                  <span style={{ ...styles.categoryDot, background: color }} />
                  <span style={styles.categoryName}>{icon} {category}</span>
                </div>
                <span style={styles.categoryCount}>{doneCount}/{categoryTasks.length}</span>
              </div>

              {categoryTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    ...styles.taskRow,
                    borderLeft: `3px solid ${task.completed ? color : "#222"}`,
                    opacity: task.completed ? 0.6 : 1
                  }}
                >
                  <div style={styles.taskTop}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      style={styles.checkbox}
                    />
                    <span style={{
                      ...styles.taskTitle,
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#444" : "#ddd"
                    }}>
                      {task.title}
                    </span>
                    <button
                      style={styles.expandBtn}
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    >
                      {expandedTask === task.id ? "▲" : "▼"}
                    </button>
                  </div>

                  {expandedTask === task.id && (
                    <div style={styles.taskExpanded}>
                      <label style={styles.fieldLabel}>📝 Note</label>
                      <textarea
                        style={styles.fieldInput}
                        rows={2}
                        placeholder="Add a note..."
                        defaultValue={task.note}
                        onBlur={e => updateNote(task.id, e.target.value)}
                      />
                      <label style={styles.fieldLabel}>🔗 Proof Link</label>
                      <input
                        style={styles.fieldInput}
                        type="url"
                        placeholder="https://..."
                        defaultValue={task.proofLink}
                        onBlur={e => updateProofLink(task.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}

        <div style={{ height: "40px" }} />
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Courier New', monospace", padding: "24px 16px" },
  inner: { maxWidth: "720px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  headerLabel: { color: "#555", fontSize: "11px", letterSpacing: "2px", margin: "0 0 4px 0" },
  headerTitle: { color: "#fff", fontSize: "22px", margin: 0 },
  phaseTag: { background: "#111", border: "1px solid #00ff88", color: "#00ff88", fontSize: "11px", fontWeight: "700", padding: "6px 12px", borderRadius: "20px", letterSpacing: "1px" },
  progressCard: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px", marginBottom: "16px" },
  progressTop: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  progressLabel: { color: "#666", fontSize: "12px" },
  progressPercent: { color: "#00ff88", fontSize: "20px", fontWeight: "700" },
  progressBg: { background: "#1a1a1a", borderRadius: "4px", height: "8px", marginBottom: "8px" },
  progressFill: { background: "linear-gradient(90deg, #00ff88, #00cc6a)", height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  progressSub: { color: "#555", fontSize: "12px", margin: 0 },
  nextTaskCard: { background: "#0d1a12", border: "1px solid #00ff8844", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" },
  nextTaskLabel: { color: "#00ff88", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", margin: "0 0 8px 0" },
  nextTaskTitle: { color: "#fff", fontSize: "14px", margin: "0 0 10px 0", lineHeight: "1.5" },
  categoryBadge: { fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
  categoryBlock: { marginBottom: "24px" },
  categoryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid #1a1a1a" },
  categoryLeft: { display: "flex", alignItems: "center", gap: "8px" },
  categoryDot: { width: "8px", height: "8px", borderRadius: "50%" },
  categoryName: { color: "#aaa", fontSize: "13px", fontWeight: "700", letterSpacing: "1px" },
  categoryCount: { color: "#555", fontSize: "12px" },
  taskRow: { background: "#111", borderRadius: "8px", padding: "12px 16px", marginBottom: "8px", transition: "all 0.15s ease" },
  taskTop: { display: "flex", alignItems: "center", gap: "12px" },
  checkbox: { width: "16px", height: "16px", cursor: "pointer", accentColor: "#00ff88", flexShrink: 0 },
  taskTitle: { flex: 1, fontSize: "13px", lineHeight: "1.5" },
  expandBtn: { background: "transparent", border: "none", color: "#444", cursor: "pointer", fontSize: "11px", padding: "2px 6px" },
  taskExpanded: { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1a1a1a", display: "flex", flexDirection: "column", gap: "8px" },
  fieldLabel: { color: "#555", fontSize: "11px", letterSpacing: "1px" },
  fieldInput: { background: "#0a0a0a", border: "1px solid #222", borderRadius: "6px", color: "#ccc", fontSize: "13px", padding: "8px 12px", outline: "none", fontFamily: "inherit", resize: "vertical", width: "100%", boxSizing: "border-box" },
  emptyBox: { maxWidth: "480px", margin: "120px auto", background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "48px 32px", textAlign: "center" },
  emptyIcon: { fontSize: "48px", margin: "0 0 16px 0" },
  emptyTitle: { color: "#fff", fontSize: "20px", margin: "0 0 12px 0" },
  emptyText: { color: "#666", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" },
  primaryBtn: { padding: "12px 24px", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }
}