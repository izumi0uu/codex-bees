import { summarizeTaskDependencies } from "./state-task-core.js";

export function deriveTaskReportReason(task) {
  if (task.queueStatus === "ready_for_review") {
    return "review_decision_pending";
  }
  if (task.queueStatus === "done" || task.reviewOutcome === "approved") {
    return "approved_closure_ready";
  }
  if (task.reviewOutcome === "changes_requested") {
    return "changes_requested_rework";
  }
  if ((task.queueStatus === "queued" || task.queueStatus === "released") && task.dependencyReady === false) {
    return "dependency_waiting_report";
  }
  if (task.queueStatus === "claimed") {
    return "active_execution_report";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery_report";
  }
  return "queued_execution_report";
}
export function buildTaskListView({ listTasks }) {
  const tasks = listTasks();
  const recommendedReason = tasks.length > 0 ? "task_list_has_results" : "task_list_empty";
  return {
    kind: "task_view",
    recommendedReason,
    counts: {
      totalTasks: tasks.length
    },
    tasks
  };
}
export function buildTaskListViewFromSources(
  {
    listTasks
  },
  {
    buildTaskListView
  }
) {
  return buildTaskListView({
    listTasks
  });
}
export function taskReportNextGate(task) {
  if (task.queueStatus === "done") {
    return {
      action: "archive_or_handoff",
      command: null
    };
  }
  if (task.queueStatus === "ready_for_review") {
    return {
      action: "verifier_decision",
      command: `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`
    };
  }
  if (task.queueStatus === "claimed") {
    return {
      action: "complete_and_handoff",
      command: `node ./src/index.js task:review --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`
    };
  }
  if ((task.queueStatus === "queued" || task.queueStatus === "released") && task.dependencyReady === false) {
    return {
      action: "wait_on_dependencies",
      command: `node ./src/index.js task:brief --id ${task.id}`
    };
  }
  return {
    action: "continue_execution",
    command: null
  };
}
export function buildTaskReportEntries(task) {
  const annotations = (task.annotations ?? []).filter((entry) =>
    ["context", "handoff", "review-note", "evidence", "note"].includes(entry.kind)
  );
  const history = (task.history ?? []).slice(-10);
  return {
    annotations,
    history
  };
}
export function buildTaskReportView(
  id,
  {
    getTask,
    taskBrief,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const brief = taskBrief(id);
  const reportEntries = buildTaskReportEntries(task);
  const recommendedReason = deriveTaskReportReason(task);
  const acceptance = (task.acceptance ?? []).map((item) => ({
    item,
    status: task.reviewOutcome === "approved" || task.queueStatus === "done" ? "verified" : "pending"
  }));
  const verification = task.verification ?? [];
  const reviewEvidence = task.reviewEvidence ?? [];

  return {
    kind: "task_report",
    recommendedReason,
    task: {
      id: task.id,
      title: task.title,
      objective: task.objective,
      queueStatus: task.queueStatus,
      owner: task.owner,
      verifier: task.verifier,
      claimedBy: task.claimedBy,
      swarmId: task.swarmId,
      lane: task.lane,
      lanePurpose: task.lanePurpose ?? null
    },
    closure: {
      reviewState: deriveReviewState(task),
      reviewedBy: task.reviewedBy,
      reviewedAt: task.reviewedAt,
      reviewOutcome: task.reviewOutcome,
      reviewNotes: task.reviewNotes,
      closureReady: task.queueStatus === "ready_for_review" || task.queueStatus === "done",
      nextGate: taskReportNextGate(task)
    },
    counts: {
      acceptanceItems: acceptance.length,
      verificationSteps: verification.length,
      reviewEvidenceEntries: reviewEvidence.length,
      annotationEntries: reportEntries.annotations.length,
      recentHistoryEntries: reportEntries.history.length
    },
    acceptance,
    verification,
    evidence: {
      reviewEvidence,
      annotations: reportEntries.annotations,
      recentHistory: reportEntries.history
    },
    brief
  };
}
export function buildTaskReportViewFromSources(
  id,
  {
    getTask,
    taskBrief,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  },
  {
    buildTaskReportView
  }
) {
  return buildTaskReportView(id, {
    getTask,
    taskBrief,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  });
}
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

  return {
    kind: "task_detail",
    recommendedReason: "task_detail_loaded",
    metadata: {
      hasHistory: (task.history ?? []).length > 0,
      hasAnnotations: (task.annotations ?? []).length > 0,
      reviewState: deriveReviewState(task)
    },
    task
  };
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
  const historyEntries = task.history ?? [];
  const annotationEntries = task.annotations ?? [];

  return {
    kind: "task_execution_brief",
    recommendedReason,
    task,
    objective: task.objective ?? task.title,
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
      historyEntries: historyEntries.length,
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
      count: historyEntries.length,
      entries: historyEntries
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
export function recommendTaskAction(task, dependencyTasks = []) {
  const dependencySummary = task.dependencySummary ?? summarizeTaskDependencies(task, dependencyTasks);
  if (task.queueStatus === "done") {
    return {
      actor: null,
      action: "complete",
      commands: []
    };
  }

  if (task.queueStatus === "ready_for_review") {
    return {
      actor: {
        type: "verifier_role",
        id: task.verifier,
        claimedBy: null
      },
      action: "review_and_decide",
      commands: [
        `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`,
        `node ./src/index.js task:reject --id ${task.id} --by ${task.verifier ?? "<verifier-role>"} --status claimed --notes "<changes requested>"`
      ]
    };
  }

  if (task.queueStatus === "queued" || task.queueStatus === "released") {
    if (!dependencySummary.ready) {
      return {
        actor: {
          type: "owner_role",
          id: task.owner,
          claimedBy: null
        },
        action: "wait_on_dependencies",
        commands: [`node ./src/index.js task:brief --id ${task.id}`]
      };
    }
    return {
      actor: {
        type: "owner_role",
        id: task.owner,
        claimedBy: null
      },
      action: "claim_and_execute",
      commands: [
        `node ./src/index.js task:claim --id ${task.id} --by <worker-id>`,
        `node ./src/index.js task:review --id ${task.id} --by <worker-id>`
      ]
    };
  }

  if (task.queueStatus === "claimed") {
    return {
      actor: {
        type: "claimed_worker",
        id: task.owner,
        claimedBy: task.claimedBy ?? null
      },
      action: "continue_execution_and_handoff",
      commands: [
        `node ./src/index.js task:review --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`,
        `node ./src/index.js task:block --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"} --notes "<blocker>"`
      ]
    };
  }

  return {
    actor: {
      type: "owner_role",
      id: task.owner,
      claimedBy: task.claimedBy ?? null
    },
    action: "resolve_blocker_and_requeue",
    commands: [
      `node ./src/index.js task:claim --id ${task.id} --by <worker-id>`,
      `node ./src/index.js task:release --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`
    ]
  };
}
