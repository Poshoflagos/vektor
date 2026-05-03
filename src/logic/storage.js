// storage.js
// This file handles all saving and loading from localStorage.
// localStorage = your browser's built-in notebook. Survives page refresh.

const KEYS = {
  access:       "vektor_access",
  profile:      "vektor_profile",
  scores:       "vektor_scores",
  paths:        "vektor_paths",
  guideType:    "vektor_guideType",
  prompt:       "vektor_prompt",
  aiResult:     "vektor_aiResult",
  reports:      "vektor_reports",
  selectedPath: "vektor_selectedPath",
  tracker:      "vektor_tracker"
};

export function save(key, value) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch (err) {
    console.error("Save failed:", err);
  }
}

export function load(key) {
  try {
    const item = localStorage.getItem(KEYS[key]);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function saveReport(pathName, guideType, content) {
  const existing = load("reports") || [];
  const newReport = {
    id: `rpt_${Date.now()}`,
    date: new Date().toLocaleDateString("en-GB"),
    pathName,
    guideType,
    content,
    savedAt: new Date().toISOString()
  };
  existing.push(newReport);
  save("reports", existing);
  return newReport;
}

export function deleteReport(reportId) {
  const existing = load("reports") || [];
  save("reports", existing.filter(r => r.id !== reportId));
}

export function resetAll() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}