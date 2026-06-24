import { summarizeTaskDependencies } from "./state-task-core.js";

export const VALID_QUEUE_STATUSES = new Set([
  "queued",
  "claimed",
  "blocked",
  "ready_for_review",
  "released",
  "done"
]);

export const VALID_SWARM_STATUSES = new Set([
  "planned",
  "active",
  "blocked",
  "completed",
  "cancelled"
]);

export const VALID_LANE_PURPOSES = new Set([
  "discovery",
  "implementation",
  "verification",
  "documentation"
]);

export const ALLOWED_QUEUE_TRANSITIONS = {
  queued: new Set(["claimed", "blocked"]),
  claimed: new Set(["blocked", "ready_for_review", "released"]),
  blocked: new Set(["claimed", "released"]),
  ready_for_review: new Set(["claimed", "blocked", "released", "done"]),
  released: new Set(["claimed", "blocked"]),
  done: new Set()
};

export const ALLOWED_SWARM_TRANSITIONS = {
  planned: new Set(["active", "blocked", "completed", "cancelled"]),
  active: new Set(["blocked", "completed", "cancelled"]),
  blocked: new Set(["active", "completed", "cancelled"]),
  completed: new Set(),
  cancelled: new Set()
};

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

export function validateSwarmValue(swarm, roleCatalog) {
  const issues = [];
  const laneReports = [];
  const laneIds = new Set((swarm.lanes ?? []).map((lane) => lane.lane).filter(Boolean));
  const dependencyAdjacency = new Map(
    (swarm.lanes ?? []).map((lane) => [
      lane.lane,
      (lane.dependsOn ?? []).filter((ref) => ref && ref !== lane.lane && laneIds.has(ref))
    ])
  );
  const cycleLanes = new Set();
  const visited = new Set();
  const active = new Set();

  function visitLaneDependencies(laneId) {
    if (!laneId || visited.has(laneId)) {
      return;
    }
    visited.add(laneId);
    active.add(laneId);
    for (const dependency of dependencyAdjacency.get(laneId) ?? []) {
      if (active.has(dependency)) {
        cycleLanes.add(laneId);
        cycleLanes.add(dependency);
        continue;
      }
      visitLaneDependencies(dependency);
      if (cycleLanes.has(dependency)) {
        cycleLanes.add(laneId);
      }
    }
    active.delete(laneId);
  }

  for (const laneId of laneIds) {
    visitLaneDependencies(laneId);
  }

  if (!swarm.objective?.trim()) {
    issues.push({ code: "missing_objective", message: "Swarm objective is required" });
  }
  if (!Array.isArray(swarm.lanes) || swarm.lanes.length === 0) {
    issues.push({ code: "missing_lanes", message: "Swarm must contain at least one lane" });
  }

  for (const lane of swarm.lanes) {
    const laneIssues = [];
    if (!lane.owner?.trim()) {
      laneIssues.push({ code: "missing_owner", message: "Lane owner is required" });
    } else if (!roleCatalog.agents.includes(lane.owner)) {
      laneIssues.push({
        code: "unknown_owner",
        message: `Lane owner ${lane.owner} is not a shipped agent role`,
        allowed: roleCatalog.agents
      });
    }
    if (!lane.verifier?.trim()) {
      laneIssues.push({ code: "missing_verifier", message: "Lane verifier is required" });
    } else if (!roleCatalog.agents.includes(lane.verifier)) {
      laneIssues.push({
        code: "unknown_verifier",
        message: `Lane verifier ${lane.verifier} is not a shipped agent role`,
        allowed: roleCatalog.agents
      });
    }
    if (!Array.isArray(lane.scope) || lane.scope.length === 0) {
      laneIssues.push({ code: "missing_scope", message: "Lane scope is required" });
    }
    if (!Array.isArray(lane.acceptance) || lane.acceptance.length === 0) {
      laneIssues.push({ code: "missing_acceptance", message: "Lane acceptance checks are required" });
    }
    if (!Array.isArray(lane.verification) || lane.verification.length === 0) {
      laneIssues.push({ code: "missing_verification", message: "Lane verification steps are required" });
    }
    if (lane.purpose && !VALID_LANE_PURPOSES.has(lane.purpose)) {
      laneIssues.push({
        code: "invalid_lane_purpose",
        message: `Lane ${lane.lane} has unknown purpose ${lane.purpose}`,
        allowed: [...VALID_LANE_PURPOSES]
      });
    }
    const dependencyRefs = Array.isArray(lane.dependsOn) ? lane.dependsOn : [];
    for (const ref of dependencyRefs) {
      if (ref === lane.lane) {
        laneIssues.push({
          code: "self_dependency",
          message: `Lane ${lane.lane} cannot depend on itself`
        });
        continue;
      }
      if (!laneIds.has(ref)) {
        laneIssues.push({
          code: "unknown_dependency",
          message: `Lane ${lane.lane} depends on unknown lane ${ref}`
        });
      }
    }
    if (cycleLanes.has(lane.lane)) {
      laneIssues.push({
        code: "dependency_cycle",
        message: `Lane ${lane.lane} participates in a dependency cycle`
      });
    }

    laneReports.push({
      lane: lane.lane,
      ready: laneIssues.length === 0,
      issues: laneIssues
    });
  }

  const overlapIssues = [];
  const seen = new Map();
  for (const lane of swarm.lanes) {
    for (const path of lane.scope ?? []) {
      const owners = seen.get(path) ?? [];
      for (const otherLane of owners) {
        overlapIssues.push({
          code: "scope_overlap",
          message: `Lanes ${otherLane} and ${lane.lane} overlap on ${path}`,
          lanes: [otherLane, lane.lane],
          path
        });
      }
      owners.push(lane.lane);
      seen.set(path, owners);
    }
  }

  return {
    swarm,
    ready: issues.length === 0 && laneReports.every((lane) => lane.ready) && overlapIssues.length === 0,
    issues,
    lanes: laneReports,
    overlaps: overlapIssues,
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

export function deriveSwarmValidationReason(validation) {
  if (!validation) {
    return "validation_unavailable";
  }
  if (validation.ready) {
    return "swarm_ready_to_queue";
  }
  if ((validation.overlaps?.length ?? 0) > 0) {
    return "swarm_scope_overlap_detected";
  }
  if ((validation.lanes ?? []).some((lane) => lane.ready === false)) {
    return "lane_validation_issues_present";
  }
  if ((validation.issues?.length ?? 0) > 0) {
    return "swarm_validation_issues_present";
  }
  return "swarm_validation_visible";
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

export function buildSwarmValidationView(swarm, roleCatalog) {
  const validation = validateSwarmValue(swarm, roleCatalog);
  return {
    kind: "swarm_validation",
    recommendedReason: deriveSwarmValidationReason(validation),
    ...validation
  };
}

export function buildSwarmValidationViewFromSources(
  swarm,
  {
    runtimeRoleCatalog
  }
) {
  return buildSwarmValidationView(swarm, runtimeRoleCatalog());
}

export function deriveSwarmStatus(swarm, tasks) {
  if (swarm.status === "cancelled") {
    return "cancelled";
  }

  const laneTaskIds = new Set(swarm.lanes.map((lane) => lane.taskId).filter(Boolean));
  const relatedTasks = tasks.filter((task) => laneTaskIds.size === 0 || laneTaskIds.has(task.id));

  if (swarm.lanes.length === 0 || relatedTasks.length === 0) {
    return "planned";
  }

  const allDone = relatedTasks.length === swarm.lanes.length && relatedTasks.every((task) => task.queueStatus === "done");
  if (allDone) {
    return "completed";
  }

  const hasRunnable = relatedTasks.some((task) =>
    ["queued", "released", "claimed", "ready_for_review"].includes(task.queueStatus)
  );
  if (hasRunnable) {
    return "active";
  }

  const hasBlocked = relatedTasks.some((task) => task.queueStatus === "blocked");
  if (hasBlocked) {
    return "blocked";
  }

  return swarm.status === "completed" ? "completed" : "active";
}

export function canTransitionTask(from, to) {
  const allowed = ALLOWED_QUEUE_TRANSITIONS[from];
  return allowed ? allowed.has(to) : false;
}

export function canTransitionSwarm(from, to) {
  const allowed = ALLOWED_SWARM_TRANSITIONS[from];
  return allowed ? allowed.has(to) : false;
}
