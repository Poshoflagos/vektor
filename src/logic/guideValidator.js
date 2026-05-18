// src/logic/guideValidator.js
// Validates pasted external LLM output before the parser tries to extract JSON.

export const GUIDE_MARKER = "VEKTOR_GUIDE_V1";
export const GUIDE_ERROR_MARKER = "VEKTOR_GUIDE_ERROR";
export const TRACKER_JSON_MARKER = "TRACKER_JSON:";

const REQUIRED_TEXT_SECTIONS = [
  "GUIDE_TITLE:",
  "RECOMMENDED_PATH:",
  "USER_LEVEL:",
  "SUMMARY:",
  "TRACKER_JSON:",
];

function normalizeInput(text) {
  return String(text || "").trim();
}

function getFirstNonEmptyLine(text) {
  return normalizeInput(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function countOccurrences(text, token) {
  if (!text || !token) return 0;
  return (text.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function hasRequiredSections(text) {
  return REQUIRED_TEXT_SECTIONS.filter((section) => !text.includes(section));
}

function hasJsonBracePairAfterTracker(text) {
  const trackerIndex = text.indexOf(TRACKER_JSON_MARKER);

  if (trackerIndex === -1) return false;

  const afterTracker = text.slice(trackerIndex + TRACKER_JSON_MARKER.length);
  const cleaned = afterTracker.replace(/```json|```/g, "").trim();

  return cleaned.includes("{") && cleaned.lastIndexOf("}") > cleaned.indexOf("{");
}

function extractLineValue(text, label) {
  const lines = normalizeInput(text).split(/\r?\n/);
  const target = label.toUpperCase();

  const line = lines.find((item) => item.trim().toUpperCase().startsWith(target));

  if (!line) return "";

  return line.slice(label.length).trim();
}

export function getGuideBasicSummary(text) {
  const value = normalizeInput(text);

  return {
    guideTitle: extractLineValue(value, "GUIDE_TITLE:"),
    recommendedPath: extractLineValue(value, "RECOMMENDED_PATH:"),
    userLevel: extractLineValue(value, "USER_LEVEL:"),
  };
}

export function validateVektorGuide(text) {
  const value = normalizeInput(text);

  if (!value) {
    return {
      valid: false,
      code: "EMPTY_INPUT",
      message: "Paste the full VEKTÖR guide before validating.",
      details: [],
      warnings: [],
      summary: null,
    };
  }

  if (value.includes(GUIDE_ERROR_MARKER)) {
    const reason = extractLineValue(value, "REASON:");

    return {
      valid: false,
      code: "LLM_RETURNED_ERROR",
      message: reason || "The external LLM said it could not generate a valid VEKTÖR guide.",
      details: ["Regenerate the guide using the VEKTÖR prompt and paste the new output."],
      warnings: [],
      summary: null,
    };
  }

  const firstLine = getFirstNonEmptyLine(value);

  if (firstLine !== GUIDE_MARKER) {
    return {
      valid: false,
      code: "MISSING_FIRST_LINE_MARKER",
      message: "This does not look like a valid VEKTÖR guide.",
      details: [`The first line must be exactly ${GUIDE_MARKER}.`],
      warnings: [],
      summary: null,
    };
  }

  const trackerMarkerCount = countOccurrences(value, TRACKER_JSON_MARKER);

  if (trackerMarkerCount === 0) {
    return {
      valid: false,
      code: "MISSING_TRACKER_JSON",
      message: "The guide is missing the tracker JSON section.",
      details: ["Regenerate the guide and make sure the output includes TRACKER_JSON."],
      warnings: [],
      summary: getGuideBasicSummary(value),
    };
  }

  if (trackerMarkerCount > 1) {
    return {
      valid: false,
      code: "DUPLICATE_TRACKER_JSON",
      message: "The guide contains more than one TRACKER_JSON section.",
      details: ["Paste one complete guide only. Do not combine multiple LLM outputs."],
      warnings: [],
      summary: getGuideBasicSummary(value),
    };
  }

  const missingSections = hasRequiredSections(value);

  if (missingSections.length > 0) {
    return {
      valid: false,
      code: "MISSING_REQUIRED_SECTIONS",
      message: "The guide is incomplete.",
      details: missingSections.map((section) => `Missing section: ${section}`),
      warnings: [],
      summary: getGuideBasicSummary(value),
    };
  }

  if (!hasJsonBracePairAfterTracker(value)) {
    return {
      valid: false,
      code: "MISSING_JSON_BRACES",
      message: "The tracker section does not contain a complete JSON object.",
      details: ["Regenerate the guide or paste the full response from the external LLM."],
      warnings: [],
      summary: getGuideBasicSummary(value),
    };
  }

  const warnings = [];

  if (value.length < 1200) {
    warnings.push("The guide is unusually short. It may pass validation but still fail parsing if tasks are missing.");
  }

  return {
    valid: true,
    code: "VALID_VEKTOR_GUIDE",
    message: "Valid VEKTÖR guide detected.",
    details: [],
    warnings,
    summary: getGuideBasicSummary(value),
  };
}

export function isLikelyVektorGuide(text) {
  const value = normalizeInput(text);

  return (
    value.includes(GUIDE_MARKER) &&
    value.includes(TRACKER_JSON_MARKER) &&
    value.includes("phases") &&
    value.includes("weeks") &&
    value.includes("tasks")
  );
}

export default validateVektorGuide;