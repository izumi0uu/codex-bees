import { summarizeTaskDependencies } from "./core.js";
import { buildRecommendedFieldsFromResult } from "../runtime/recommendation-helpers.js";
import { buildHistoryView, buildPlanningView } from "../../state-view-metadata.js";
import { createLoadedValueView } from "../../state-view-helpers.js";

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

  return createLoadedValueView("task_execution_brief", "task", task, {
    recommendedReason,
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
    extra: {
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
      ...buildRecommendedFieldsFromResult(recommended)
    }
  });
}

export function buildTaskBriefViewFromSources(id, sources) {
  return buildTaskBriefView(id, sources);
}
