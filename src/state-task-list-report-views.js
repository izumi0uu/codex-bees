import { buildHistoryView, buildPlanningView } from "./state-view-metadata.js";
import { createCollectionView } from "./state-view-helpers.js";

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
  return createCollectionView("task_view", "tasks", tasks, {
    loadedReason: "task_list_has_results",
    emptyReason: "task_list_empty",
    counts: {
      totalTasks: tasks.length
    }
  });
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
    if (task.swarmId) {
      return {
        action: "swarm_closeout",
        command: `node ./src/index.js swarm:closeout --id ${task.swarmId}`
      };
    }
    return {
      action: "archive_task",
      command: `node ./src/index.js task:archive --id ${task.id}`
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
  const history = buildHistoryView(task.history ?? [], { limit: 10 }).entries;
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
    planning: buildPlanningView(task.plannerProvenance),
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
