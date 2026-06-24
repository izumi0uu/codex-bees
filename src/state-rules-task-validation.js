import { summarizeTaskDependencies } from "./state-task-core.js";
import { VALID_LANE_PURPOSES } from "./state-rules-statuses.js";

export function validateTaskValue(task, roleCatalog, tasks = []) {
  const issues = [];

  if (!task.title?.trim()) {
    issues.push({ code: "missing_title", message: "Task title is required" });
  }
  if (!task.owner?.trim()) {
    issues.push({ code: "missing_owner", message: "Task owner is required for bounded execution" });
  } else if (!roleCatalog.agents.includes(task.owner)) {
    issues.push({
      code: "unknown_owner",
      message: `Task owner ${task.owner} is not a shipped agent role`,
      allowed: roleCatalog.agents
    });
  }
  if (!task.verifier?.trim()) {
    issues.push({ code: "missing_verifier", message: "Task verifier is required for bounded execution" });
  } else if (!roleCatalog.agents.includes(task.verifier)) {
    issues.push({
      code: "unknown_verifier",
      message: `Task verifier ${task.verifier} is not a shipped agent role`,
      allowed: roleCatalog.agents
    });
  }
  if (!Array.isArray(task.scope) || task.scope.length === 0) {
    issues.push({ code: "missing_scope", message: "Task scope is required for bounded execution" });
  }
  if (!Array.isArray(task.acceptance) || task.acceptance.length === 0) {
    issues.push({ code: "missing_acceptance", message: "Task acceptance checks are required" });
  }
  if (!Array.isArray(task.verification) || task.verification.length === 0) {
    issues.push({ code: "missing_verification", message: "Task verification steps are required" });
  }
  if (task.queueStatus === "claimed" && !task.claimedBy) {
    issues.push({ code: "missing_claimed_by", message: "Claimed tasks must record claimedBy" });
  }
  if (task.lanePurpose && !VALID_LANE_PURPOSES.has(task.lanePurpose)) {
    issues.push({
      code: "invalid_lane_purpose",
      message: `Task lanePurpose ${task.lanePurpose} is not a known planner purpose`,
      allowed: [...VALID_LANE_PURPOSES]
    });
  }

  const dependencySummary =
    task?.dependencySummary ?? summarizeTaskDependencies(task, tasks);
  if (
    ["queued", "released", "claimed", "ready_for_review"].includes(task.queueStatus) &&
    dependencySummary.refs.length > 0
  ) {
    if (dependencySummary.unresolvedRefs.length > 0) {
      issues.push({
        code: "unresolved_dependency",
        message: `Task depends on unresolved refs: ${dependencySummary.unresolvedRefs.join(", ")}`
      });
    }
    if (dependencySummary.blockingTaskIds.length > 0) {
      const blockingTargets = dependencySummary.blockingLanes.length > 0
        ? dependencySummary.blockingLanes.join(", ")
        : dependencySummary.blockingTaskIds.join(", ");
      issues.push({
        code: "dependency_not_complete",
        message: `Task depends on unfinished work: ${blockingTargets}`
      });
    }
  }

  return {
    task,
    ready: issues.length === 0,
    issues,
    catalog: roleCatalog
  };
}

export function deriveTaskValidationReason(validation) {
  if (!validation) {
    return "validation_unavailable";
  }
  if (validation.ready) {
    return "task_ready_to_claim";
  }
  if ((validation.issues ?? []).some((issue) => issue.code === "unknown_owner" || issue.code === "unknown_verifier")) {
    return "task_role_validation_issues_present";
  }
  if ((validation.issues ?? []).some((issue) => issue.code === "missing_claimed_by")) {
    return "claimed_task_metadata_incomplete";
  }
  if ((validation.issues ?? []).some((issue) => issue.code === "unresolved_dependency" || issue.code === "dependency_not_complete")) {
    return "task_dependency_waiting";
  }
  if ((validation.issues?.length ?? 0) > 0) {
    return "task_validation_issues_present";
  }
  return "task_validation_visible";
}

export function buildTaskValidationView(task, roleCatalog, tasks = []) {
  const validation = validateTaskValue(task, roleCatalog, tasks);
  return {
    kind: "task_validation",
    recommendedReason: deriveTaskValidationReason(validation),
    ...validation
  };
}

export function buildTaskValidationViewFromSources(
  task,
  {
    runtimeRoleCatalog,
    tasks
  }
) {
  return buildTaskValidationView(task, runtimeRoleCatalog(), tasks);
}
