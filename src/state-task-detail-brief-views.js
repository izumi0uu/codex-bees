import { summarizeTaskDependencies } from "./state-task-core.js";
import { buildHistoryView, buildPlanningView, buildTaskDetailMetadata } from "./state-view-metadata.js";
import { createLoadedValueView } from "./state-view-helpers.js";

export function buildTaskHistoryView(
  id,
  {
    getTask,
    deriveTaskHistoryReason
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }
  const history = task.history ?? [];
  const next = history.at(-1) ?? null;
  const recommendedReason = deriveTaskHistoryReason({ history, next });

  return {
    kind: "task_history",
    recommendedReason,
    taskId: task.id,
    title: task.title,
    queueStatus: task.queueStatus,
    counts: {
      totalHistoryEntries: history.length
    },
    history
  };
}

export function buildTaskHistoryViewFromSources(
  id,
  {
    getTask,
    deriveTaskHistoryReason
  },
  {
    buildTaskHistoryView
  }
) {
  return buildTaskHistoryView(id, {
    getTask,
    deriveTaskHistoryReason
  });
}

export function buildTaskDetailView(
  id,
  {
    getTask,
    deriveReviewState
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  return createLoadedValueView("task_detail", "task", task, {
    recommendedReason: "task_detail_loaded",
    extra: {
      metadata: buildTaskDetailMetadata(task, deriveReviewState(task))
    }
  });
}

export function buildTaskDetailViewFromSources(
  id,
  {
    getTask,
    deriveReviewState
  },
  {
    buildTaskDetailView
  }
) {
  return buildTaskDetailView(id, {
    getTask,
    deriveReviewState
  });
}

export function deriveTaskBriefReason(task, recommended) {
  if (task.queueStatus === "done") {
    return "completed_task_brief";
  }
  if (task.queueStatus === "ready_for_review") {
    return "verifier_decision_brief";
  }
  if (task.queueStatus === "claimed") {
    return "claimed_execution_brief";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery_brief";
  }
  if ((task.queueStatus === "queued" || task.queueStatus === "released") && task.dependencyReady === false) {
    return "dependency_waiting_brief";
  }
  if (task.queueStatus === "released") {
    return "released_repickup_brief";
  }
  if (recommended?.actor?.type === "owner_role") {
    return "claimable_execution_brief";
  }
  return "queued_execution_brief";
}

export function buildTaskBriefView(
  id,
  {
    getTask,
    runtimeRoleCatalog,
    validateTaskValue,
    getRuntimeCatalog,
    recommendTaskAction,
    deriveTaskBriefReason,
    describeRole,
    deriveReviewState,
    dependencyTasks
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const dependencySummary = task.dependencySummary ?? summarizeTaskDependencies(task, dependencyTasks ?? []);
  const validation = validateTaskValue(task, runtimeRoleCatalog(), dependencyTasks ?? []);
  const catalog = getRuntimeCatalog();
  const recommended = recommendTaskAction(task, dependencyTasks ?? []);
  const recommendedReason = deriveTaskBriefReason(task, recommended);
  const scope = task.scope ?? [];
  const acceptance = task.acceptance ?? [];
  const verification = task.verification ?? [];
  const reviewEvidence = task.reviewEvidence ?? [];
  const history = buildHistoryView(task.history ?? []);
  const annotationEntries = task.annotations ?? [];

  return {
    kind: "task_execution_brief",
    recommendedReason,
    task,
    objective: task.objective ?? task.title,
    planning: buildPlanningView(task.plannerProvenance),
    roles: {
      owner: describeRole(task.owner, catalog),
      verifier: describeRole(task.verifier, catalog)
    },
    coordination: {
      swarmId: task.swarmId,
      lane: task.lane,
      lanePurpose: task.lanePurpose ?? null,
      queueStatus: task.queueStatus,
      claimedBy: task.claimedBy,
      notes: task.notes,
      dependsOn: dependencySummary.refs
    },
    counts: {
      scopeEntries: scope.length,
      acceptanceItems: acceptance.length,
      verificationSteps: verification.length,
      dependencyRefs: dependencySummary.refs.length,
      blockingDependencies: dependencySummary.blockingTaskIds.length,
      reviewEvidenceEntries: reviewEvidence.length,
      historyEntries: history.count,
      annotationEntries: annotationEntries.length
    },
    execution: {
      scope,
      acceptance,
      verification,
      dependsOn: dependencySummary.refs
    },
    dependencies: dependencySummary,
    review: {
      state: deriveReviewState(task),
      reviewedBy: task.reviewedBy,
      reviewedAt: task.reviewedAt,
      outcome: task.reviewOutcome,
      notes: task.reviewNotes,
      evidence: reviewEvidence
    },
    history: {
      count: history.count,
      entries: history.entries
    },
    annotations: {
      count: annotationEntries.length,
      entries: annotationEntries.slice(-5)
    },
    validation,
    recommendedNextActor: recommended.actor,
    recommendedNextAction: recommended.action,
    recommendedCommands: recommended.commands
  };
}

export function buildTaskBriefViewFromSources(
  id,
  {
    getTask,
    runtimeRoleCatalog,
    validateTaskValue,
    getRuntimeCatalog,
    recommendTaskAction,
    deriveTaskBriefReason,
    describeRole,
    deriveReviewState,
    dependencyTasks
  },
  {
    buildTaskBriefView
  }
) {
  return buildTaskBriefView(
    id,
    {
      getTask,
      runtimeRoleCatalog,
      validateTaskValue,
      getRuntimeCatalog,
      recommendTaskAction,
      deriveTaskBriefReason,
      describeRole,
      deriveReviewState,
      dependencyTasks
    }
  );
}
