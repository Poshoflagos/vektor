// Parse tasks from pasted AI result
export function parseTasksFromAIResult(aiText) {
  const lines = aiText.split("\n")
  const tasks = []
  let taskId = 1
  const categoryKeywords = ["Learn", "Practice", "Build", "Publish", "Earn"]

  lines.forEach(line => {
    const trimmed = line.trim()
    const hasCategory = categoryKeywords.some(cat =>
      trimmed.toLowerCase().includes(`[${cat.toLowerCase()}]`) ||
      trimmed.toLowerCase().includes(`[${cat.toLowerCase()}-`) ||
      trimmed.toLowerCase().includes(`[publish-share]`) ||
      trimmed.toLowerCase().includes(`[earn-apply]`)
    )

    if (hasCategory) {
      let category = "Learn"
      if (trimmed.toLowerCase().includes("[practice]")) category = "Practice"
      else if (trimmed.toLowerCase().includes("[build]")) category = "Build"
      else if (trimmed.toLowerCase().includes("[publish")) category = "Publish-Share"
      else if (trimmed.toLowerCase().includes("[earn")) category = "Earn-Apply"

      const title = trimmed
        .replace(/\[.*?\]/g, "")
        .replace(/\|.*$/, "")
        .replace(/^[-*•]\s*/, "")
        .trim()

      if (title.length > 5) {
        tasks.push({
          id: `task_${String(taskId).padStart(3, "0")}`,
          category,
          title,
          completed: false,
          note: "",
          proofLink: "",
          addedAt: new Date().toISOString()
        })
        taskId++
      }
    }
  })

  return tasks
}

export function getCompletionPercent(tasks) {
  if (!tasks || tasks.length === 0) return 0
  const completed = tasks.filter(t => t.completed).length
  return Math.round((completed / tasks.length) * 100)
}

export function getCurrentPhase(percent) {
  if (percent < 10) return { phase: 1, name: "Phase 1: Foundation" }
  if (percent < 30) return { phase: 2, name: "Phase 2: Core Skills" }
  if (percent < 55) return { phase: 3, name: "Phase 3: Practice" }
  if (percent < 75) return { phase: 4, name: "Phase 4: Build & Publish" }
  return { phase: 5, name: "Phase 5: Earn & Apply" }
}

export function getNextTask(tasks) {
  return tasks.find(t => !t.completed) || null
}

export function groupTasksByCategory(tasks) {
  const order = ["Learn", "Practice", "Build", "Publish-Share", "Earn-Apply"]
  const groups = {}
  order.forEach(cat => { groups[cat] = [] })
  tasks.forEach(task => {
    const cat = task.category || "Learn"
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(task)
  })
  return groups
}