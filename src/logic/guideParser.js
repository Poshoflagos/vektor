// src/logic/guideParser.js
// Extracts and validates TRACKER_JSON from a VEKTÖR guide.

import { TRACKER_JSON_MARKER } from "./guideValidator";

const ALLOWED_TASK_CATEGORIES = new Set([
  "Learning",
  "Building",
  "Research",
  "Outreach",
  "Content",
  "Portfolio",
  "Review",
  "General",
]);

function normalizeString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;

  return String(value).trim() || fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function createId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

function getJsonCandidate(text) {
  const trackerIndex = String(text || "").indexOf(TRACKER_JSON_MARKER);

  if (trackerIndex === -1) {
    throw new Error("TRACKER_JSON section was not found.");
  }

  const afterMarker = String(text).slice(trackerIndex + TRACKER_JSON_MARKER.length);

  // Required fix: support markdown-wrapped JSON from GPT/Claude/Gemini.
  const cleaned = afterMarker.replace(/```json|```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("The tracker JSON is incomplete or missing braces.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function countTasks(phases) {
  return phases.reduce((total, phase) => {
    const phaseTasks = normalizeArray(phase.weeks).reduce((weekTotal, week) => {
      return weekTotal + normalizeArray(week.tasks).length;
    }, 0);

    return total + phaseTasks;
  }, 0);
}

function assertUniqueIds(phases) {
  const ids = new Set();

  phases.forEach((phase) => {
    if (ids.has(phase.phaseId)) {
      throw new Error(`Duplicate phase ID detected: ${phase.phaseId}`);
    }

    ids.add(phase.phaseId);

    phase.weeks.forEach((week) => {
      if (ids.has(week.weekId)) {
        throw new Error(`Duplicate week ID detected: ${week.weekId}`);
      }

      ids.add(week.weekId);

      week.tasks.forEach((task) => {
        if (ids.has(task.taskId)) {
          throw new Error(`Duplicate task ID detected: ${task.taskId}`);
        }

        ids.add(task.taskId);
      });
    });
  });
}

function normalizeTask(task, taskIndex, phaseId, weekId) {
  const taskId = normalizeString(task?.taskId, `${weekId}-task-${taskIndex + 1}`);
  const title = normalizeString(task?.title);

  if (!title) {
    throw new Error(`Task ${taskIndex + 1} in ${weekId} is missing a title.`);
  }

  const category = normalizeString(task?.category, "General");
  const safeCategory = ALLOWED_TASK_CATEGORIES.has(category) ? category : "General";

  return {
    taskId,
    id: taskId,
    title,
    category: safeCategory,
    description: normalizeString(task?.description, "No description provided."),
    completionCriteria: normalizeString(
      task?.completionCriteria,
      "Complete the task and create visible proof."
    ),
    estimatedTime: normalizeString(task?.estimatedTime, "Not specified"),
    phaseId,
    weekId,
  };
}

function normalizeWeek(week, weekIndex, phaseId) {
  const weekId = normalizeString(week?.weekId, `${phaseId}-week-${weekIndex + 1}`);
  const tasks = normalizeArray(week?.tasks).map((task, taskIndex) =>
    normalizeTask(task, taskIndex, phaseId, weekId)
  );

  if (tasks.length === 0) {
    throw new Error(`${weekId} must contain at least one task.`);
  }

  return {
    weekId,
    id: weekId,
    weekTitle: normalizeString(week?.weekTitle, `Week ${weekIndex + 1}`),
    title: normalizeString(week?.weekTitle, `Week ${weekIndex + 1}`),
    weekGoal: normalizeString(week?.weekGoal, "Complete this week's execution block."),
    goal: normalizeString(week?.weekGoal, "Complete this week's execution block."),
    tasks,
  };
}

function normalizePhase(phase, phaseIndex) {
  const phaseId = normalizeString(phase?.phaseId, createId("phase", phaseIndex));
  const weeks = normalizeArray(phase?.weeks).map((week, weekIndex) =>
    normalizeWeek(week, weekIndex, phaseId)
  );

  if (weeks.length === 0) {
    throw new Error(`${phaseId} must contain at least one week.`);
  }

  return {
    phaseId,
    id: phaseId,
    phaseTitle: normalizeString(phase?.phaseTitle, `Phase ${phaseIndex + 1}`),
    title: normalizeString(phase?.phaseTitle, `Phase ${phaseIndex + 1}`),
    phaseGoal: normalizeString(phase?.phaseGoal, "Complete this phase."),
    goal: normalizeString(phase?.phaseGoal, "Complete this phase."),
    weeks,
  };
}

function normalizeMilestones(milestones) {
  return normalizeArray(milestones).map((milestone, index) => ({
    milestoneId: normalizeString(milestone?.milestoneId, `milestone-${index + 1}`),
    title: normalizeString(milestone?.title, `Milestone ${index + 1}`),
    targetDate: normalizeString(milestone?.targetDate, "Not specified"),
    proofRequired: normalizeString(milestone?.proofRequired, "Visible proof-of-work required."),
  }));
}

function normalizeResources(resources) {
  return normalizeArray(resources).map((resource, index) => ({
    resourceId: normalizeString(resource?.resourceId, `resource-${index + 1}`),
    title: normalizeString(resource?.title, `Resource ${index + 1}`),
    type: normalizeString(resource?.type, "resource"),
    cost: normalizeString(resource?.cost, "FREE"),
    reason: normalizeString(resource?.reason, "Recommended for this guide."),
  }));
}

function normalizeRisks(risks) {
  return normalizeArray(risks).map((risk, index) => ({
    riskId: normalizeString(risk?.riskId, `risk-${index + 1}`),
    risk: normalizeString(risk?.risk, `Risk ${index + 1}`),
    mitigation: normalizeString(risk?.mitigation, "Reduce this risk with consistent review."),
  }));
}

function validateRootGuide(guide) {
  if (!guide || typeof guide !== "object" || Array.isArray(guide)) {
    throw new Error("TRACKER_JSON must be a JSON object.");
  }

  if (guide.guideType !== "VEKTOR_GUIDE_V1") {
    throw new Error("guideType must be VEKTOR_GUIDE_V1.");
  }

  if (!normalizeString(guide.guideTitle)) {
    throw new Error("guideTitle is missing.");
  }

  if (!normalizeString(guide.recommendedPath)) {
    throw new Error("recommendedPath is missing.");
  }

  if (!Array.isArray(guide.phases) || guide.phases.length === 0) {
    throw new Error("The guide must contain at least one phase.");
  }
}

function normalizeGuide(rawGuide) {
  validateRootGuide(rawGuide);

  const phases = rawGuide.phases.map((phase, phaseIndex) =>
    normalizePhase(phase, phaseIndex)
  );

  const totalTasks = countTasks(phases);

  if (totalTasks === 0) {
    throw new Error("The guide must contain at least one task.");
  }

  assertUniqueIds(phases);

  return {
    guideType: "VEKTOR_GUIDE_V1",
    guideTitle: normalizeString(rawGuide.guideTitle),
    recommendedPath: normalizeString(rawGuide.recommendedPath),
    userLevel: normalizeString(rawGuide.userLevel, "beginner"),
    summary: normalizeString(rawGuide.summary, "No summary provided."),
    createdFor: {
      name: normalizeString(rawGuide.createdFor?.name),
      experienceLevel: normalizeString(rawGuide.createdFor?.experienceLevel),
      availableTime: normalizeString(rawGuide.createdFor?.availableTime),
      urgency: normalizeString(rawGuide.createdFor?.urgency),
      budget: normalizeString(rawGuide.createdFor?.budget),
      learningStyle: normalizeString(rawGuide.createdFor?.learningStyle),
    },
    phases,
    milestones: normalizeMilestones(rawGuide.milestones),
    resources: normalizeResources(rawGuide.resources),
    risks: normalizeRisks(rawGuide.risks),
    firstAction: normalizeString(rawGuide.firstAction, "Start with the first task in Week 1."),
    stats: {
      phaseCount: phases.length,
      weekCount: phases.reduce((total, phase) => total + phase.weeks.length, 0),
      taskCount: totalTasks,
    },
  };
}

export function extractTrackerJson(text) {
  try {
    const jsonCandidate = getJsonCandidate(text);
    const parsed = JSON.parse(jsonCandidate);
    const normalized = normalizeGuide(parsed);

    return {
      success: true,
      data: normalized,
      error: null,
      message: "Tracker JSON parsed successfully.",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "The tracker JSON could not be parsed.",
      message: "The guide format is invalid.",
    };
  }
}

export function parseVektorGuide(text) {
  return extractTrackerJson(text);
}

export function getParsedGuideStats(parsedGuide) {
  if (!parsedGuide?.phases) {
    return {
      phaseCount: 0,
      weekCount: 0,
      taskCount: 0,
    };
  }

  return {
    phaseCount: parsedGuide.phases.length,
    weekCount: parsedGuide.phases.reduce((total, phase) => total + phase.weeks.length, 0),
    taskCount: countTasks(parsedGuide.phases),
  };
}

export default parseVektorGuide;