// src/logic/guideValidator.js
// Validates pasted external LLM output and parses TRACKER_JSON
// v2: Hardened JSON cleaning + lenient validation with recovery hints

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

// Optional but recommended sections (lenient)
const RECOMMENDED_SECTIONS = ["OVERVIEW:", "PREREQUISITES:", "RESOURCES:"];

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

// ========== DEFENSIVE JSON CLEANING UTILITIES ==========

/**
 * Aggressively clean JSON string to handle invisible characters, encoding issues, and malformed structures.
 * This is the core fix for position-2 and similar parse errors.
 */
function defensiveJsonClean(rawJson) {
  let cleaned = rawJson;

  // === PHASE 1: Remove all invisible/special characters ===
  
  // BOM markers (various encodings)
  cleaned = cleaned.replace(/^\uFEFF/, ""); // UTF-8 BOM
  cleaned = cleaned.replace(/^\uFFFE/, ""); // UTF-16LE BOM
  cleaned = cleaned.replace(/^\u0000\u0000\uFEFF/, ""); // UTF-32BE BOM
  
  // Zero-width and hair-space characters (common copy-paste artifacts)
  cleaned = cleaned.replace(/[\u200B-\u200F\u2028\u2029\u3000]/g, " ");
  cleaned = cleaned.replace(/[\uFEFF\u061C\u180E]/g, ""); // More invisible chars
  
  // Non-breaking and special spaces
  cleaned = cleaned.replace(/[\u00A0\u1680\u2000-\u200A]/g, " ");
  
  // Control characters (but preserve \n, \r, \t in strings)
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "");
  
  // === PHASE 2: Remove markdown code fences ===
  cleaned = cleaned.replace(/^\s*```(?:json)?\s*/gm, "");
  cleaned = cleaned.replace(/\s*```\s*$/gm, "");
  
  // === PHASE 3: Fix smart/curly quotes ===
  cleaned = cleaned.replace(/[\u2018\u2019]/g, "'");     // single curly quotes
  cleaned = cleaned.replace(/[\u201C\u201D]/g, '"');     // double curly quotes
  cleaned = cleaned.replace(/[\u2039\u203A]/g, "<");     // angle quotes
  
  // === PHASE 4: Fix dashes and bullet points ===
  cleaned = cleaned.replace(/[\u2010-\u2015\u2212]/g, "-"); // various dashes
  cleaned = cleaned.replace(/[\u2022\u2023\u2043]/g, "-");  // bullet points
  
  // === PHASE 5: Normalize whitespace (but preserve structure) ===
  cleaned = cleaned.replace(/\t/g, " ");
  cleaned = cleaned.replace(/ +/g, " "); // collapse multiple spaces
  
  // === PHASE 6: Fix common JSON structural issues ===
  
  // Remove whitespace immediately after opening braces/brackets
  cleaned = cleaned.replace(/{\s+/g, "{ ");
  cleaned = cleaned.replace(/\[\s+/g, "[ ");
  
  // Fix trailing commas (most common issue after control char removal)
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
  
  // Fix missing colons after property names (rare, but defensive)
  cleaned = cleaned.replace(/"([^"]+)"\s+(?=[^:,}\]])/g, '"$1": ');
  
  // === PHASE 7: Final trim ===
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Extract balanced JSON object starting from first { to matching }
 * Handles partial/corrupted JSON gracefully.
 */
function extractBalancedJson(text) {
  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) {
    return { success: false, error: "No opening '{' found." };
  }

  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let lastValidBrace = -1;

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];

    // Handle escape sequences
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    // Track string boundaries
    if (char === '"') {
      inString = !inString;
      continue;
    }

    // Count braces only outside strings
    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          lastValidBrace = i;
          break;
        }
      }
    }
  }

  if (lastValidBrace === -1) {
    return { success: false, error: "No matching closing '}' found." };
  }

  const jsonText = text.substring(firstBrace, lastValidBrace + 1);
  return { success: true, json: jsonText };
}

/**
 * Validate parsed guide structure and suggest fixes for common issues
 */
function validateGuideStructure(parsed) {
  const errors = [];
  const warnings = [];

  // Check for phases array
  if (!parsed.phases) {
    errors.push("Missing 'phases' array. Required structure: { phases: [...] }");
  } else if (!Array.isArray(parsed.phases)) {
    errors.push("'phases' must be an array, not " + typeof parsed.phases);
  } else if (parsed.phases.length === 0) {
    warnings.push("'phases' array is empty. Add at least one phase object.");
  }

  // Check for guide metadata
  const titleField = parsed.guideTitle || parsed.title || parsed.title_en || parsed.guideName;
  if (!titleField) {
    errors.push("Missing guide title (expected 'guideTitle', 'title', or 'guideName')");
  }

  // Validate each phase structure
  if (Array.isArray(parsed.phases)) {
    parsed.phases.forEach((phase, idx) => {
      if (!phase.name && !phase.title) {
        warnings.push(`Phase ${idx} missing 'name' or 'title'`);
      }
      if (!Array.isArray(phase.weeks) && !Array.isArray(phase.tasks)) {
        warnings.push(`Phase ${idx} missing 'weeks' or 'tasks' array`);
      }
    });
  }

  return { errors, warnings };
}

// ========== MAIN PARSING FUNCTION (HARDENED) ==========

export function validateAndParseGuide(fullText) {
  // Step 1: Validate guide structure (gates before JSON parsing)
  const validation = validateVektorGuide(fullText);
  if (!validation.valid) {
    return { valid: false, error: validation.message };
  }

  // Step 2: Extract TRACKER_JSON section
  let text = normalizeInput(fullText);
  const trackerIndex = text.indexOf(TRACKER_JSON_MARKER);
  if (trackerIndex === -1) {
    return { valid: false, error: "TRACKER_JSON marker not found." };
  }

  let jsonText = text.substring(trackerIndex + TRACKER_JSON_MARKER.length);

  // Step 3: Apply defensive cleaning (the core fix)
  jsonText = defensiveJsonClean(jsonText);

  // Step 4: Extract balanced JSON
  const extraction = extractBalancedJson(jsonText);
  if (!extraction.success) {
    return { valid: false, error: extraction.error };
  }
  jsonText = extraction.json;

  // Step 5: Verify first character is '{'
  if (jsonText.charAt(0) !== "{") {
    return {
      valid: false,
      error: `JSON corruption detected. First 50 chars: ${jsonText.substring(0, 50)}`,
      recovery: "Regenerate the guide. If this persists, the LLM output may be truncated.",
    };
  }

  // Step 6: Parse JSON with detailed error handling
  try {
    const parsed = JSON.parse(jsonText);

    // Validate structure and collect issues
    const structureCheck = validateGuideStructure(parsed);
    if (structureCheck.errors.length > 0) {
      return {
        valid: false,
        error: structureCheck.errors.join("; "),
        recovery: "Ensure TRACKER_JSON contains: { phases: [...], guideTitle/title: '...' }",
      };
    }

    return {
      valid: true,
      guide: parsed,
      warnings: structureCheck.warnings.length > 0 ? structureCheck.warnings : undefined,
    };
  } catch (e) {
    // Detailed JSON parse error handling
    const position = e.message.match(/position (\d+)/)?.[1];
    const context = position ? jsonText.substring(Math.max(0, position - 10), position + 10) : jsonText.substring(0, 100);

    let recovery = "Check the TRACKER_JSON format and ensure all strings use straight quotes.";

    if (e.message.includes("Unexpected token")) {
      recovery = "Found invalid character in JSON. Ensure quotes, braces, and commas are correctly placed.";
    } else if (e.message.includes("Expected property name")) {
      recovery = "Missing property name after '{' or ','. Expected format: { \"key\": value, ... }";
    } else if (e.message.includes("JSON.parse")) {
      recovery = "JSON structure is invalid. Verify all objects have opening/closing braces.";
    }

    console.error("JSON parse error:", e.message);
    console.error("Error position:", position);
    console.error("Context around error:", context);
    console.error("Full cleaned JSON (first 500 chars):", jsonText.substring(0, 500));

    return {
      valid: false,
      error: `JSON Parse Error: ${e.message}`,
      recovery,
      debugInfo: {
        position,
        context,
        jsonPreview: jsonText.substring(0, 200),
      },
    };
  }
}

// ========== UTILITY: Diagnose parser issues ==========

export function diagnoseGuideIssue(fullText) {
  const result = validateAndParseGuide(fullText);
  if (result.valid) return { status: "✓ Valid guide", details: result.warnings };

  const diagnosis = {
    error: result.error,
    recovery: result.recovery,
    checkList: [
      "[ ] First line is exactly: VEKTOR_GUIDE_V1",
      "[ ] All required sections present: GUIDE_TITLE, RECOMMENDED_PATH, USER_LEVEL, SUMMARY, TRACKER_JSON",
      "[ ] TRACKER_JSON contains { ... } with 'phases' array",
      "[ ] All property names in JSON use straight quotes: \"name\"",
      "[ ] No trailing commas before } or ]",
      "[ ] All JSON strings properly closed",
    ],
  };

  return diagnosis;
}

// ========== UTILITY EXPORTS ==========

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