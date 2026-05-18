// src/components/Tracker.jsx
import { useEffect, useMemo, useState } from "react";
import { load, save } from "../logic/storage";
import {
  calculatePhaseProgress,
  calculateTrackerProgress,
  calculateWeekProgress,
  getCurrentPhaseAndWeek,
  isTaskComplete,
  summarizeTracker,
  toggleTaskProgress,
} from "../logic/trackerBuilder";

const FILTERS = {
  ALL: "all",
  INCOMPLETE: "incomplete",
  COMPLETED: "completed",
  CATEGORY: "category",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getTaskId(task) {
  return task?.id || task?.taskId;
}

function getCategories(trackerData) {
  const categories = new Set();
  safeArray(trackerData?.phases).forEach((phase) => {
    safeArray(phase.weeks).forEach((week) => {
      safeArray(week.tasks).forEach((task) => {
        if (task.category) categories.add(task.category);
      });
    });
  });
  return Array.from(categories).sort();
}

function getDefaultOpenState(trackerData, trackerProgress) {
  const current = getCurrentPhaseAndWeek(trackerData, trackerProgress);
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    return { phases: {}, weeks: {} };
  }

  const phaseId = current.currentPhase?.id || trackerData?.phases?.[0]?.id;
  const weekId = current.currentWeek?.id || trackerData?.phases?.[0]?.weeks?.[0]?.id;

  return {
    phases: phaseId ? { [phaseId]: true } : {},
    weeks: weekId ? { [weekId]: true } : {},
  };
}

function ProgressBar({ label, progress }) {
  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress.percentage}%` }} />
      </div>
      <div style={styles.progressMeta}>
        <span style={styles.progressLabel}>{label}</span>
        <span>{progress.completed}/{progress.total} · {progress.percentage}%</span>
      </div>
    </div>
  );
}

function EmptyTracker({ setCurrentScreen }) {
  return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyIcon}>📋</div>
      <h2 style={styles.emptyTitle}>No active tracker yet</h2>
      <p style={styles.emptyText}>
        Paste a valid VEKTOR_GUIDE_V1 output and VEKTÖR will build your
        execution tracker automatically.
      </p>
      <button
        type="button"
        style={styles.primaryButton}
        onClick={() => setCurrentScreen("paste")}
      >
        Paste Guide →
      </button>
    </div>
  );
}

export default function Tracker({
  setCurrentScreen,
  trackerData: trackerDataProp,
  setTrackerData,
  trackerProgress: trackerProgressProp,
  setTrackerProgress,
  activeReportId,
}) {
  const [localTrackerData, setLocalTrackerData] = useState(null);
  const [localTrackerProgress, setLocalTrackerProgress] = useState({});
  const [openPhases, setOpenPhases] = useState({});
  const [openWeeks, setOpenWeeks] = useState({});
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [flashTaskId, setFlashTaskId] = useState(null);

  const trackerData = trackerDataProp || localTrackerData;
  const trackerProgress = trackerProgressProp || localTrackerProgress;

  useEffect(() => {
    if (trackerDataProp) return;
    const storedTracker = load("trackerData") || load("tracker");
    if (storedTracker?.phases) setLocalTrackerData(storedTracker);
    const storedProgress = load("trackerProgress") || {};
    if (storedProgress && typeof storedProgress === "object") setLocalTrackerProgress(storedProgress);
  }, [trackerDataProp]);

  useEffect(() => {
    if (!trackerData) return;
    const defaults = getDefaultOpenState(trackerData, trackerProgress);
    setOpenPhases((current) => (Object.keys(current).length ? current : defaults.phases));
    setOpenWeeks((current) => (Object.keys(current).length ? current : defaults.weeks));
  }, [trackerData, trackerProgress]);

  const summary = useMemo(() => summarizeTracker(trackerData, trackerProgress), [trackerData, trackerProgress]);
  const overallProgress = useMemo(() => calculateTrackerProgress(trackerData, trackerProgress), [trackerData, trackerProgress]);
  const categories = useMemo(() => getCategories(trackerData), [trackerData]);

  function updateProgress(nextProgress) {
    if (typeof setTrackerProgress === "function") {
      setTrackerProgress(nextProgress);
      return;
    }
    setLocalTrackerProgress(nextProgress);
    save("trackerProgress", nextProgress);
  }

  function handleToggleTask(taskId) {
    if (!taskId) return;
    const nextProgress = toggleTaskProgress(trackerProgress, taskId);
    updateProgress(nextProgress);
    setFlashTaskId(taskId);
    window.setTimeout(() => setFlashTaskId(null), 220);
  }

  function togglePhase(phaseId) {
    setOpenPhases((current) => ({ ...current, [phaseId]: !current[phaseId] }));
  }

  function toggleWeek(weekId) {
    setOpenWeeks((current) => ({ ...current, [weekId]: !current[weekId] }));
  }

  function expandAll() {
    const nextPhases = {};
    const nextWeeks = {};
    safeArray(trackerData?.phases).forEach((phase) => {
      nextPhases[phase.id] = true;
      safeArray(phase.weeks).forEach((week) => { nextWeeks[week.id] = true; });
    });
    setOpenPhases(nextPhases);
    setOpenWeeks(nextWeeks);
  }

  function collapseAll() {
    setOpenPhases({});
    setOpenWeeks({});
  }

  function shouldShowTask(task) {
    const taskId = getTaskId(task);
    const completed = isTaskComplete(trackerProgress, taskId);
    if (filter === FILTERS.COMPLETED) return completed;
    if (filter === FILTERS.INCOMPLETE) return !completed;
    if (filter === FILTERS.CATEGORY) return categoryFilter ? task.category === categoryFilter : true;
    return true;
  }

  if (!trackerData?.phases?.length) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <p style={styles.kicker}>Execution Tracker</p>
          <h1 style={styles.title}>Tracker</h1>
        </div>
        <EmptyTracker setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.trackerMain}>
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.kicker}>Execution Tracker</p>
              <h1 style={styles.title}>{summary.guideTitle}</h1>
              <p>Path: <span style={{ color: "#00ff88" }}>{summary.recommendedPath}</span></p>
            </div>
            <div style={styles.buttonGroup}>
              <button style={styles.secondaryButton} onClick={() => setCurrentScreen("welcome")}>← Dashboard</button>
              <button style={styles.secondaryButton} onClick={() => setCurrentScreen("reports")}>Reports</button>
            </div>
          </div>

          <ProgressBar label="Overall Progress" progress={overallProgress} />

          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <p style={styles.kicker}>Current Phase</p>
              <h3>{summary.allComplete ? "Completed" : summary.currentPhase?.title || "Not started"}</h3>
            </div>
            <div style={styles.card}>
              <p style={styles.kicker}>Current Week</p>
              <h3>{summary.allComplete ? "Completed" : summary.currentWeek?.title || "Not started"}</h3>
            </div>
            <div style={styles.card}>
              <p style={styles.kicker}>Tasks</p>
              <h3>{summary.completedTasks}/{summary.taskCount}</h3>
            </div>
            <div style={styles.card}>
              <p style={styles.kicker}>Active Report</p>
              <h3>{activeReportId ? "Linked" : "Local"}</h3>
            </div>
          </div>

          {summary.allComplete && (
            <div style={styles.successMessage}>All tracker tasks are complete. Review the report, document proof, and generate the next execution guide.</div>
          )}

          <div style={styles.filterBar}>
            <button style={filter === FILTERS.ALL ? styles.primaryButtonSmall : styles.secondaryButtonSmall} onClick={() => setFilter(FILTERS.ALL)}>All</button>
            <button style={filter === FILTERS.INCOMPLETE ? styles.primaryButtonSmall : styles.secondaryButtonSmall} onClick={() => setFilter(FILTERS.INCOMPLETE)}>Incomplete</button>
            <button style={filter === FILTERS.COMPLETED ? styles.primaryButtonSmall : styles.secondaryButtonSmall} onClick={() => setFilter(FILTERS.COMPLETED)}>Completed</button>
            <button style={filter === FILTERS.CATEGORY ? styles.primaryButtonSmall : styles.secondaryButtonSmall} onClick={() => setFilter(FILTERS.CATEGORY)}>By Category</button>
            {filter === FILTERS.CATEGORY && (
              <select style={styles.select} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((cat) => <option value={cat} key={cat}>{cat}</option>)}
              </select>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button style={styles.secondaryButtonSmall} onClick={expandAll}>Expand All</button>
            <button style={styles.secondaryButtonSmall} onClick={collapseAll}>Collapse All</button>
          </div>
        </header>

        <div style={styles.phasesContainer}>
          {safeArray(trackerData.phases).map((phase) => {
            const phaseProgress = calculatePhaseProgress(phase, trackerProgress);
            const phaseOpen = Boolean(openPhases[phase.id]);
            return (
              <article key={phase.id} style={{ ...styles.phaseCard, borderColor: summary.currentPhase?.id === phase.id ? "#00ff88" : "#2a2a2a" }}>
                <button style={styles.phaseHeader} onClick={() => togglePhase(phase.id)} aria-expanded={phaseOpen}>
                  <span>
                    <p style={styles.kicker}>Phase</p>
                    <h2 style={styles.phaseTitle}>{phase.title}</h2>
                    <p style={styles.phaseGoal}>{phase.goal}</p>
                  </span>
                  <span style={styles.badge}>{phaseOpen ? "Collapse" : "Expand"}</span>
                </button>
                <ProgressBar label="Phase Progress" progress={phaseProgress} />
                {phaseOpen && (
                  <div style={styles.weeksContainer}>
                    {safeArray(phase.weeks).map((week) => {
                      const weekProgress = calculateWeekProgress(week, trackerProgress);
                      const weekOpen = Boolean(openWeeks[week.id]);
                      return (
                        <section key={week.id} style={{ ...styles.weekCard, borderColor: summary.currentWeek?.id === week.id ? "#00ff88" : "#333" }}>
                          <button style={styles.weekHeader} onClick={() => toggleWeek(week.id)} aria-expanded={weekOpen}>
                            <span>
                              <p style={styles.kicker}>Week</p>
                              <h3 style={styles.weekTitle}>{week.title}</h3>
                              <p style={styles.weekGoal}>{week.goal}</p>
                            </span>
                            <span style={styles.badge}>{weekOpen ? "Collapse" : "Expand"}</span>
                          </button>
                          <ProgressBar label="Week Progress" progress={weekProgress} />
                          {weekOpen && (
                            <div style={styles.tasksContainer}>
                              {safeArray(week.tasks).filter(shouldShowTask).map((task) => {
                                const taskId = getTaskId(task);
                                const completed = isTaskComplete(trackerProgress, taskId);
                                // FIXED: replaced <label> with <div> for better alignment, explicit checkbox size
                                return (
                                  <div
                                    key={taskId}
                                    style={{
                                      ...styles.taskRow,
                                      backgroundColor: flashTaskId === taskId ? "#1a3a2a" : "#0a0a0a",
                                      opacity: completed ? 0.7 : 1,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={completed}
                                      onChange={() => handleToggleTask(taskId)}
                                      style={{ ...styles.checkbox, width: '18px', height: '18px', marginTop: '2px' }}
                                    />
                                    <div style={styles.taskContent}>
                                      <strong style={styles.taskTitle}>{task.title}</strong>
                                      <div style={styles.taskMeta}>
                                        <span style={styles.taskBadge}>{task.category}</span>
                                        {task.estimatedTime && <span style={styles.taskBadge}>{task.estimatedTime}</span>}
                                      </div>
                                      <p style={styles.taskDesc}>{task.description}</p>
                                      <p style={styles.taskCriteria}>
                                        <span style={styles.kicker}>Completion Criteria:</span> {task.completionCriteria}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {safeArray(week.tasks).filter(shouldShowTask).length === 0 && (
                                <div style={styles.infoMessage}>No tasks match the current filter.</div>
                              )}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "#050505",
    padding: "2rem 1rem",
    fontFamily: "'Courier New', monospace",
    boxSizing: "border-box",
  },
  trackerMain: {
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "2rem",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  title: {
    color: "#00ff88",
    fontSize: "1.75rem",
    margin: "0.5rem 0",
    wordBreak: "break-word",
  },
  kicker: {
    color: "#666",
    fontSize: "0.75rem",
    letterSpacing: "1px",
    marginBottom: "0.25rem",
    textTransform: "uppercase",
  },
  buttonGroup: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#00ff88",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  primaryButtonSmall: {
    background: "#00ff88",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  secondaryButton: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  secondaryButtonSmall: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    margin: "1.5rem 0",
  },
  card: {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "1rem",
  },
  successMessage: {
    background: "#0a2a1a",
    border: "1px solid #00ff88",
    borderRadius: "6px",
    padding: "0.75rem",
    margin: "1rem 0",
    color: "#aaffcc",
    fontSize: "0.875rem",
  },
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    margin: "1rem 0",
  },
  select: {
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "4px",
    padding: "0.3rem 0.6rem",
    color: "#ccc",
    fontSize: "0.75rem",
  },
  phasesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  phaseCard: {
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    padding: "1rem",
    transition: "border 0.2s",
  },
  phaseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "0.5rem 0",
    textAlign: "left",
    flexWrap: "wrap",
    gap: "1rem",
  },
  phaseTitle: {
    fontSize: "1.25rem",
    margin: "0.25rem 0",
    color: "#00ff88",
  },
  phaseGoal: {
    fontSize: "0.875rem",
    color: "#aaa",
    margin: 0,
  },
  badge: {
    background: "#1a1a1a",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.7rem",
    color: "#ccc",
  },
  weeksContainer: {
    marginTop: "1rem",
    paddingLeft: "1rem",
    borderLeft: "2px solid #2a2a2a",
  },
  weekCard: {
    background: "#0d0d0d",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  weekHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "0.25rem 0",
    textAlign: "left",
    flexWrap: "wrap",
    gap: "1rem",
  },
  weekTitle: {
    fontSize: "1rem",
    margin: "0.25rem 0",
    color: "#00ff88",
  },
  weekGoal: {
    fontSize: "0.75rem",
    color: "#aaa",
    margin: 0,
  },
  tasksContainer: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  taskRow: {
    display: "flex",
    gap: "0.75rem",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    transition: "background 0.1s",
    alignItems: "flex-start",
  },
  checkbox: {
    accentColor: "#00ff88",
    cursor: "pointer",
    flexShrink: 0,
  },
  taskContent: {
    flex: 1,
    wordBreak: "break-word",
  },
  taskTitle: {
    fontSize: "0.9rem",
    color: "#fff",
  },
  taskMeta: {
    display: "flex",
    gap: "0.5rem",
    margin: "0.25rem 0",
    flexWrap: "wrap",
  },
  taskBadge: {
    background: "#1a2a1a",
    padding: "0.2rem 0.4rem",
    borderRadius: "4px",
    fontSize: "0.7rem",
    color: "#aaffaa",
  },
  taskDesc: {
    fontSize: "0.8rem",
    color: "#ccc",
    margin: "0.25rem 0",
    wordBreak: "break-word",
  },
  taskCriteria: {
    fontSize: "0.7rem",
    color: "#888",
    margin: "0.25rem 0 0 0",
    wordBreak: "break-word",
  },
  infoMessage: {
    padding: "1rem",
    textAlign: "center",
    color: "#666",
    background: "#0a0a0a",
    borderRadius: "6px",
    fontSize: "0.8rem",
  },
  progressContainer: {
    margin: "0.75rem 0",
  },
  progressTrack: {
    background: "#1a1a1a",
    borderRadius: "4px",
    height: "6px",
    overflow: "hidden",
  },
  progressFill: {
    background: "#00ff88",
    height: "100%",
    transition: "width 0.2s",
  },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    color: "#aaa",
    marginTop: "0.25rem",
  },
  progressLabel: {
    color: "#ccc",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "3rem 1rem",
    maxWidth: "500px",
    margin: "0 auto",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    color: "#00ff88",
    fontSize: "1.5rem",
  },
  emptyText: {
    color: "#aaa",
    margin: "1rem 0",
  },
};