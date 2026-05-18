// src/components/SavedReports.jsx
import { useEffect, useMemo, useState } from "react";
import { deleteReport, load } from "../logic/storage";
import { buildTrackerBundleFromGuide } from "../logic/trackerBuilder";

function getReportDate(report) {
  const value = report?.createdAt || report?.savedAt;

  if (!value) return report?.date || "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return report?.date || "Unknown date";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getReportTitle(report) {
  return report?.title || report?.pathName || report?.recommendedPath || "Untitled VEKTÖR Report";
}

function getReportPath(report) {
  return report?.recommendedPath || report?.pathName || "Unknown Path";
}

function getGuidePhases(report) {
  return Array.isArray(report?.parsedGuide?.phases) ? report.parsedGuide.phases : [];
}

function getPhaseTitle(phase, index) {
  return phase?.phaseTitle || phase?.title || `Phase ${index + 1}`;
}

function getWeeks(phase) {
  return Array.isArray(phase?.weeks) ? phase.weeks : [];
}

function getTasks(week) {
  return Array.isArray(week?.tasks) ? week.tasks : [];
}

function getTotalTasks(report) {
  return getGuidePhases(report).reduce((phaseTotal, phase) => {
    return (
      phaseTotal +
      getWeeks(phase).reduce((weekTotal, week) => weekTotal + getTasks(week).length, 0)
    );
  }, 0);
}

function sortReports(reports, sortMode) {
  const copy = [...reports];

  if (sortMode === "oldest") {
    return copy.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.savedAt || 0).getTime();
      const bTime = new Date(b.createdAt || b.savedAt || 0).getTime();

      return aTime - bTime;
    });
  }

  if (sortMode === "path") {
    return copy.sort((a, b) => getReportPath(a).localeCompare(getReportPath(b)));
  }

  return copy.sort((a, b) => {
    const aTime = new Date(a.createdAt || a.savedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.savedAt || 0).getTime();

    return bTime - aTime;
  });
}

export default function SavedReports({
  setCurrentScreen,
  savedReports,
  setSavedReports,
  activeReportId,
  setActiveReportId,
  setActiveGuide,
  setTrackerData,
  setTrackerProgress,
}) {
  const [localReports, setLocalReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [deletePendingId, setDeletePendingId] = useState(null);
  const [sortMode, setSortMode] = useState("newest");
  const [status, setStatus] = useState({
    type: "idle",
    message: "",
  });

  const reports = Array.isArray(savedReports) ? savedReports : localReports;

  useEffect(() => {
    if (Array.isArray(savedReports)) return;

    const loadedReports = load("reports", []) || [];
    setLocalReports(Array.isArray(loadedReports) ? loadedReports : []);
  }, [savedReports]);

  const sortedReports = useMemo(() => sortReports(reports, sortMode), [reports, sortMode]);

  const activeReport = reports.find((report) => report.id === activeReportId) || null;

  function updateReports(nextReports) {
    if (typeof setSavedReports === "function") {
      setSavedReports(nextReports);
      return;
    }

    setLocalReports(nextReports);
  }

  function toggleExpand(reportId) {
    setExpandedId((currentId) => (currentId === reportId ? null : reportId));
    setDeletePendingId(null);
    setStatus({
      type: "idle",
      message: "",
    });
  }

  function requestDelete(reportId) {
    if (deletePendingId !== reportId) {
      setDeletePendingId(reportId);
      setStatus({
        type: "warning",
        message: "Click Confirm Delete to remove this report.",
      });
      return;
    }

    const nextReports = deleteReport(reportId);
    updateReports(nextReports);

    if (activeReportId === reportId) {
      if (typeof setActiveReportId === "function") setActiveReportId(null);
      if (typeof setActiveGuide === "function") setActiveGuide(null);
      if (typeof setTrackerData === "function") setTrackerData(null);
      if (typeof setTrackerProgress === "function") setTrackerProgress({});
    }

    if (expandedId === reportId) {
      setExpandedId(null);
    }

    setDeletePendingId(null);
    setStatus({
      type: "success",
      message: "Report deleted.",
    });
  }

  function makeReportActive(report) {
    if (!report?.parsedGuide) {
      setStatus({
        type: "error",
        message: "This report has no structured guide data. Paste a VEKTOR_GUIDE_V1 report to build a tracker.",
      });
      return;
    }

    const trackerBundle = buildTrackerBundleFromGuide(report.parsedGuide, {
      sourceReportId: report.id,
    });

    const trackerWithSource = {
      ...trackerBundle.trackerData,
      sourceReportId: report.id,
    };

    if (typeof setActiveReportId === "function") setActiveReportId(report.id);
    if (typeof setActiveGuide === "function") setActiveGuide(report.parsedGuide);
    if (typeof setTrackerData === "function") setTrackerData(trackerWithSource);
    if (typeof setTrackerProgress === "function") setTrackerProgress(trackerBundle.trackerProgress);

    setStatus({
      type: "success",
      message: "Report is now the active tracker source.",
    });
  }

  return (
    <section className="page-container stack" aria-label="Saved reports">
      <header className="page-header">
        <p className="page-kicker">Archive</p>
        <div className="row-between">
          <div>
            <h1>Saved Reports</h1>
            <p>
              {reports.length} report{reports.length === 1 ? "" : "s"} saved.
              {activeReport ? ` Active: ${getReportTitle(activeReport)}` : ""}
            </p>
          </div>

          <button type="button" onClick={() => setCurrentScreen("welcome")}>
            ← Dashboard
          </button>
        </div>
      </header>

      {status.message && (
        <div className={`status-message ${status.type}`} role={status.type === "error" ? "alert" : "status"}>
          {status.message}
        </div>
      )}

      {reports.length > 0 && (
        <section className="card row-between" aria-label="Report controls">
          <div>
            <p className="page-kicker">Sort</p>
            <h2>Report Library</h2>
          </div>

          <div className="actions">
            <button
              type="button"
              className={sortMode === "newest" ? "primary" : "secondary"}
              onClick={() => setSortMode("newest")}
            >
              Newest
            </button>
            <button
              type="button"
              className={sortMode === "oldest" ? "primary" : "secondary"}
              onClick={() => setSortMode("oldest")}
            >
              Oldest
            </button>
            <button
              type="button"
              className={sortMode === "path" ? "primary" : "secondary"}
              onClick={() => setSortMode("path")}
            >
              By Path
            </button>
          </div>
        </section>
      )}

      {reports.length === 0 ? (
        <section className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 3h7l5 5v13H7V3Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M14 3v5h5M9.5 13h7M9.5 16h5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <h2>No saved reports yet</h2>
          <p>
            Paste a valid VEKTÖR guide and it will appear here with a tracker-ready structure.
          </p>
          <button type="button" className="primary" onClick={() => setCurrentScreen("paste")}>
            Paste Guide →
          </button>
        </section>
      ) : (
        <section className="reports-grid">
          {sortedReports.map((report) => {
            const isExpanded = expandedId === report.id;
            const isActive = activeReportId === report.id;
            const phases = getGuidePhases(report);
            const totalTasks = getTotalTasks(report);
            const hasStructuredGuide = Boolean(report.parsedGuide);

            return (
              <article
                key={report.id}
                className={`report-card stack ${isActive ? "active" : ""}`}
              >
                <div className="row-between">
                  <div>
                    <p className="page-kicker">{getReportDate(report)}</p>
                    <h2>{getReportTitle(report)}</h2>
                  </div>

                  {isActive && <span className="badge active">Active</span>}
                </div>

                <div className="report-meta">
                  <span className="badge">{getReportPath(report)}</span>
                  <span className="badge">{phases.length} phases</span>
                  <span className="badge">{totalTasks} tasks</span>
                  {!hasStructuredGuide && <span className="badge">Legacy</span>}
                </div>

                <div className="actions">
                  <button type="button" onClick={() => toggleExpand(report.id)}>
                    {isExpanded ? "Close View" : "View"}
                  </button>

                  <button
                    type="button"
                    className={isActive ? "secondary" : "primary"}
                    onClick={() => makeReportActive(report)}
                    disabled={!hasStructuredGuide}
                  >
                    {isActive ? "Active Tracker" : "Make Active"}
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => requestDelete(report.id)}
                  >
                    {deletePendingId === report.id ? "Confirm Delete" : "Delete"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="report-expanded stack">
                    <div>
                      <p className="page-kicker">Report Summary</p>
                      <p>
                        Path: <span className="text-accent">{getReportPath(report)}</span>
                      </p>
                      <p>
                        Created: <span>{getReportDate(report)}</span>
                      </p>
                      <p>
                        Total tasks: <span>{totalTasks}</span>
                      </p>
                    </div>

                    {hasStructuredGuide ? (
                      <div className="stack">
                        {phases.map((phase, phaseIndex) => {
                          const weeks = getWeeks(phase);
                          const phaseTaskCount = weeks.reduce(
                            (total, week) => total + getTasks(week).length,
                            0
                          );

                          return (
                            <div className="notice-card" key={phase.phaseId || phase.id || phaseIndex}>
                              <div className="row-between">
                                <h3>{getPhaseTitle(phase, phaseIndex)}</h3>
                                <span className="badge">{phaseTaskCount} tasks</span>
                              </div>

                              <div className="stack">
                                {weeks.map((week, weekIndex) => (
                                  <div
                                    className="row-between"
                                    key={week.weekId || week.id || weekIndex}
                                  >
                                    <span>
                                      {week.weekTitle || week.title || `Week ${weekIndex + 1}`}
                                    </span>
                                    <span className="badge">{getTasks(week).length} tasks</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="status-message warning">
                        This is a legacy text report. It can be viewed in old storage, but it cannot
                        rebuild a hierarchical tracker unless it is regenerated with VEKTOR_GUIDE_V1.
                      </div>
                    )}

                    <button type="button" onClick={() => setExpandedId(null)}>
                      Close
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </section>
  );
}