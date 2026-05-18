// src/logic/trackerBuilder.js
// Converts parsed VEKTÖR guides into tracker-ready data.
// Option B is used exclusively: trackerData contains structure only;
// trackerProgress is a flat map keyed by taskId.

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;

  return String(value).trim() || fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function makeId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getAllTrackerTasks(trackerData) {
  if (!trackerData?.phases) return [];

  return trackerData.phases.flatMap((phase) =>
    safeArray(phase.weeks).flatMap((week) =>
      safeArray(week.tasks).map((task) => ({
        ...task,
        phaseId: phase.id,
        phaseTitle: phase.title,
        weekId: week.id,
        weekTitle: week.title,
      }))
    )
  );
}

export function isTaskComplete(trackerProgress, taskId) {
  const value = trackerProgress?.[taskId];

  if (typeof value === "boolean") return value;

  return Boolean(value?.completed);
}

export function createInitialTrackerProgress(trackerData) {
  const tasks = getAllTrackerTasks(trackerData);

  return tasks.reduce((progress, task) => {
    progress[task.id] = {
      completed: false,
      completedAt: null,
    };

    return progress;
  }, {});
}

export function mergeTrackerProgress(trackerData, existingProgress = {}) {
  const tasks = getAllTrackerTasks(trackerData);

  return tasks.reduce((progress, task) => {
    const existingValue = existingProgress?.[task.id];

    progress[task.id] =
      typeof existingValue === "boolean"
        ? {
            completed: existingValue,
            completedAt: null,
          }
        : {
            completed: Boolean(existingValue?.completed),
            completedAt: existingValue?.completedAt || null,
          };

    return progress;
  }, {});
}

export function toggleTaskProgress(trackerProgress = {}, taskId) {
  const currentValue = trackerProgress[taskId];
  const currentCompleted =
    typeof currentValue === "boolean"
      ? currentValue
      : Boolean(currentValue?.completed);

  return {
    ...trackerProgress,
    [taskId]: {
      completed: !currentCompleted,
      completedAt: !currentCompleted ? new Date().toISOString() : null,
    },
  };
}

export function setTaskProgress(trackerProgress = {}, taskId, completed) {
  return {
    ...trackerProgress,
    [taskId]: {
      completed: Boolean(completed),
      completedAt: completed ? new Date().toISOString() : null,
    },
  };
}

export function calculateProgressFromTasks(tasks = [], trackerProgress = {}) {
  if (!tasks.length) {
    return {
      total: 0,
      completed: 0,
      remaining: 0,
      percentage: 0,
      isComplete: false,
    };
  }

  const completed = tasks.filter((task) =>
    isTaskComplete(trackerProgress, task.id || task.taskId)
  ).length;

  const total = tasks.length;
  const remaining = total - completed;

  return {
    total,
    completed,
    remaining,
    percentage: Math.round((completed / total) * 100),
    isComplete: completed === total,
  };
}

export function calculateTrackerProgress(trackerData, trackerProgress = {}) {
  return calculateProgressFromTasks(getAllTrackerTasks(trackerData), trackerProgress);
}

export function calculateWeekProgress(week, trackerProgress = {}) {
  return calculateProgressFromTasks(safeArray(week?.tasks), trackerProgress);
}

export function calculatePhaseProgress(phase, trackerProgress = {}) {
  const tasks = safeArray(phase?.weeks).flatMap((week) => safeArray(week.tasks));

  return calculateProgressFromTasks(tasks, trackerProgress);
}

export function getCurrentPhaseAndWeek(trackerData, trackerProgress = {}) {
  if (!trackerData?.phases?.length) {
    return {
      currentPhase: null,
      currentWeek: null,
      allComplete: false,
    };
  }

  for (const phase of trackerData.phases) {
    for (const week of safeArray(phase.weeks)) {
      const incompleteTask = safeArray(week.tasks).find(
        (task) => !isTaskComplete(trackerProgress, task.id)
      );

      if (incompleteTask) {
        return {
          currentPhase: phase,
          currentWeek: week,
          currentTask: incompleteTask,
          allComplete: false,
        };
      }
    }
  }

  return {
    currentPhase: null,
    currentWeek: null,
    currentTask: null,
    allComplete: true,
  };
}

export function summarizeTracker(trackerData, trackerProgress = {}) {
  const allTasks = getAllTrackerTasks(trackerData);
  const overall = calculateProgressFromTasks(allTasks, trackerProgress);
  const current = getCurrentPhaseAndWeek(trackerData, trackerProgress);

  return {
    guideTitle: safeText(trackerData?.guideTitle, "No active guide"),
    recommendedPath: safeText(trackerData?.recommendedPath, "No active path"),
    phaseCount: safeArray(trackerData?.phases).length,
    weekCount: safeArray(trackerData?.phases).reduce(
      (total, phase) => total + safeArray(phase.weeks).length,
      0
    ),
    taskCount: overall.total,
    completedTasks: overall.completed,
    remainingTasks: overall.remaining,
    progressPercentage: overall.percentage,
    currentPhase: current.currentPhase,
    currentWeek: current.currentWeek,
    currentTask: current.currentTask,
    allComplete: current.allComplete,
  };
}

export function buildTrackerFromGuide(parsedGuide, options = {}) {
  const createdAt = new Date().toISOString();

  const phases = safeArray(parsedGuide?.phases).map((phase, phaseIndex) => ({
    id: safeText(phase.id || phase.phaseId, `phase-${phaseIndex + 1}`),
    title: safeText(phase.title || phase.phaseTitle, `Phase ${phaseIndex + 1}`),
    goal: safeText(phase.goal || phase.phaseGoal, "Complete this phase."),
    weeks: safeArray(phase.weeks).map((week, weekIndex) => ({
      id: safeText(
        week.id || week.weekId,
        `phase-${phaseIndex + 1}-week-${weekIndex + 1}`
      ),
      title: safeText(week.title || week.weekTitle, `Week ${weekIndex + 1}`),
      goal: safeText(week.goal || week.weekGoal, "Complete this week."),
      tasks: safeArray(week.tasks).map((task, taskIndex) => ({
        id: safeText(
          task.id || task.taskId,
          `phase-${phaseIndex + 1}-week-${weekIndex + 1}-task-${taskIndex + 1}`
        ),
        title: safeText(task.title, `Task ${taskIndex + 1}`),
        category: safeText(task.category, "General"),
        description: safeText(task.description, "No description provided."),
        completionCriteria: safeText(
          task.completionCriteria,
          "Complete this task and create visible proof."
        ),
        estimatedTime: safeText(task.estimatedTime, "Not specified"),
      })),
    })),
  }));

  return {
    id: options.trackerId || makeId("tracker"),
    sourceReportId: options.sourceReportId || null,
    createdAt,
    updatedAt: createdAt,
    guideType: safeText(parsedGuide?.guideType, "VEKTOR_GUIDE_V1"),
    guideTitle: safeText(parsedGuide?.guideTitle, "VEKTÖR Guide"),
    recommendedPath: safeText(parsedGuide?.recommendedPath, "Unknown Path"),
    userLevel: safeText(parsedGuide?.userLevel, "beginner"),
    summary: safeText(parsedGuide?.summary, ""),
    firstAction: safeText(parsedGuide?.firstAction, "Start with the first task."),
    phases,
    milestones: safeArray(parsedGuide?.milestones),
    resources: safeArray(parsedGuide?.resources),
    risks: safeArray(parsedGuide?.risks),
  };
}

export function buildTrackerBundleFromGuide(parsedGuide, options = {}) {
  const trackerData = buildTrackerFromGuide(parsedGuide, options);
  const trackerProgress = createInitialTrackerProgress(trackerData);
  const trackerSummary = summarizeTracker(trackerData, trackerProgress);

  return {
    trackerData,
    trackerProgress,
    trackerSummary,
  };
}

export default buildTrackerFromGuide;