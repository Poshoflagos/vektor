// src/components/PasteResult.jsx
import { useMemo, useState } from "react";
import { createReport, upsertReport } from "../logic/storage";
import { validateVektorGuide } from "../logic/guideValidator";
import { parseVektorGuide, getParsedGuideStats } from "../logic/guideParser";
import { buildTrackerBundleFromGuide } from "../logic/trackerBuilder";

const MIN_PROCESSING_MS = 220;

function getTodayKey(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-CA");
  }

  return date.toLocaleDateString("en-CA");
}

function getReportContent(report) {
  return String(report?.rawOutput || report?.content || "").trim();
}

function hasDuplicateFromToday(savedReports = [], text = "", title = "") {
  const today = new Date().toLocaleDateString("en-CA");
  const incomingText = String(text || "").trim();

  return savedReports.find((report) => {
    const reportDate = getTodayKey(report.createdAt || report.savedAt);
    const sameDay = reportDate === today;
    const sameContent = getReportContent(report) === incomingText;
    const sameTitle = title && report.title === title;

    return sameDay && (sameContent || sameTitle);
  });
}

function getSelectedPathName({ selectedPath, recommendedPaths }) {
  if (selectedPath?.title || selectedPath?.name) {
    return selectedPath.title || selectedPath.name;
  }

  if (typeof selectedPath === "string") {
    return selectedPath;
  }

  if (Array.isArray(recommendedPaths) && recommendedPaths[0]) {
    return recommendedPaths[0].title || recommendedPaths[0].name || "Selected Path";
  }

  if (recommendedPaths?.best?.[0]) {
    const best = recommendedPaths.best[0];

    if (typeof best === "object") {
      return best.title || best.name || best.pathId || "Selected Path";
    }

    return best;
  }

  return "Selected Path";
}

export default function PasteResult({
  recommendedPaths,
  selectedPath,
  guideType,
  setCurrentScreen,
  savedReports = [],
  setSavedReports,
  pastedOutput = "",
  setPastedOutput,
  setActiveGuide,
  setActiveReportId,
  setTrackerData,
  setTrackerProgress,
}) {
  const [localText, setLocalText] = useState(pastedOutput || "");
  const [validationResult, setValidationResult] = useState(null);
  const [parsedGuide, setParsedGuide] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({
    type: "idle",
    message: "",
    details: [],
  });
  const [duplicateReport, setDuplicateReport] = useState(null);
  const [successSummary, setSuccessSummary] = useState(null);

  const charCount = localText.length;

  const parsedStats = useMemo(() => {
    if (!parsedGuide) {
      return {
        phaseCount: 0,
        weekCount: 0,
        taskCount: 0,
      };
    }

    return getParsedGuideStats(parsedGuide);
  }, [parsedGuide]);

  function updateText(value) {
    setLocalText(value);

    if (typeof setPastedOutput === "function") {
      setPastedOutput(value);
    }

    setValidationResult(null);
    setParsedGuide(null);
    setDuplicateReport(null);
    setSuccessSummary(null);
    setStatus({
      type: "idle",
      message: "",
      details: [],
    });
  }

  function validateAndParseGuide() {
    const text = localText.trim();
    const validation = validateVektorGuide(text);

    setValidationResult(validation);

    if (!validation.valid) {
      setParsedGuide(null);
      setDuplicateReport(null);
      setStatus({
        type: "error",
        message: validation.message,
        details: validation.details || [],
      });
      return null;
    }

    const parsed = parseVektorGuide(text);

    if (!parsed.success) {
      setParsedGuide(null);
      setDuplicateReport(null);
      setStatus({
        type: "error",
        message: "The guide marker is present, but the tracker JSON is invalid.",
        details: [parsed.error],
      });
      return null;
    }

    const duplicate = hasDuplicateFromToday(
      savedReports,
      text,
      parsed.data.guideTitle
    );

    setParsedGuide(parsed.data);
    setDuplicateReport(duplicate || null);

    setStatus({
      type: duplicate ? "warning" : "success",
      message: duplicate
        ? "Valid guide detected, but a similar report already exists from today."
        : "Valid VEKTÖR guide detected. Ready to save.",
      details: duplicate
        ? ["Submitting again will not create a duplicate report. The existing report will remain active."]
        : validation.warnings || [],
    });

    return parsed.data;
  }

  function handleValidate() {
    validateAndParseGuide();
  }

  function handleSubmit() {
    const text = localText.trim();

    if (!text) {
      setStatus({
        type: "error",
        message: "Paste the full VEKTÖR guide before submitting.",
        details: [],
      });
      return;
    }

    setIsProcessing(true);
    setStatus({
      type: "info",
      message: "Validating and building your tracker...",
      details: [],
    });

    window.setTimeout(() => {
      const guide = parsedGuide || validateAndParseGuide();

      if (!guide) {
        setIsProcessing(false);
        return;
      }

      const trackerBundle = buildTrackerBundleFromGuide(guide);
      const report = createReport({
        title: guide.guideTitle,
        recommendedPath:
          guide.recommendedPath ||
          getSelectedPathName({ selectedPath, recommendedPaths }),
        pathName: getSelectedPathName({ selectedPath, recommendedPaths }),
        guideType: guideType || "VEKTOR_GUIDE_V1",
        content: text,
        rawOutput: text,
        parsedGuide: guide,
        trackerSummary: trackerBundle.trackerSummary,
      });

      const reportResult = upsertReport(report);
      const activeReport = reportResult.report;
      const trackerWithSource = {
        ...trackerBundle.trackerData,
        sourceReportId: activeReport.id,
      };

      if (typeof setSavedReports === "function") {
        setSavedReports(reportResult.reports);
      }

      if (typeof setActiveGuide === "function") {
        setActiveGuide(guide);
      }

      if (typeof setActiveReportId === "function") {
        setActiveReportId(activeReport.id);
      }

      if (typeof setTrackerData === "function") {
        setTrackerData(trackerWithSource);
      }

      if (typeof setTrackerProgress === "function") {
        setTrackerProgress(trackerBundle.trackerProgress);
      }

      setLocalText("");

      if (typeof setPastedOutput === "function") {
        setPastedOutput("");
      }

      setSuccessSummary({
        title: guide.guideTitle,
        path: guide.recommendedPath,
        phaseCount: trackerBundle.trackerSummary.phaseCount,
        weekCount: trackerBundle.trackerSummary.weekCount,
        taskCount: trackerBundle.trackerSummary.taskCount,
        duplicate: reportResult.duplicate,
      });

      setStatus({
        type: reportResult.duplicate ? "warning" : "success",
        message: reportResult.duplicate
          ? "This guide was already saved today. The existing report has been used."
          : "Report saved. Tracker built successfully.",
        details: [],
      });

      setDuplicateReport(reportResult.duplicate ? activeReport : null);
      setIsProcessing(false);
    }, MIN_PROCESSING_MS);
  }

  return (
    <section className="page-container stack" aria-label="Paste VEKTÖR guide">
      <header className="page-header">
        <p className="page-kicker">Step 4 of 4</p>
        <h1>Paste Your VEKTÖR Guide</h1>
        <p>
          Paste the full response from ChatGPT, Claude, or Gemini. VEKTÖR will
          only accept a valid <span className="text-accent">VEKTOR_GUIDE_V1</span>{" "}
          output with structured tracker JSON.
        </p>
      </header>

      <section className="card stack">
        <h2>External LLM Flow</h2>

        <div className="stack">
          <div className="row">
            <span className="badge">1</span>
            <span>Open ChatGPT, Claude, or Gemini in another tab.</span>
          </div>
          <div className="row">
            <span className="badge">2</span>
            <span>Paste the VEKTÖR prompt you copied and generate the guide.</span>
          </div>
          <div className="row">
            <span className="badge">3</span>
            <span>Copy the full response starting from VEKTOR_GUIDE_V1.</span>
          </div>
          <div className="row">
            <span className="badge">4</span>
            <span>Paste it below, validate it, then submit.</span>
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="row-between">
          <label htmlFor="vektorGuidePaste">Your VEKTÖR Guide</label>
          <span className="badge">{charCount} characters</span>
        </div>

        <textarea
          id="vektorGuidePaste"
          value={localText}
          onChange={(event) => updateText(event.target.value)}
          placeholder="Paste the full VEKTOR_GUIDE_V1 output here..."
          aria-describedby="pasteGuideHelp"
        />

        <p id="pasteGuideHelp" className="muted">
          Random notes, incomplete LLM replies, or guides without TRACKER_JSON
          will be rejected.
        </p>

        {status.message && (
          <div
            className={`status-message ${
              status.type === "denied" ? "error" : status.type
            }`}
            role={status.type === "error" ? "alert" : "status"}
          >
            <strong>{status.message}</strong>
            {status.details?.length > 0 && (
              <ul>
                {status.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {validationResult?.valid && parsedGuide && (
          <div className="notice-card active stack">
            <div className="row-between">
              <div>
                <p className="page-kicker">Validated Guide</p>
                <h3>{parsedGuide.guideTitle}</h3>
                <p>{parsedGuide.recommendedPath}</p>
              </div>
              <span className="badge active">{parsedGuide.userLevel}</span>
            </div>

            <div className="card-grid">
              <div className="dashboard-card">
                <p className="page-kicker">Phases</p>
                <h3>{parsedStats.phaseCount}</h3>
              </div>
              <div className="dashboard-card">
                <p className="page-kicker">Weeks</p>
                <h3>{parsedStats.weekCount}</h3>
              </div>
              <div className="dashboard-card">
                <p className="page-kicker">Tasks</p>
                <h3>{parsedStats.taskCount}</h3>
              </div>
              <div className="dashboard-card">
                <p className="page-kicker">Duplicate</p>
                <h3>{duplicateReport ? "Yes" : "No"}</h3>
              </div>
            </div>
          </div>
        )}

        {successSummary && (
          <div className="status-message success stack">
            <strong>
              {successSummary.duplicate
                ? "Existing report loaded."
                : "Guide saved successfully."}
            </strong>
            <span>Title: {successSummary.title}</span>
            <span>Path: {successSummary.path}</span>
            <span>
              Structure: {successSummary.phaseCount} phases,{" "}
              {successSummary.weekCount} weeks, {successSummary.taskCount} tasks
            </span>
            <button
              type="button"
              className="primary"
              onClick={() => setCurrentScreen("tracker")}
            >
              View Tracker →
            </button>
          </div>
        )}

        <div className="actions">
          <button type="button" onClick={handleValidate} disabled={isProcessing || !localText.trim()}>
            Validate Guide
          </button>

          <button
            type="button"
            className="primary"
            onClick={handleSubmit}
            disabled={isProcessing || !localText.trim()}
          >
            {isProcessing ? "Processing..." : "Submit & Build Tracker →"}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => setCurrentScreen("prompt")}
            disabled={isProcessing}
          >
            ← Back to Prompt
          </button>
        </div>
      </section>
    </section>
  );
}