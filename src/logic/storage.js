// src/logic/storage.js
// VEKTÖR V1 storage authority.
// This is the only file that should call localStorage directly.

export const STORAGE_VERSION = "2026.05.18-v1-final";

export const STORAGE_KEYS = {
  STORAGE_VERSION: "vektor_storage_version",

  ACCESS: "vektor_access",

  USER_PROFILE: "vektor_user_profile",
  SELECTED_PATH: "vektor_selected_path",
  GENERATED_PROMPT: "vektor_generated_prompt",
  PASTED_OUTPUT: "vektor_pasted_output",
  ACTIVE_GUIDE: "vektor_active_guide",
  ACTIVE_REPORT_ID: "vektor_active_report_id",
  SAVED_REPORTS: "vektor_saved_reports",
  TRACKER_DATA: "vektor_tracker_data",
  TRACKER_PROGRESS: "vektor_tracker_progress",
  CHECK_IN_DATA: "vektor_check_in_data",

  SCORES: "vektor_scores",
  PATHS: "vektor_paths",
  GUIDE_TYPE: "vektor_guide_type",
  HAS_SEEN_INTRO: "vektor_has_seen_intro",
  FEEDBACK: "vektor_feedback",
  THEME: "vektor_theme",
};

const LEGACY_KEYS = {
  access: STORAGE_KEYS.ACCESS,

  profile: STORAGE_KEYS.USER_PROFILE,
  userProfile: STORAGE_KEYS.USER_PROFILE,

  scores: STORAGE_KEYS.SCORES,
  paths: STORAGE_KEYS.PATHS,

  guideType: STORAGE_KEYS.GUIDE_TYPE,
  prompt: STORAGE_KEYS.GENERATED_PROMPT,
  generatedPrompt: STORAGE_KEYS.GENERATED_PROMPT,

  aiResult: STORAGE_KEYS.PASTED_OUTPUT,
  pastedOutput: STORAGE_KEYS.PASTED_OUTPUT,

  reports: STORAGE_KEYS.SAVED_REPORTS,
  savedReports: STORAGE_KEYS.SAVED_REPORTS,

  selectedPath: STORAGE_KEYS.SELECTED_PATH,

  tracker: STORAGE_KEYS.TRACKER_DATA,
  trackerData: STORAGE_KEYS.TRACKER_DATA,
  trackerProgress: STORAGE_KEYS.TRACKER_PROGRESS,

  activeGuide: STORAGE_KEYS.ACTIVE_GUIDE,
  activeReportId: STORAGE_KEYS.ACTIVE_REPORT_ID,

  checkInData: STORAGE_KEYS.CHECK_IN_DATA,

  hasSeenIntro: STORAGE_KEYS.HAS_SEEN_INTRO,
  feedback: STORAGE_KEYS.FEEDBACK,
  darkMode: STORAGE_KEYS.THEME,
  theme: STORAGE_KEYS.THEME,
};

const ALL_VEKTOR_KEYS = Array.from(
  new Set([
    ...Object.values(STORAGE_KEYS),
    ...Object.values(LEGACY_KEYS),
    "vektor_profile",
    "vektor_selectedPath",
    "vektor_guideType",
    "vektor_aiResult",
    "vektor_reports",
    "vektor_tracker",
    "vektor_hasSeenIntro",
    "vektor_darkmode",
  ])
);

function resolveStorageKey(key) {
  return STORAGE_KEYS[key] || LEGACY_KEYS[key] || key;
}

function safeJsonParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function isStorageAvailable() {
  try {
    const testKey = "__vektor_storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function saveToStorage(key, value) {
  if (!isStorageAvailable()) {
    return {
      ok: false,
      reason: "Browser storage is unavailable. Check private mode or browser restrictions.",
    };
  }

  try {
    localStorage.setItem(resolveStorageKey(key), JSON.stringify(value));
    return { ok: true, reason: null };
  } catch {
    return {
      ok: false,
      reason:
        "Storage is full or unavailable. Clear VEKTÖR data or reduce saved reports.",
    };
  }
}

export function loadFromStorage(key, fallback = null) {
  if (!isStorageAvailable()) return fallback;

  const item = localStorage.getItem(resolveStorageKey(key));
  return safeJsonParse(item, fallback);
}

export function removeFromStorage(key) {
  if (!isStorageAvailable()) return;

  localStorage.removeItem(resolveStorageKey(key));
}

export function clearVektorStorage() {
  if (!isStorageAvailable()) return;

  ALL_VEKTOR_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function initializeStorageVersion() {
  const storedVersion = loadFromStorage(STORAGE_KEYS.STORAGE_VERSION, null);

  if (storedVersion !== STORAGE_VERSION) {
    clearVektorStorage();
    saveToStorage(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);

    return {
      freshStart: true,
      reason: "Storage version changed. VEKTÖR started with clean local data.",
    };
  }

  return {
    freshStart: false,
    reason: null,
  };
}

export function hydrateVektorState() {
  initializeStorageVersion();

  return {
    access: loadFromStorage(STORAGE_KEYS.ACCESS, false),

    userProfile: loadFromStorage(STORAGE_KEYS.USER_PROFILE, null),
    selectedPath: loadFromStorage(STORAGE_KEYS.SELECTED_PATH, null),
    generatedPrompt: loadFromStorage(STORAGE_KEYS.GENERATED_PROMPT, ""),
    pastedOutput: loadFromStorage(STORAGE_KEYS.PASTED_OUTPUT, ""),
    activeGuide: loadFromStorage(STORAGE_KEYS.ACTIVE_GUIDE, null),
    activeReportId: loadFromStorage(STORAGE_KEYS.ACTIVE_REPORT_ID, null),
    savedReports: loadFromStorage(STORAGE_KEYS.SAVED_REPORTS, []),
    trackerData: loadFromStorage(STORAGE_KEYS.TRACKER_DATA, null),
    trackerProgress: loadFromStorage(STORAGE_KEYS.TRACKER_PROGRESS, {}),
    checkInData: loadFromStorage(STORAGE_KEYS.CHECK_IN_DATA, null),

    scores: loadFromStorage(STORAGE_KEYS.SCORES, null),
    paths: loadFromStorage(STORAGE_KEYS.PATHS, []),
    guideType: loadFromStorage(STORAGE_KEYS.GUIDE_TYPE, null),
    hasSeenIntro: loadFromStorage(STORAGE_KEYS.HAS_SEEN_INTRO, false),
    feedback: loadFromStorage(STORAGE_KEYS.FEEDBACK, null),
    theme: loadFromStorage(STORAGE_KEYS.THEME, "dark"),
  };
}

export function persistVektorState(partialState = {}) {
  Object.entries(partialState).forEach(([key, value]) => {
    saveToStorage(key, value);
  });
}

export function createReport({
  title,
  recommendedPath,
  pathName,
  guideType,
  content,
  rawOutput,
  parsedGuide,
  trackerSummary,
}) {
  const now = new Date();

  return {
    id: `rpt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: title || pathName || recommendedPath || "VEKTÖR Guide",
    recommendedPath: recommendedPath || pathName || "Unknown Path",
    pathName: pathName || recommendedPath || "Unknown Path",
    guideType: guideType || "VEKTOR_GUIDE_V1",
    content: content || rawOutput || "",
    rawOutput: rawOutput || content || "",
    parsedGuide: parsedGuide || null,
    trackerSummary: trackerSummary || null,
    date: now.toLocaleDateString("en-GB"),
    createdAt: now.toISOString(),
    savedAt: now.toISOString(),
  };
}

export function upsertReport(report) {
  const existing = loadFromStorage(STORAGE_KEYS.SAVED_REPORTS, []);
  const reportDate = new Date(report.createdAt || report.savedAt).toLocaleDateString("en-CA");

  const duplicate = existing.find((item) => {
    const itemDate = new Date(item.createdAt || item.savedAt).toLocaleDateString("en-CA");
    const sameDate = itemDate === reportDate;
    const sameTitle = item.title === report.title;
    const sameContent =
      (item.rawOutput || item.content || "").trim() ===
      (report.rawOutput || report.content || "").trim();

    return sameDate && sameTitle && sameContent;
  });

  if (duplicate) {
    return {
      saved: false,
      duplicate: true,
      report: duplicate,
      reports: existing,
    };
  }

  const updatedReports = [report, ...existing];
  saveToStorage(STORAGE_KEYS.SAVED_REPORTS, updatedReports);

  return {
    saved: true,
    duplicate: false,
    report,
    reports: updatedReports,
  };
}

export function saveReport(pathName, guideType, content) {
  const report = createReport({
    pathName,
    guideType,
    content,
    rawOutput: content,
  });

  const result = upsertReport(report);

  return result.report;
}

export function deleteReport(reportId) {
  const existing = loadFromStorage(STORAGE_KEYS.SAVED_REPORTS, []);
  const filtered = existing.filter((report) => report.id !== reportId);
  const activeReportId = loadFromStorage(STORAGE_KEYS.ACTIVE_REPORT_ID, null);

  saveToStorage(STORAGE_KEYS.SAVED_REPORTS, filtered);

  if (activeReportId === reportId) {
    removeFromStorage(STORAGE_KEYS.ACTIVE_REPORT_ID);
    removeFromStorage(STORAGE_KEYS.ACTIVE_GUIDE);
    removeFromStorage(STORAGE_KEYS.TRACKER_DATA);
    removeFromStorage(STORAGE_KEYS.TRACKER_PROGRESS);
  }

  return filtered;
}

export function setActiveReport(report) {
  if (!report) return null;

  saveToStorage(STORAGE_KEYS.ACTIVE_REPORT_ID, report.id);
  saveToStorage(STORAGE_KEYS.ACTIVE_GUIDE, report.parsedGuide || null);

  return report.id;
}

export function resetAll() {
  clearVektorStorage();
  saveToStorage(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
}

// Backward-compatible aliases for existing components.
export function save(key, value) {
  return saveToStorage(key, value);
}

export function load(key, fallback = null) {
  return loadFromStorage(key, fallback);
}