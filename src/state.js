import {
  existsSync,
  mkdirSync,
  readFileSync
} from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { getRuntimeCatalog } from "./catalog.js";
import {
  buildMemory,
  buildSwarm,
  buildTask,
  buildTaskHistoryEntry
} from "./state-builders.js";
import {
  defaultState,
  normalizeMemory,
  normalizeState,
  normalizeSwarm,
  normalizeSwarmLane,
  normalizeTask,
  normalizeTaskAnnotation,
  normalizeTaskHistoryEntry
} from "./state-normalize.js";
import {
  assignmentFollowupCommand,
  assignmentPickupOutcome,
  buildTaskAssignmentPickupViewFromSources,
  buildTaskAssignmentPickupView,
  buildTaskPickupViewFromSources,
  buildTaskPickupView,
  buildPreviewTaskAssignmentViewFromSources,
  buildPreviewTaskAssignmentView,
  buildPreviewTaskPickupViewFromSources,
  buildPreviewTaskPickupView,
  buildTaskInboxViewFromSources,
  buildTaskInboxView,
  buildTaskNextViewFromSources,
  buildTaskNextView,
  compareLeaderWorkspaceEntries,
  compareTasksByUpdatedAt,
  isClaimableTask,
  normalizeNextMode,
  pickupFollowupCommand,
  pickupOutcome,
  sortInboxTasks,
  sortNextCandidates,
  summarizeInboxTask
} from "./state-queue-views.js";
import {
  filterMemories,
  filterSwarms,
  scoreMemory,
  tokenize
} from "./state-query.js";
import {
  recoverCorruptStateFile as recoverCorruptStateFileWithPaths,
  writeStateFile as writeStateFileWithPaths
} from "./state-storage.js";
import {
  buildUpdatedSwarmState,
  buildSyncedSwarmState,
  dispatchSwarmLaneFromSources,
  findDispatchableSwarmLane,
  queueSwarmTasksFromSources,
  transitionSwarmFromSources,
  updateSwarmFromSources,
  updateLoadedSwarmState,
  buildTransitionedSwarmState,
  buildQueuedSwarmLaneState,
  buildQueuedSwarmLaneTaskInput,
  buildQueuedSwarmState,
  buildDispatchedSwarmState,
  buildDispatchedSwarmTaskState,
  syncLoadedSwarmState,
  syncLoadedSwarmLifecycle,
  transitionLoadedSwarmState,
} from "./state-swarm-core.js";
import {
  findSwarmIndex,
  findTaskIndex,
  validateNextQueueStatus,
  validateNextSwarmStatus,
  validateRequiredClaimedBy,
  validateSwarmStatusTransition,
  validateTaskClaimConflict,
  validateTaskClaimReady,
  validateTaskQueueTransition,
  validateVerifierAction
} from "./state-transition-guards.js";
import {
  buildUpdatedTaskState,
  buildTransitionedTaskState,
  buildTaskReviewPatch,
  deriveTaskTransitionContext,
  resolveTaskClaimedBy,
  transitionTaskFromSources,
  updateTaskFromSources,
  updateLoadedTaskState,
  transitionLoadedTaskState
} from "./state-transition-helpers.js";
import {
  appendTaskAnnotation,
  appendTaskHistoryEntry,
  deriveReviewState,
  describeRole
} from "./state-task-core.js";
import {
  buildTaskBriefView,
  buildTaskBriefViewFromSources,
  buildSwarmBriefView,
  buildSwarmBriefViewFromSources,
  buildSwarmBundleView,
  buildSwarmBundleViewFromSources,
  buildSwarmCloseoutView,
  buildSwarmCloseoutViewFromSources,
  buildSwarmBlockersView,
  buildSwarmBlockersViewFromSources,
  buildSwarmDispatchBundleView,
  buildSwarmDispatchBundleViewFromSources,
  buildRuntimeReviewTaskEntry,
  buildSwarmHandoff,
  buildTaskReportEntries,
  compareRuntimeReviewGroups,
  deriveSwarmCloseoutCommand,
  deriveTaskBriefReason,
  deriveTaskReportReason,
  recommendLaneAction,
  recommendSwarmAction,
  recommendTaskAction,
  taskReportNextGate
} from "./state-task-views.js";
import {
  deriveTaskAssignmentPickupReason,
  deriveTaskAssignmentPreviewReason,
  deriveTaskHistoryReason,
  deriveTaskInboxReason,
  deriveTaskNextReason,
  deriveTaskPickupPreviewReason,
  deriveTaskPickupReason,
  deriveVerifierBundleReason,
  deriveWorkerCloseoutReason,
  deriveWorkerHandoffReason,
  deriveWorkerSessionReason
} from "./state-reasons.js";
import {
  buildRuntimeActivityView,
  buildRuntimeActivityViewFromState,
  buildRuntimeCloseoutViewFromState,
  buildRuntimeCloseoutView,
  buildRuntimeFocusView,
  buildRuntimeActivityEntry,
  buildRuntimeHandoffsViewFromState,
  buildRuntimeHandoffsView,
  buildRuntimeRecoveryViewFromState,
  buildRuntimeRecoveryView,
  buildRuntimeCloseoutTaskEntry,
  buildRuntimeFocusSummary,
  buildRuntimeHandoffEntry,
  buildRuntimeRecoveryEntry,
  chooseRuntimeCloseoutNext,
  compareRuntimeActivityEntries,
  compareRuntimeCloseoutSwarms,
  compareRuntimeCloseoutTasks,
  compareRuntimeHandoffEntries,
  compareRuntimeHandoffGroups,
  compareRuntimeRecoveryEntries,
  compareRuntimeRecoveryGroups,
  isRuntimeRecoveryTask,
  runtimeHandoffActorKey,
  runtimeHandoffPriority,
  runtimeRecoveryPriority,
  runtimeRecoveryType
} from "./state-runtime-entities.js";
import {
  buildRuntimeRoleEntry,
  buildRuntimeRoleEntrySummary,
  buildRuntimeRoleNextAction,
  buildRuntimeRolesView,
  compareRuntimeAlerts,
  summarizeDashboardTask
} from "./state-role-views.js";
import {
  buildLeaderAssignmentDispatchView,
  buildLeaderAssignmentDispatchViewFromSources,
  buildLeaderAssignmentDispatchBundleView,
  buildLeaderAssignmentDispatchBundleViewFromSources,
  buildLeaderAssignmentDispatchPackViewFromSources,
  buildLeaderAssignmentDispatchPackView,
  buildLeaderAssignmentLaunchPlanView,
  buildLeaderAssignmentLaunchPlanViewFromSources,
  buildLeaderAssignmentsViewFromSources,
  buildLeaderAssignmentsView,
  buildLeaderAssignmentsSummary,
  buildLeaderQueueViewFromSources,
  buildLeaderQueueView,
  buildLeaderQueueSummary,
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsViewFromSources,
  buildRuntimeAlertsView,
  buildRuntimeDashboardSummary,
  buildRuntimeDashboardViewFromSources,
  buildRuntimeDashboardView,
  buildRuntimeActivitySummary,
  deriveLeaderAssignmentDispatchReason,
  deriveLeaderAssignmentDispatchBundleReason,
  deriveLeaderAssignmentsReason,
  deriveLeaderAssignmentLaunchPlanReason,
  deriveLeaderQueueReason,
  deriveRuntimeDashboardReason,
  deriveRuntimeActivityReason,
  deriveRuntimeAlertsReason,
  deriveRuntimeDispatchReason,
  deriveRuntimeHandoffsReason,
  deriveRuntimeRecoveryReason,
  deriveRuntimeReviewReason,
  deriveRuntimeRolesReason,
  buildRuntimeDispatchSummary,
  buildRuntimeDispatchViewFromSources,
  buildRuntimeDispatchView,
  buildRuntimeHandoffsSummary,
  buildRuntimeRecoverySummary,
  buildRuntimeReviewSummary,
  buildRuntimeReviewViewFromSources,
  buildRuntimeReviewView,
  buildRuntimeRolesViewFromSources,
  buildRuntimeRolesSummary
} from "./state-dashboard-views.js";
import {
  buildSwarmOverviewData,
  buildSwarmOverviewView,
  buildSwarmOverviewViewFromSources,
  buildSwarmBlockersSummary,
  buildSwarmCloseoutSummary,
  buildSwarmDispatchBundleSummary,
  buildRuntimeCloseoutSummary,
  buildRuntimeCloseoutSwarmEntry,
  buildSwarmBundleSummary,
  deriveLeaderWorkspaceReason,
  deriveRuntimeCloseoutReason,
  deriveSwarmBlockersReason,
  deriveSwarmBriefReason,
  deriveSwarmBundleReason,
  deriveSwarmCloseoutReason,
  deriveSwarmDispatchBundleReason,
  deriveSwarmDispatchReason,
  deriveSwarmOverviewReason,
  deriveSwarmQueueReason,
  deriveSwarmSyncReason
} from "./state-swarm-views.js";
import {
  buildWorkerSessionViewFromSources,
  buildWorkerSessionView,
  buildWorkerCloseoutViewFromSources,
  buildWorkerCloseoutView,
  buildWorkerHandoffViewFromSources,
  buildWorkerHandoffView,
  buildVerifierBundleViewFromSources,
  buildVerifierBundleView,
  buildSessionTaskSnapshot,
  buildVerifierBundleSummary,
  buildVerifierDecisionCommands,
  buildWorkerCloseoutSummary,
  buildWorkerHandoffSummary,
  deriveWorkerCloseoutCommand,
  recommendWorkerSessionFocus
} from "./state-worker-views.js";
import {
  buildRuntimeControlPackSummary,
  buildRuntimeControlPackView,
  buildRuntimeControlPackViewFromSources,
  buildRuntimeExecutionPackSummary,
  buildRuntimeExecutionPackViewFromSources,
  buildRuntimeExecutionPackView,
  buildRuntimeFocusSources,
  buildRuntimeFocusViewFromSources,
  buildRuntimeHandoffPackView,
  buildRuntimeHandoffPackSummary,
  buildRuntimeCloseoutPackView,
  buildRuntimeCloseoutPackViewFromSources,
  buildRuntimeCloseoutPackSummary,
  buildRuntimeDispatchPackViewFromSources,
  buildRuntimeDispatchPackView,
  buildRuntimeDispatchPackSummary,
  buildRuntimeAssignmentPackViewFromSources,
  buildRuntimeAssignmentPackSummary,
  buildRuntimeAssignmentPackView,
  buildRuntimeOperatorPackView,
  buildRuntimeOperatorPackViewFromSources,
  buildRuntimeOperatorPackSummary,
  buildRuntimePickupPackViewFromSources,
  buildRuntimePickupPackSummary,
  buildRuntimePickupPackView,
  buildRuntimeRecoveryPackViewFromSources,
  buildRuntimeRecoveryPackView,
  buildRuntimeRecoveryPackSummary,
  buildRuntimeReviewPackViewFromSources,
  buildRuntimeReviewPackView,
  buildRuntimeLeaderPackSummary,
  buildRuntimeLeaderPackViewFromSources,
  buildRuntimeLeaderPackView,
  buildLeaderWorkspaceViewFromSources,
  buildLeaderWorkspaceView,
  buildLeaderWorkspaceSummary,
  buildLeaderWorkspaceSwarmEntry,
  buildRuntimeOwnerPackViewFromSources,
  buildRuntimeOwnerPackSummary,
  buildRuntimeOwnerPackView,
  buildRuntimeWorkerPackViewFromSources,
  buildRuntimeQueuePackView,
  buildRuntimeQueuePackViewFromSources,
  buildRuntimeQueuePackSummary,
  buildRuntimeRolePackViewFromSources,
  buildRuntimeRolePackView,
  buildRuntimeReviewPackSummary,
  buildRuntimeRolePackSummary,
  buildRuntimeSessionPackViewFromSources,
  buildRuntimeSessionPackView,
  buildRuntimeSessionPackSummary,
  buildRuntimeSignalPackViewFromSources,
  buildRuntimeSignalPackView,
  buildRuntimeSignalPackSummary,
  buildRuntimeSummaryPackView,
  buildRuntimeSummaryPackViewFromSources,
  buildRuntimeSummaryPackSummary,
  buildRuntimeWorkspacePackViewFromSources,
  buildRuntimeHandoffPackViewFromSources,
  buildRuntimeTriagePackViewFromSources,
  buildRuntimeTriagePackView,
  buildRuntimeTriagePackSummary,
  buildRuntimeVerifierPackSummary,
  buildRuntimeVerifierPackViewFromSources,
  buildRuntimeVerifierPackView,
  buildRuntimeWorkerPackSummary,
  buildRuntimeWorkerPackView,
  buildRuntimeWorkspacePackView,
  compareRuntimeRoleEntries,
  deriveRuntimeCloseoutPackReason,
  deriveRuntimeCloseoutPackSurface,
  deriveRuntimeAssignmentPackReason,
  deriveRuntimeAssignmentPackSurface,
  deriveRuntimeDispatchPackReason,
  deriveRuntimeDispatchPackSurface,
  deriveRuntimeExecutionPackReason,
  deriveRuntimeExecutionPackSurface,
  deriveRuntimeHandoffPackReason,
  deriveRuntimeHandoffPackSurface,
  deriveRuntimeLeaderPackReason,
  deriveRuntimeLeaderPackSurface,
  deriveRuntimeOperatorPackReason,
  deriveRuntimeOperatorPackSurface,
  deriveRuntimeOwnerPackReason,
  deriveRuntimeOwnerPackSurface,
  deriveRuntimePickupPackReason,
  deriveRuntimePickupPackSurface,
  deriveRuntimeQueuePackReason,
  deriveRuntimeQueuePackSurface,
  deriveRuntimeRecoveryPackReason,
  deriveRuntimeRecoveryPackSurface,
  deriveRuntimeReviewPackReason,
  deriveRuntimeReviewPackSurface,
  deriveRuntimeRolePackReason,
  deriveRuntimeRolePackSurface,
  deriveRuntimeSessionPackReason,
  deriveRuntimeSessionPackSurface,
  deriveRuntimeSignalPackReason,
  deriveRuntimeSignalPackSurface,
  deriveRuntimeSummaryPackReason,
  deriveRuntimeSummaryPackSurface,
  deriveRuntimeTriagePackReason,
  deriveRuntimeTriagePackSurface,
  deriveRuntimeVerifierPackReason,
  deriveRuntimeVerifierPackSurface,
  deriveRuntimeWorkerPackReason,
  deriveRuntimeWorkerPackSurface,
  deriveRuntimeWorkspacePackReason,
  deriveRuntimeWorkspacePackSurface,
  deriveRuntimeControlPackReason,
  deriveRuntimeControlPackSurface,
  deriveLeaderAssignmentDispatchPackReason,
  buildRuntimeWorkspacePackSummary
} from "./state-runtime-views.js";
import {
  VALID_QUEUE_STATUSES,
  VALID_SWARM_STATUSES,
  buildSwarmValidationViewFromSources,
  buildSwarmValidationView,
  buildTaskValidationViewFromSources,
  buildTaskValidationView,
  canTransitionSwarm,
  canTransitionTask,
  deriveSwarmStatus,
  deriveSwarmValidationReason,
  deriveTaskValidationReason,
  validateSwarmValue,
  validateTaskValue
} from "./state-rules.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";

const STATE_DIR = join(cwd(), ".codex-bees");
const STATE_FILE = join(STATE_DIR, "state.json");

export function ensureStateFile() {
  mkdirSync(STATE_DIR, { recursive: true });
  if (!existsSync(STATE_FILE)) {
    writeStateFileWithPaths(STATE_DIR, STATE_FILE, defaultState());
  }
  return STATE_FILE;
}

export function loadState() {
  ensureStateFile();
  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (error) {
    recoverCorruptStateFileWithPaths({
      stateDir: STATE_DIR,
      stateFile: STATE_FILE,
      error,
      defaultState: defaultState()
    });
    return defaultState();
  }
}

export function saveState(state) {
  ensureStateFile();
  const next = normalizeState({
    ...state,
    updatedAt: new Date().toISOString()
  });
  writeStateFileWithPaths(STATE_DIR, STATE_FILE, next);
  return next;
}

export function listTasks() {
  return loadState().tasks;
}

export function listTasksView() {
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

export function listMemories(filters = {}) {
  return filterMemories(loadState().memories, filters);
}

export function getMemory(id) {
  const memory = loadState().memories.find((item) => item.id === id);
  return memory ? normalizeMemory(memory) : null;
}

export function listMemoriesView(filters = {}) {
  const memories = listMemories(filters);
  const recommendedReason = memories.length > 0 ? "memory_list_has_results" : "memory_list_empty";
  return {
    kind: "memory_view",
    recommendedReason,
    counts: {
      totalMemories: memories.length
    },
    memories
  };
}

export function getMemoryView(id) {
  const memory = getMemory(id);
  if (!memory) {
    return null;
  }

  return {
    kind: "memory_detail",
    recommendedReason: "memory_detail_loaded",
    metadata: {
      hasTitle: Boolean(memory.title),
      hasNotes: Boolean(memory.notes),
      tagCount: (memory.tags ?? []).length
    },
    memory
  };
}

export function listSwarms(filters = {}) {
  return filterSwarms(loadState().swarms, filters);
}

export function listSwarmOverviews(filters = {}) {
  return filterSwarms(loadState().swarms, filters)
    .map((swarm) => swarmOverview(swarm.id))
    .filter(Boolean);
}

export function listSwarmsView(filters = {}, options = {}) {
  const detailed = options.detailed === true;
  const swarms = detailed ? listSwarmOverviews(filters) : listSwarms(filters);
  const recommendedReason = swarms.length > 0 ? "swarm_list_has_results" : "swarm_list_empty";
  return {
    kind: "swarm_view",
    recommendedReason,
    detailed,
    counts: {
      totalSwarms: swarms.length
    },
    swarms
  };
}

export function getTask(id) {
  const task = loadState().tasks.find((item) => item.id === id);
  return task ? normalizeTask(task) : null;
}

export function getTaskView(id) {
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

export function taskHistory(id) {
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

export function taskReport(id) {
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
      lane: task.lane
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

export function annotateTask(input = {}) {
  if (!input.id) {
    return null;
  }

  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[index]);
  if (!input.content?.trim()) {
    return { error: "content is required for task annotation" };
  }

  const next = normalizeTask({
    ...current,
    annotations: appendTaskAnnotation(current, {
      at: new Date().toISOString(),
      actor: input.actor ?? current.claimedBy ?? null,
      kind: input.kind ?? "note",
      content: input.content.trim()
    }),
    updatedAt: new Date().toISOString()
  });

  state.tasks[index] = next;
  saveState(state);
  return next;
}

export function annotateTaskMutation(input) {
  const result = annotateTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_mutation",
    recommendedReason: "task_annotated",
    task: result
  };
}

export function getSwarm(id) {
  const swarm = loadState().swarms.find((item) => item.id === id);
  return swarm ? normalizeSwarm(swarm) : null;
}

export function getSwarmView(id) {
  const swarm = getSwarm(id);
  if (!swarm) {
    return null;
  }
  const overview = swarmOverview(id);
  return {
    kind: "swarm_detail",
    recommendedReason: "swarm_detail_loaded",
    metadata: {
      derivedStatus: overview?.derivedStatus ?? swarm.status,
      statusAligned: overview?.statusAligned ?? true,
      readyToComplete: overview?.readyToComplete ?? false,
      dispatchableCount: overview?.dispatchableCount ?? 0
    },
    swarm
  };
}

export function taskBrief(id) {
  return buildTaskBriefViewFromSources(
    id,
    {
      getTask,
      runtimeRoleCatalog,
      validateTaskValue,
      getRuntimeCatalog,
      recommendTaskAction,
      deriveTaskBriefReason,
      describeRole,
      deriveReviewState
    },
    {
      buildTaskBriefView
    }
  );
}

export function swarmBrief(id) {
  return buildSwarmBriefViewFromSources(
    id,
    {
      swarmOverview,
      getRuntimeCatalog,
      validateSwarmValue,
      runtimeRoleCatalog,
      recommendLaneAction,
      recommendSwarmAction,
      describeRole,
      buildSwarmHandoff,
      deriveSwarmBriefReason
    },
    {
      buildSwarmBriefView
    }
  );
}

export function swarmBundle(id) {
  return buildSwarmBundleViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBundleReason,
      buildSwarmBundleSummary
    },
    {
      buildSwarmBundleView
    }
  );
}

export function swarmCloseout(id) {
  return buildSwarmCloseoutViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      swarmBundle,
      deriveSwarmCloseoutCommand,
      deriveSwarmCloseoutReason,
      buildSwarmCloseoutSummary
    },
    {
      buildSwarmCloseoutView
    }
  );
}

export function swarmBlockers(id) {
  return buildSwarmBlockersViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBlockersReason,
      buildSwarmBlockersSummary
    },
    {
      buildSwarmBlockersView
    }
  );
}

export function swarmDispatchBundle(id) {
  return buildSwarmDispatchBundleViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskBrief,
      deriveSwarmDispatchBundleReason,
      buildSwarmDispatchBundleSummary
    },
    {
      buildSwarmDispatchBundleView
    }
  );
}

export function leaderQueue(input = {}) {
  return buildLeaderQueueViewFromSources(
    input,
    {
      leaderWorkspace
    },
    {
      deriveLeaderQueueReason,
      buildLeaderQueueSummary,
      buildLeaderQueueView
    }
  );
}

export function leaderAssignments(input = {}) {
  return buildLeaderAssignmentsViewFromSources(
    input,
    {
      leaderWorkspace,
      swarmBrief,
      taskBrief
    },
    {
      deriveLeaderAssignmentsReason,
      buildLeaderAssignmentsView
    }
  );
}

export function leaderAssignmentDispatch(input = {}) {
  return buildLeaderAssignmentDispatchViewFromSources(
    input,
    {
      leaderAssignments,
      describeRole
    },
    {
      deriveLeaderAssignmentDispatchReason,
      buildLeaderAssignmentDispatchView
    }
  );
}

export function leaderAssignmentDispatchPack(input = {}) {
  return buildLeaderAssignmentDispatchPackViewFromSources(
    input,
    {
      leaderAssignments,
      leaderAssignmentDispatch
    },
    {
      deriveLeaderAssignmentDispatchPackReason,
      buildLeaderAssignmentDispatchPackView
    }
  );
}

export function leaderAssignmentDispatchBundle(input = {}) {
  return buildLeaderAssignmentDispatchBundleViewFromSources(
    input,
    {
      leaderAssignmentDispatchPack
    },
    {
      deriveLeaderAssignmentDispatchBundleReason,
      buildLeaderAssignmentDispatchBundleView
    }
  );
}

export function leaderAssignmentLaunchPlan(input = {}) {
  return buildLeaderAssignmentLaunchPlanViewFromSources(
    input,
    {
      leaderAssignmentDispatchBundle
    },
    {
      deriveLeaderAssignmentLaunchPlanReason,
      buildLeaderAssignmentLaunchPlanView
    }
  );
}

export function runtimeDashboard() {
  return buildRuntimeDashboardViewFromSources(
    {
      loadState,
      normalizeTask,
      listSwarmOverviews,
      leaderQueue,
      leaderAssignments,
      compareTasksByUpdatedAt,
      summarizeDashboardTask
    },
    {
      deriveRuntimeDashboardReason,
      buildRuntimeDashboardSummary,
      buildRuntimeDashboardView
    }
  );
}

export function runtimeAlerts() {
  return buildRuntimeAlertsViewFromSources(
    {
      runtimeDashboard,
      listSwarmOverviews,
      compareRuntimeAlerts
    },
    {
      deriveRuntimeAlertsReason,
      buildRuntimeAlertsSummary,
      buildRuntimeAlertsView
    }
  );
}

export function runtimeRoles(input = {}) {
  return buildRuntimeRolesViewFromSources(
    input,
    {
      getRuntimeCatalog,
      leaderAssignments,
      buildRuntimeRoleEntry,
      describeRole,
      loadState,
      normalizeTask,
      taskInbox,
      taskNext,
      isClaimableTask,
      compareRuntimeRoleEntries
    },
    {
      deriveRuntimeRolesReason,
      buildRuntimeRolesSummary,
      buildRuntimeRolesView
    }
  );
}

export function runtimeDispatch() {
  return buildRuntimeDispatchViewFromSources(
    {
      leaderAssignments
    },
    {
      deriveRuntimeDispatchReason,
      buildRuntimeDispatchSummary,
      buildRuntimeDispatchView
    }
  );
}

export function runtimeReview() {
  return buildRuntimeReviewViewFromSources(
    {
      loadState,
      normalizeTask,
      compareTasksByUpdatedAt,
      describeRole,
      taskBrief,
      buildRuntimeReviewTaskEntry,
      compareRuntimeReviewGroups
    },
    {
      deriveRuntimeReviewReason,
      buildRuntimeReviewSummary,
      buildRuntimeReviewView
    }
  );
}

export function runtimeFocus() {
  return buildRuntimeFocusViewFromSources(
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeReview,
      runtimeDispatch,
      runtimeRoles,
      taskBrief,
      buildRuntimeFocusView
    },
    {
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    }
  );
}

export function runtimeActivity(input = {}) {
  return buildRuntimeActivityViewFromState(
    input,
    {
      loadState,
      normalizeTask,
      taskBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries
    },
    {
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary,
      buildRuntimeActivityView
    }
  );
}

export function runtimeHandoffs() {
  return buildRuntimeHandoffsViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      buildRuntimeHandoffEntry,
      compareRuntimeHandoffEntries,
      runtimeHandoffActorKey,
      compareRuntimeHandoffGroups,
      deriveRuntimeHandoffsReason,
      buildRuntimeHandoffsSummary,
      buildRuntimeHandoffsView
    }
  );
}

export function runtimeCloseout() {
  return buildRuntimeCloseoutViewFromState(
    {
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
    },
    {
      buildRuntimeCloseoutTaskEntry,
      compareRuntimeCloseoutTasks,
      buildRuntimeCloseoutSwarmEntry,
      compareRuntimeCloseoutSwarms,
      chooseRuntimeCloseoutNext,
      deriveRuntimeCloseoutReason,
      buildRuntimeCloseoutSummary,
      buildRuntimeCloseoutView
    }
  );
}

export function runtimeRecovery() {
  return buildRuntimeRecoveryViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      isRuntimeRecoveryTask,
      buildRuntimeRecoveryEntry,
      compareRuntimeRecoveryEntries,
      compareRuntimeRecoveryGroups,
      deriveRuntimeRecoveryReason,
      buildRuntimeRecoverySummary,
      buildRuntimeRecoveryView
    }
  );
}

export function runtimeSummaryPack(input = {}) {
  return buildRuntimeSummaryPackViewFromSources(
    input,
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeFocus,
      runtimeHandoffs,
      runtimeRecovery,
      runtimeCloseout,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeSummaryPackSurface,
      deriveRuntimeSummaryPackReason,
      buildRuntimeSummaryPackSummary,
      buildRuntimeSummaryPackView
    }
  );
}

export function runtimeOperatorPack() {
  return buildRuntimeOperatorPackViewFromSources(
    {
      runtimeDashboard,
      runtimeFocus,
      runtimeAlerts,
      runtimeHandoffs,
      runtimeCloseout
    },
    {
      deriveRuntimeOperatorPackSurface,
      deriveRuntimeOperatorPackReason,
      buildRuntimeOperatorPackSummary,
      buildRuntimeOperatorPackView
    }
  );
}

export function runtimeDispatchPack(input = {}) {
  return buildRuntimeDispatchPackViewFromSources(
    input,
    {
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeHandoffs
    },
    {
      deriveRuntimeDispatchPackSurface,
      deriveRuntimeDispatchPackReason,
      buildRuntimeDispatchPackSummary,
      buildRuntimeDispatchPackView
    }
  );
}

export function runtimeRecoveryPack() {
  return buildRuntimeRecoveryPackViewFromSources(
    {
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
    },
    {
      deriveRuntimeRecoveryPackSurface,
      deriveRuntimeRecoveryPackReason,
      buildRuntimeRecoveryPackSummary,
      buildRuntimeRecoveryPackView
    }
  );
}

export function runtimeCloseoutPack(input = {}) {
  return buildRuntimeCloseoutPackViewFromSources(
    input,
    {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary,
      buildRuntimeCloseoutPackView
    }
  );
}

export function runtimeReviewPack(input = {}) {
  return buildRuntimeReviewPackViewFromSources(
    input,
    {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeReviewPackSurface,
      deriveRuntimeReviewPackReason,
      buildRuntimeReviewPackSummary,
      buildRuntimeReviewPackView
    }
  );
}

export function runtimeQueuePack(input = {}) {
  return buildRuntimeQueuePackViewFromSources(
    input,
    {
      leaderQueue,
      runtimeDashboard,
      runtimeFocus,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeQueuePackSurface,
      deriveRuntimeQueuePackReason,
      buildRuntimeQueuePackSummary,
      buildRuntimeQueuePackView
    }
  );
}

export function runtimeWorkspacePack(input = {}) {
  return buildRuntimeWorkspacePackViewFromSources(
    input,
    {
      runtimeDashboard,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeWorkspacePackSurface,
      deriveRuntimeWorkspacePackReason,
      buildRuntimeWorkspacePackSummary,
      buildRuntimeWorkspacePackView
    }
  );
}

export function runtimeControlPack(input = {}) {
  return buildRuntimeControlPackViewFromSources(
    input,
    {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary,
      buildRuntimeControlPackView
    }
  );
}

export function runtimeSignalPack(input = {}) {
  return buildRuntimeSignalPackViewFromSources(
    input,
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeActivity,
      runtimeRoles
    },
    {
      deriveRuntimeSignalPackSurface,
      deriveRuntimeSignalPackReason,
      buildRuntimeSignalPackSummary,
      buildRuntimeSignalPackView
    }
  );
}

export function runtimeHandoffPack() {
  return buildRuntimeHandoffPackViewFromSources(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary,
      buildRuntimeHandoffPackView
    }
  );
}

export function runtimeTriagePack() {
  return buildRuntimeTriagePackViewFromSources(
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary,
      buildRuntimeTriagePackView
    }
  );
}

export function runtimeSessionPack(input = {}) {
  return buildRuntimeSessionPackViewFromSources(
    input,
    {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeSessionPackSurface,
      deriveRuntimeSessionPackReason,
      buildRuntimeSessionPackSummary,
      buildRuntimeSessionPackView
    }
  );
}

export function runtimeRolePack(input = {}) {
  return buildRuntimeRolePackViewFromSources(
    input,
    {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeRolePackSurface,
      deriveRuntimeRolePackReason,
      buildRuntimeRolePackSummary,
      buildRuntimeRolePackView
    }
  );
}

export function runtimeExecutionPack(input = {}) {
  return buildRuntimeExecutionPackViewFromSources(
    input,
    {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    },
    {
      deriveRuntimeExecutionPackSurface,
      deriveRuntimeExecutionPackReason,
      buildRuntimeExecutionPackSummary,
      buildRuntimeExecutionPackView
    }
  );
}

export function runtimePickupPack(input = {}) {
  return buildRuntimePickupPackViewFromSources(
    input,
    {
      normalizeNextMode,
      workerSession,
      taskNext,
      previewTaskPickup,
      runtimeRolePack,
      describeRole
    },
    {
      deriveRuntimePickupPackSurface,
      deriveRuntimePickupPackReason,
      buildRuntimePickupPackSummary,
      buildRuntimePickupPackView
    }
  );
}

export function runtimeAssignmentPack(input = {}) {
  return buildRuntimeAssignmentPackViewFromSources(
    input,
    {
      normalizeNextMode,
      leaderAssignments,
      workerSession,
      taskNext,
      previewTaskAssignment,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeAssignmentPackSurface,
      deriveRuntimeAssignmentPackReason,
      buildRuntimeAssignmentPackSummary,
      buildRuntimeAssignmentPackView
    }
  );
}

export function runtimeLeaderPack(input = {}) {
  return buildRuntimeLeaderPackViewFromSources(
    input,
    {
      leaderWorkspace,
      leaderQueue,
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeCloseout
    },
    {
      deriveRuntimeLeaderPackSurface,
      deriveRuntimeLeaderPackReason,
      buildRuntimeLeaderPackSummary,
      buildRuntimeLeaderPackView
    }
  );
}

export function runtimeOwnerPack(input = {}) {
  return buildRuntimeOwnerPackViewFromSources(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeOwnerPackSurface,
      deriveRuntimeOwnerPackReason,
      buildRuntimeOwnerPackSummary,
      buildRuntimeOwnerPackView
    }
  );
}

export function runtimeWorkerPack(input = {}) {
  return buildRuntimeWorkerPackViewFromSources(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole,
      normalizeNextMode
    },
    {
      deriveRuntimeWorkerPackSurface,
      deriveRuntimeWorkerPackReason,
      buildRuntimeWorkerPackSummary,
      buildRuntimeWorkerPackView
    }
  );
}

export function runtimeVerifierPack(input = {}) {
  return buildRuntimeVerifierPackViewFromSources(
    input,
    {
      runtimeReview,
      verifierBundle,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeVerifierPackSurface,
      deriveRuntimeVerifierPackReason,
      buildRuntimeVerifierPackSummary,
      buildRuntimeVerifierPackView
    }
  );
}

export function leaderWorkspace(input = {}) {
  return buildLeaderWorkspaceViewFromSources(
    input,
    {
      listSwarmOverviews,
      buildLeaderWorkspaceSwarmEntry,
      swarmBrief,
      swarmBundle,
      buildSwarmBundleSummary,
      compareLeaderWorkspaceEntries
    },
    {
      deriveLeaderWorkspaceReason,
      buildLeaderWorkspaceSummary,
      buildLeaderWorkspaceView
    }
  );
}

export function taskInbox(input = {}) {
  return buildTaskInboxViewFromSources(
    input,
    {
      getRuntimeCatalog,
      loadState,
      normalizeTask,
      sortInboxTasks,
      summarizeInboxTask,
      taskNext,
      isClaimableTask,
      describeRole
    },
    {
      deriveTaskInboxReason,
      buildTaskInboxView
    }
  );
}

export function taskNext(input = {}) {
  return buildTaskNextViewFromSources(
    input,
    {
      normalizeNextMode,
      loadState,
      normalizeTask,
      sortNextCandidates,
      describeRole,
      summarizeInboxTask,
      taskBrief
    },
    {
      deriveTaskNextReason,
      buildTaskNextView
    }
  );
}

export function taskPickup(input = {}) {
  return buildTaskPickupViewFromSources(
    input,
    {
      taskNext,
      claimTask,
      describeRole,
      summarizeInboxTask,
      taskBrief,
      getTask,
      pickupFollowupCommand,
      pickupOutcome,
      normalizeNextMode
    },
    {
      deriveTaskPickupReason,
      buildTaskPickupView
    }
  );
}

export function taskAssignmentPickup(input = {}) {
  return buildTaskAssignmentPickupViewFromSources(
    input,
    {
      leaderAssignments,
      describeRole,
      normalizeNextMode,
      getTask,
      taskBrief,
      summarizeInboxTask,
      claimTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPickupReason,
      buildTaskAssignmentPickupView
    }
  );
}

export function previewTaskAssignment(input = {}) {
  return buildPreviewTaskAssignmentViewFromSources(
    input,
    {
      leaderAssignments,
      describeRole,
      normalizeNextMode,
      getTask,
      summarizeInboxTask,
      taskBrief,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPreviewReason,
      buildPreviewTaskAssignmentView
    }
  );
}

export function previewTaskPickup(input = {}) {
  return buildPreviewTaskPickupViewFromSources(
    input,
    {
      taskNext,
      describeRole,
      normalizeNextMode,
      getTask,
      pickupOutcome,
      pickupFollowupCommand
    },
    {
      deriveTaskPickupPreviewReason,
      buildPreviewTaskPickupView
    }
  );
}

export function workerSession(input = {}) {
  return buildWorkerSessionViewFromSources(
    input,
    {
      loadState,
      normalizeTask,
      normalizeNextMode,
      compareTasksByUpdatedAt,
      taskInbox,
      taskNext,
      recommendWorkerSessionFocus,
      deriveWorkerSessionReason,
      describeRole,
      buildSessionTaskSnapshot,
      summarizeInboxTask,
      taskBrief
    },
    {
      buildWorkerSessionView
    }
  );
}

export function workerHandoff(input = {}) {
  return buildWorkerHandoffViewFromSources(
    input,
    {
      workerSession,
      deriveWorkerHandoffReason,
      buildWorkerHandoffSummary
    },
    {
      buildWorkerHandoffView
    }
  );
}

export function workerCloseout(input = {}) {
  return buildWorkerCloseoutViewFromSources(
    input,
    {
      workerHandoff,
      taskReport,
      deriveWorkerCloseoutReason,
      deriveWorkerCloseoutCommand,
      buildWorkerCloseoutSummary
    },
    {
      buildWorkerCloseoutView
    }
  );
}

export function verifierBundle(input = {}) {
  return buildVerifierBundleViewFromSources(
    input,
    {
      workerSession,
      workerHandoff,
      taskReport,
      describeRole,
      deriveVerifierBundleReason,
      buildVerifierDecisionCommands,
      buildVerifierBundleSummary
    },
    {
      buildVerifierBundleView
    }
  );
}

export function validateTask(id) {
  const task = loadState().tasks.map(normalizeTask).find((item) => item.id === id);
  if (!task) {
    return null;
  }
  return buildTaskValidationViewFromSources(
    task,
    {
      runtimeRoleCatalog
    },
    {
      buildTaskValidationView
    }
  );
}

export function validateSwarm(id) {
  const swarm = loadState().swarms.map(normalizeSwarm).find((item) => item.id === id);
  if (!swarm) {
    return null;
  }
  return buildSwarmValidationViewFromSources(
    swarm,
    {
      runtimeRoleCatalog
    },
    {
      buildSwarmValidationView
    }
  );
}

export { runtimeRoleCatalog };

export function syncSwarmStatus(id) {
  const state = loadState();
  const result = syncLoadedSwarmLifecycle(state, id, {
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState,
    deriveSwarmSyncReason
  });
  if (!result) {
    return null;
  }
  saveState(state);
  return {
    kind: "swarm_sync",
    recommendedReason: result.recommendedReason,
    swarm: result.swarm,
    derivedStatus: result.derivedStatus,
    changed: result.changed
  };
}

export function swarmOverview(id) {
  return buildSwarmOverviewViewFromSources(
    id,
    {
      loadState,
      normalizeSwarm,
      normalizeTask,
      buildSwarmOverviewData,
      deriveSwarmStatus,
      deriveSwarmOverviewReason
    },
    {
      buildSwarmOverviewView
    }
  );
}

export function addTask(input) {
  const state = loadState();
  const task = buildTask(input, state.nextId);
  state.tasks.push(task);
  state.nextId += 1;
  saveState(state);
  return task;
}

export function addTaskLifecycle(input) {
  const result = addTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_mutation",
    recommendedReason: "task_created",
    task: result
  };
}

export function addTasks(inputs) {
  const state = loadState();
  const created = [];

  for (const input of inputs) {
    const task = buildTask(input, state.nextId);
    state.tasks.push(task);
    state.nextId += 1;
    created.push(task);
  }

  saveState(state);
  return created;
}

export function storeMemory(input) {
  const state = loadState();
  const memory = buildMemory(input, state.nextMemoryId);
  state.memories.push(memory);
  state.nextMemoryId += 1;
  saveState(state);
  return memory;
}

export function storeMemoryMutation(input) {
  const result = storeMemory(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "memory_mutation",
    recommendedReason: "memory_stored",
    memory: result
  };
}

export function initSwarm(input) {
  const state = loadState();
  const swarm = buildSwarm(input, state.nextSwarmId);
  state.swarms.push(swarm);
  state.nextSwarmId += 1;
  saveState(state);
  return swarm;
}

export function initSwarmMutation(input) {
  const result = initSwarm(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_mutation",
    recommendedReason: "swarm_created",
    swarm: result
  };
}

export function searchMemories(query, filters = {}) {
  const memories = filterMemories(loadState().memories, filters);
  if (!query?.trim()) {
    return memories.map((memory) => ({ ...memory, score: 0 }));
  }

  const tokens = tokenize(query);
  return memories
    .map((memory) => ({
      ...memory,
      score: scoreMemory(memory, tokens)
    }))
    .filter((memory) => memory.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.updatedAt.localeCompare(left.updatedAt);
    });
}

export function searchMemoriesView(query, filters = {}, limit = 10) {
  const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
  const results = searchMemories(query, filters).slice(0, normalizedLimit);
  const recommendedReason = results.length > 0 ? "memory_search_has_results" : "memory_search_empty";
  return {
    kind: "memory_search_view",
    recommendedReason,
    counts: {
      totalResults: results.length
    },
    query,
    results
  };
}

export function updateTask(input) {
  return updateTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  });
}

export function updateTaskMutation(input) {
  const result = updateTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_mutation",
    recommendedReason: "task_updated",
    task: result
  };
}

export function updateSwarm(input) {
  return updateSwarmFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    buildUpdatedSwarmState
  });
}

export function updateSwarmMutation(input) {
  const result = updateSwarm(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_mutation",
    recommendedReason: "swarm_updated",
    swarm: result
  };
}

export function queueSwarmTasks(input) {
  return queueSwarmTasksFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane,
    validateSwarmValue,
    runtimeRoleCatalog,
    buildTask,
    buildQueuedSwarmLaneTaskInput,
    buildQueuedSwarmLaneState,
    buildQueuedSwarmState,
    deriveSwarmQueueReason
  });
}

export function dispatchSwarmLane(input) {
  return dispatchSwarmLaneFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    validateTaskValue,
    runtimeRoleCatalog,
    buildDispatchedSwarmTaskState,
    buildDispatchedSwarmState,
    findDispatchableSwarmLane,
    syncSwarmInLoadedState,
    deriveSwarmDispatchReason
  });
}

export function stateFilePath() {
  return ensureStateFile();
}

export function claimTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "claimed",
    requireClaimedBy: true
  });
}

export function claimTaskLifecycle(input) {
  const result = claimTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason: "task_claimed",
    task: result
  };
}

export function blockTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "blocked"
  });
}

export function blockTaskLifecycle(input) {
  const result = blockTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason: "task_blocked",
    task: result
  };
}

export function markTaskReadyForReview(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "ready_for_review"
  });
}

export function markTaskReadyForReviewLifecycle(input) {
  const result = markTaskReadyForReview(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason: "task_ready_for_review",
    task: result
  };
}

export function completeTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "done"
  });
}

export function completeTaskLifecycle(input) {
  const result = completeTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason: "task_completed",
    task: result
  };
}

export function approveTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "done"
  });
}

export function approveTaskLifecycle(input) {
  const result = approveTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason: "task_approved",
    task: result
  };
}

export function rejectTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: input.nextQueueStatus ?? "claimed"
  });
}

export function rejectTaskLifecycle(input) {
  const result = rejectTask(input);
  if (!result || result.error) {
    return result;
  }
  let recommendedReason = "task_changes_requested";
  if (result.queueStatus === "released") {
    recommendedReason = "task_released_for_rework";
  } else if (result.queueStatus === "blocked") {
    recommendedReason = "task_blocked_for_rework";
  }
  return {
    kind: "task_lifecycle",
    recommendedReason,
    task: result
  };
}

export function releaseTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "released"
  });
}

export function releaseTaskLifecycle(input) {
  const result = releaseTask(input);
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason: "task_released",
    task: result
  };
}

export function activateSwarm(input) {
  const result = transitionSwarm({
    ...input,
    nextStatus: "active"
  });
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_lifecycle",
    recommendedReason: "swarm_activated",
    swarm: result
  };
}

export function blockSwarm(input) {
  const result = transitionSwarm({
    ...input,
    nextStatus: "blocked"
  });
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_lifecycle",
    recommendedReason: "swarm_blocked",
    swarm: result
  };
}

export function completeSwarm(input) {
  const result = transitionSwarm({
    ...input,
    nextStatus: "completed"
  });
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_lifecycle",
    recommendedReason: "swarm_completed",
    swarm: result
  };
}

export function cancelSwarm(input) {
  const result = transitionSwarm({
    ...input,
    nextStatus: "cancelled"
  });
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_lifecycle",
    recommendedReason: "swarm_cancelled",
    swarm: result
  };
}

function syncSwarmInLoadedState(state, swarmId) {
  return syncLoadedSwarmState(state, swarmId, {
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState
  });
}

function transitionTask(input) {
  return transitionTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask,
    deriveTaskTransitionContext,
    validateNextQueueStatus,
    validQueueStatuses: VALID_QUEUE_STATUSES,
    validateTaskQueueTransition,
    canTransitionTask,
    validateRequiredClaimedBy,
    validateTaskClaimReady,
    validateTaskValue,
    runtimeRoleCatalog,
    validateVerifierAction,
    validateTaskClaimConflict,
    resolveTaskClaimedBy,
    buildTaskReviewPatch,
    appendTaskHistoryEntry,
    buildTaskHistoryEntry,
    buildTransitionedTaskState,
    syncSwarmInLoadedState
  });
}

function transitionSwarm(input) {
  return transitionSwarmFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    validateNextSwarmStatus,
    validateSwarmStatusTransition,
    canTransitionSwarm,
    validSwarmStatuses: VALID_SWARM_STATUSES,
    buildTransitionedSwarmState
  });
}
