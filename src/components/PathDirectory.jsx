import { useMemo, useState } from "react"
import { save, load } from "../logic/storage"
import { AI_WEB3_OPPORTUNITIES } from "../data/paths"

const CATEGORY_FILTERS = ["All", "AI", "Web3", "AI x Web3"]

function PathDirectory({ setCurrentScreen, setSelectedPath }) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [showProfileRequired, setShowProfileRequired] = useState(false)
  const [pendingPathName, setPendingPathName] = useState("")

  const paths = Array.isArray(AI_WEB3_OPPORTUNITIES)
    ? AI_WEB3_OPPORTUNITIES
    : []

  const categoryCounts = useMemo(() => {
    return paths.reduce(
      (acc, path) => {
        const category = getPathCategory(path)
        acc.All += 1
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      { All: 0, AI: 0, Web3: 0, "AI x Web3": 0 }
    )
  }, [paths])

  const filteredPaths = useMemo(() => {
    const term = search.trim().toLowerCase()

    return paths.filter(path => {
      const pathCategory = getPathCategory(path)

      const matchesCategory =
        activeCategory === "All" || pathCategory === activeCategory

      const searchableText = getSearchableText(path)

      const matchesSearch =
        !term || searchableText.includes(term)

      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory, paths])

  function choosePath(path) {
    save("selectedPath", path)

    if (typeof setSelectedPath === "function") {
      setSelectedPath(path)
    }

    const profile = load("profile")

    if (!profile) {
      setPendingPathName(path?.name || "this path")
      setShowProfileRequired(true)
      return
    }

    if (typeof setCurrentScreen === "function") {
      setCurrentScreen("guideSelect")
    }
  }

  function goToResults() {
    if (typeof setCurrentScreen === "function") {
      setCurrentScreen("results")
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {showProfileRequired && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <p style={styles.modalKicker}>PROFILE REQUIRED</p>

              <h2 style={styles.modalTitle}>Create your VEKTÖR profile first</h2>

              <p style={styles.modalText}>
                You selected{" "}
                <span style={styles.modalHighlight}>{pendingPathName}</span>.
                VEKTÖR needs your background, strengths, available time,
                urgency, budget, and learning style before it can generate a
                personalised guide for this path.
              </p>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowProfileRequired(false)}
                  style={styles.modalSecondaryButton}
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setShowProfileRequired(false)

                    if (typeof setCurrentScreen === "function") {
                      setCurrentScreen("form")
                    }
                  }}
                  style={styles.modalPrimaryButton}
                >
                  Create Profile →
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.header}>
          <p style={styles.kicker}>PATH DIRECTORY</p>

          <h1 style={styles.title}>Explore All VEKTÖR Paths</h1>

          <p style={styles.subtitle}>
            Browse every AI, Web3, and AI x Web3 opportunity path available in
            VEKTÖR. If your recommended paths do not feel right, choose manually
            from the full directory.
          </p>

          <div style={styles.noticeBox}>
            <p style={styles.noticeTitle}>Current 2026 Opportunity Map</p>
            <p style={styles.noticeText}>
              These are VEKTÖR’s current mapped opportunity paths across AI,
              Web3, and the AI x Web3 intersection as of 2026. This directory
              is not permanent. It will be updated from time to time as new
              roles, tools, markets, and opportunity paths emerge.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button onClick={goToResults} style={styles.secondaryButton}>
              Back to Results
            </button>
          </div>
        </div>

        <div style={styles.searchCard}>
          <label style={styles.searchLabel}>Search paths</label>

          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by name, skill, earning route, difficulty..."
            style={styles.searchInput}
          />

          <div style={styles.filterRow}>
            {CATEGORY_FILTERS.map(category => {
              const isActive = activeCategory === category

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    ...styles.filterButton,
                    ...(isActive ? styles.filterButtonActive : {})
                  }}
                >
                  {category} ({categoryCounts[category] || 0})
                </button>
              )
            })}
          </div>

          <p style={styles.countText}>
            Showing {filteredPaths.length} of {paths.length} paths
          </p>
        </div>

        {paths.length === 0 && (
          <div style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>No paths found</h2>
            <p style={styles.emptyText}>
              VEKTÖR could not load the path directory. Check that
              `AI_WEB3_OPPORTUNITIES` is exported correctly from your paths file.
            </p>
          </div>
        )}

        {paths.length > 0 && filteredPaths.length === 0 && (
          <div style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>No matching paths</h2>
            <p style={styles.emptyText}>
              Try a different search term like “AI”, “research”, “community”,
              “trading”, “content”, “developer”, or switch category filters.
            </p>
          </div>
        )}

        <div style={styles.grid}>
          {filteredPaths.map(path => {
            const pathCategory = getPathCategory(path)

            return (
              <div key={path.pathId || path.name} style={styles.card}>
                <div style={styles.cardTop}>
                  <p style={styles.pathId}>
                    {path.pathId || "path"}
                  </p>

                  <span style={styles.categoryBadge}>
                    {pathCategory}
                  </span>
                </div>

                <h2 style={styles.pathName}>
                  {path.name || "Unnamed Path"}
                </h2>

                <div style={styles.badgeRow}>
                  {path.difficulty && (
                    <span style={styles.badge}>
                      {path.difficulty}
                    </span>
                  )}

                  {path.pathType && (
                    <span style={styles.mutedBadge}>
                      {path.pathType}
                    </span>
                  )}
                </div>

                <div style={styles.metaGrid}>
                  <InfoBlock
                    label="Subcategory"
                    value={formatValue(path.subcategory)}
                  />

                  <InfoBlock
                    label="Timeline"
                    value={formatValue(path.timeline)}
                  />

                  <InfoBlock
                    label="Earning Potential"
                    value={formatIncome(path.earningPotential)}
                  />

                  <InfoBlock
                    label="First Money Route"
                    value={formatValue(path.firstMoneyRoute)}
                  />

                  <InfoBlock
                    label="Best For"
                    value={formatValue(path.bestFor)}
                  />
                </div>

                {path.whyItFits && (
                  <p style={styles.description}>
                    <span style={styles.descriptionLabel}>Why it fits: </span>
                    {path.whyItFits}
                  </p>
                )}

                <button
                  onClick={() => choosePath(path)}
                  style={styles.primaryButton}
                >
                  Choose This Path →
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div style={styles.infoBlock}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={styles.infoValue}>{value}</p>
    </div>
  )
}

function getPathCategory(path) {
  const combinedText = [
    path.category,
    path.subcategory,
    path.name,
    path.pathId,
    ...(Array.isArray(path.interestTags) ? path.interestTags : []),
    ...(Array.isArray(path.requiredSkillTags) ? path.requiredSkillTags : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const hasAI =
    combinedText.includes("ai") ||
    combinedText.includes("artificial intelligence")

  const hasWeb3 =
    combinedText.includes("web3") ||
    combinedText.includes("crypto") ||
    combinedText.includes("blockchain") ||
    combinedText.includes("defi") ||
    combinedText.includes("on-chain")

  if (
    combinedText.includes("ai x web3") ||
    combinedText.includes("ai/web3") ||
    combinedText.includes("ai-web3") ||
    combinedText.includes("both") ||
    (hasAI && hasWeb3)
  ) {
    return "AI x Web3"
  }

  if (hasWeb3) return "Web3"
  if (hasAI) return "AI"

  return "AI"
}

function getSearchableText(path) {
  return [
    path.name,
    path.pathId,
    path.category,
    path.subcategory,
    path.pathType,
    path.firstMoneyRoute,
    path.timeline,
    formatIncome(path.earningPotential),
    path.difficulty,
    path.whyItFits,
    path.whyItMayNot,
    formatValue(path.bestFor, ""),
    formatValue(path.avoidIf, ""),
    formatValue(path.skillsNeeded, ""),
    formatValue(path.toolsToLearn, ""),
    formatValue(path.minimumProofOfWork, ""),
    formatValue(path.portfolioProjects, ""),
    formatValue(path.proofOfWorkExamples, ""),
    formatValue(path.monetizationMethods, ""),
    formatValue(path.opportunitySources, "")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function formatValue(value, fallback = "Not specified") {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : fallback
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .filter(item => typeof item === "string" || typeof item === "number")
      .join(" · ") || fallback
  }

  return value || fallback
}

function formatIncome(value) {
  if (!value) return "Not specified"

  if (typeof value === "string") return value

  if (typeof value === "object") {
    const parts = []

    if (value.beginner) parts.push(`Beginner: ${value.beginner}`)
    if (value.earlyCompetent) parts.push(`Early: ${value.earlyCompetent}`)
    if (value.skilled) parts.push(`Skilled: ${value.skilled}`)
    if (value.elite) parts.push(`Elite: ${value.elite}`)

    return parts.length > 0 ? parts.join(" · ") : "Not specified"
  }

  return String(value)
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
    maxWidth: "1100px",
    margin: "0 auto"
  },
  header: {
    marginBottom: "24px"
  },
  kicker: {
    color: "#00ff88",
    fontSize: "12px",
    letterSpacing: "2px",
    margin: "0 0 10px"
  },
  title: {
    color: "#fff",
    fontSize: "34px",
    lineHeight: "1.2",
    margin: "0 0 12px"
  },
  subtitle: {
    color: "#888",
    fontSize: "14px",
    lineHeight: "1.7",
    maxWidth: "760px",
    margin: "0 0 18px"
  },
  noticeBox: {
    background: "#001a0d",
    border: "1px solid #00ff88",
    borderRadius: "12px",
    padding: "16px",
    maxWidth: "820px",
    marginBottom: "18px"
  },
  noticeTitle: {
    color: "#00ff88",
    fontSize: "13px",
    fontWeight: "bold",
    margin: "0 0 8px"
  },
  noticeText: {
    color: "#aaa",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  searchCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px"
  },
  searchLabel: {
    display: "block",
    color: "#555",
    fontSize: "12px",
    marginBottom: "8px"
  },
  searchInput: {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    padding: "14px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px"
  },
  filterButton: {
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  filterButtonActive: {
    background: "#00ff88",
    color: "#000",
    border: "1px solid #00ff88"
  },
  countText: {
    color: "#555",
    fontSize: "12px",
    margin: "12px 0 0"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px"
  },
  pathId: {
    color: "#555",
    fontSize: "11px",
    margin: 0,
    wordBreak: "break-word"
  },
  categoryBadge: {
    color: "#000",
    background: "#00ff88",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "bold",
    whiteSpace: "nowrap"
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  badge: {
    color: "#00ff88",
    border: "1px solid #00ff88",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "11px",
    whiteSpace: "nowrap"
  },
  mutedBadge: {
    color: "#888",
    border: "1px solid #333",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "11px",
    whiteSpace: "nowrap"
  },
  pathName: {
    color: "#fff",
    fontSize: "19px",
    lineHeight: "1.4",
    margin: 0
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px"
  },
  infoBlock: {
    background: "#0a0a0a",
    border: "1px solid #1d1d1d",
    borderRadius: "8px",
    padding: "10px"
  },
  infoLabel: {
    color: "#555",
    fontSize: "11px",
    margin: "0 0 5px"
  },
  infoValue: {
    color: "#aaa",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: 0
  },
  description: {
    color: "#888",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },
  descriptionLabel: {
    color: "#00ff88",
    fontWeight: "bold"
  },
  primaryButton: {
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "13px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "auto"
  },
  secondaryButton: {
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  emptyCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "24px",
    marginTop: "16px"
  },
  emptyTitle: {
    color: "#fff",
    fontSize: "18px",
    margin: "0 0 8px"
  },
  emptyText: {
    color: "#888",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.72)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box"
  },
  modalCard: {
    width: "100%",
    maxWidth: "480px",
    background: "#111",
    border: "1px solid #222",
    borderRadius: "14px",
    padding: "26px",
    boxSizing: "border-box",
    boxShadow: "0 20px 70px rgba(0,0,0,0.45)"
  },
  modalKicker: {
    color: "#00ff88",
    fontSize: "11px",
    letterSpacing: "2px",
    fontWeight: "bold",
    margin: "0 0 10px"
  },
  modalTitle: {
    color: "#fff",
    fontSize: "22px",
    lineHeight: "1.3",
    margin: "0 0 12px"
  },
  modalText: {
    color: "#aaa",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: "0 0 22px"
  },
  modalHighlight: {
    color: "#00ff88",
    fontWeight: "bold"
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  modalSecondaryButton: {
    flex: 1,
    minWidth: "130px",
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  modalPrimaryButton: {
    flex: 1,
    minWidth: "160px",
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer"
  }
}

export default PathDirectory