import {
  existsSync,
  mkdirSync,
  readFileSync
} from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { getRuntimeCatalog, listAgentRoleIds } from "./catalog.js";
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
  buildQueuedSwarmLaneState,
  buildQueuedSwarmLaneTaskInput,
  buildQueuedSwarmState,
  buildDispatchedSwarmState,
  buildDispatchedSwarmTaskState,
  buildSyncedSwarmState,
  dispatchLoadedSwarmLane,
  findDispatchableSwarmLane,
  queueLoadedSwarmTasks,
  updateLoadedSwarmState,
  buildTransitionedSwarmState,
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
  buildRuntimeCloseoutView,
  buildRuntimeFocusView,
  buildRuntimeActivityEntry,
  buildRuntimeHandoffsView,
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
  compareRuntimeAlerts,
  summarizeDashboardTask
} from "./state-role-views.js";
import {
  buildLeaderAssignmentsSummary,
  buildLeaderQueueSummary,
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsView,
  buildRuntimeDashboardSummary,
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
  buildRuntimeDispatchView,
  buildRuntimeHandoffsSummary,
  buildRuntimeRecoverySummary,
  buildRuntimeReviewSummary,
  buildRuntimeRolesSummary
} from "./state-dashboard-views.js";
import {
  buildSwarmOverviewData,
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
  buildWorkerSessionView,
  buildWorkerCloseoutView,
  buildWorkerHandoffView,
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
  buildRuntimeExecutionPackSummary,
  buildRuntimeExecutionPackView,
  buildRuntimeFocusSources,
  buildRuntimeHandoffPackView,
  buildRuntimeHandoffPackSummary,
  buildRuntimeCloseoutPackView,
  buildRuntimeCloseoutPackSummary,
  buildRuntimeDispatchPackView,
  buildRuntimeDispatchPackSummary,
  buildRuntimeAssignmentPackSummary,
  buildRuntimeAssignmentPackView,
  buildRuntimeOperatorPackView,
  buildRuntimeOperatorPackSummary,
  buildRuntimePickupPackSummary,
  buildRuntimePickupPackView,
  buildRuntimeRecoveryPackView,
  buildRuntimeRecoveryPackSummary,
  buildRuntimeReviewPackView,
  buildRuntimeLeaderPackSummary,
  buildRuntimeLeaderPackView,
  buildLeaderWorkspaceSummary,
  buildLeaderWorkspaceSwarmEntry,
  buildRuntimeOwnerPackSummary,
  buildRuntimeOwnerPackView,
  buildRuntimeQueuePackView,
  buildRuntimeQueuePackSummary,
  buildRuntimeRolePackView,
  buildRuntimeReviewPackSummary,
  buildRuntimeRolePackSummary,
  buildRuntimeSessionPackView,
  buildRuntimeSessionPackSummary,
  buildRuntimeSignalPackView,
  buildRuntimeSignalPackSummary,
  buildRuntimeSummaryPackView,
  buildRuntimeSummaryPackSummary,
  buildRuntimeTriagePackView,
  buildRuntimeTriagePackSummary,
  buildRuntimeVerifierPackSummary,
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
  buildSwarmValidationView,
  buildTaskValidationView,
  canTransitionSwarm,
  canTransitionTask,
  deriveSwarmStatus,
  deriveSwarmValidationReason,
  deriveTaskValidationReason,
  validateSwarmValue,
  validateTaskValue
} from "./state-rules.js";

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
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const validation = validateTaskValue(task, runtimeRoleCatalog());
  const catalog = getRuntimeCatalog();
  const recommended = recommendTaskAction(task);
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
      queueStatus: task.queueStatus,
      claimedBy: task.claimedBy,
      notes: task.notes
    },
    counts: {
      scopeEntries: scope.length,
      acceptanceItems: acceptance.length,
      verificationSteps: verification.length,
      reviewEvidenceEntries: reviewEvidence.length,
      historyEntries: historyEntries.length,
      annotationEntries: annotationEntries.length
    },
    execution: {
      scope,
      acceptance,
      verification
    },
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

export function swarmBrief(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const validation = validateSwarmValue(overview.swarm, runtimeRoleCatalog());
  const lanes = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    const recommended = recommendLaneAction(laneSummary, task);

    return {
      lane: laneSummary.lane,
      summary: laneSummary.summary,
      owner: describeRole(laneSummary.owner, catalog),
      verifier: describeRole(laneSummary.verifier, catalog),
      taskId: laneSummary.taskId,
      taskQueueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      scope: laneSummary.scope ?? [],
      acceptance: task?.acceptance ?? [],
      verification: task?.verification ?? [],
      ready: laneSummary.ready,
      done: laneSummary.done,
      recommendedNextActor: recommended.actor,
      recommendedNextAction: recommended.action,
      recommendedCommands: recommended.commands
    };
  });

  const recommended = recommendSwarmAction(overview, lanes);
  const recommendedReason = deriveSwarmBriefReason(recommended);

  return {
    kind: "swarm_execution_brief",
    recommendedReason,
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    owner: describeRole(overview.swarm.owner, catalog),
    lanes,
    nextLane: lanes.find((lane) => lane.lane === overview.nextLane?.lane) ?? null,
    validation,
    leaderHandoff: buildSwarmHandoff(overview, recommended),
    recommendedNextActor: recommended.actor,
    recommendedNextAction: recommended.action,
    recommendedCommands: recommended.commands
  };
}

export function swarmBundle(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const laneBundles = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    return {
      lane: laneSummary.lane,
      summary: laneSummary.summary,
      owner: laneSummary.owner,
      verifier: laneSummary.verifier,
      taskId: task?.id ?? null,
      queueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      ready: laneSummary.ready,
      done: laneSummary.done,
      report: task ? taskReport(task.id) : null
    };
  });
  const recommendedReason = deriveSwarmBundleReason({ overview, laneBundles });

  return {
    kind: "swarm_bundle",
    recommendedReason,
    swarm: overview.swarm,
    brief,
    counts: overview.counts,
    derivedStatus: overview.derivedStatus,
    readyToComplete: overview.readyToComplete,
    nextLane: overview.nextLane,
    lanes: laneBundles,
    summary: buildSwarmBundleSummary(overview, laneBundles)
  };
}

export function swarmCloseout(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const bundle = swarmBundle(id);
  const command = deriveSwarmCloseoutCommand(overview, brief);
  const recommendedReason = deriveSwarmCloseoutReason({ overview, command });

  return {
    kind: "swarm_closeout",
    recommendedReason,
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    readyToComplete: overview.readyToComplete,
    brief,
    bundle,
    command,
    summary: buildSwarmCloseoutSummary(overview, command)
  };
}

export function swarmBlockers(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const blockedLanes = (brief?.lanes ?? [])
    .filter((lane) => lane.taskQueueStatus === "blocked")
    .map((lane) => ({
      lane: lane.lane,
      summary: lane.summary,
      owner: lane.owner,
      verifier: lane.verifier,
      taskId: lane.taskId,
      claimedBy: lane.claimedBy,
      recommendedNextActor: lane.recommendedNextActor,
      recommendedNextAction: lane.recommendedNextAction,
      recommendedCommands: lane.recommendedCommands,
      report: lane.taskId ? taskReport(lane.taskId) : null
    }));
  const recommendedReason = deriveSwarmBlockersReason({ blockedLanes });

  return {
    kind: "swarm_blockers",
    recommendedReason,
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    blockedCount: blockedLanes.length,
    blockers: blockedLanes,
    summary: buildSwarmBlockersSummary(overview, blockedLanes)
  };
}

export function swarmDispatchBundle(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const dispatchLane = (brief?.lanes ?? []).find(
    (lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released"
  ) ?? null;
  const recommendedReason = deriveSwarmDispatchBundleReason({ overview, dispatchLane });
  const laneTaskBrief = dispatchLane?.taskId ? taskBrief(dispatchLane.taskId) : null;
  const recommendedCommands = dispatchLane?.recommendedCommands ?? [];

  return {
    kind: "swarm_dispatch_bundle",
    recommendedReason,
    metadata: {
      hasNextLane: Boolean(dispatchLane),
      hasTaskBrief: Boolean(laneTaskBrief),
      nextLaneId: dispatchLane?.lane ?? null
    },
    counts: {
      dispatchableLanes: overview.dispatchableCount,
      nextLaneCommands: recommendedCommands.filter(Boolean).length
    },
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    dispatchableCount: overview.dispatchableCount,
    nextLane: dispatchLane,
    taskBrief: laneTaskBrief,
    command: recommendedCommands[0] ?? null,
    summary: buildSwarmDispatchBundleSummary(overview, dispatchLane)
  };
}

export function leaderQueue(input = {}) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const items = workspace.swarms.map((swarm, index) => ({
    position: index + 1,
    swarmId: swarm.id,
    objective: swarm.objective,
    status: swarm.status,
    derivedStatus: swarm.derivedStatus,
    readyToComplete: swarm.readyToComplete,
    recommendedNextActor: swarm.recommendedNextActor,
    recommendedNextAction: swarm.recommendedNextAction,
    recommendedCommands: swarm.recommendedCommands,
    summary: swarm.summary
  }));
  const next = items[0] ?? null;
  const actionable = items.filter((item) => !["completed", "cancelled"].includes(item.status)).length;
  const recommendedReason = deriveLeaderQueueReason({ items, actionable, next });

  return {
    kind: "leader_queue",
    recommendedReason,
    filters: workspace.filters,
    counts: {
      total: items.length,
      actionable
    },
    items,
    next,
    summary: buildLeaderQueueSummary(items)
  };
}

export function leaderAssignments(input = {}) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const assignments = workspace.swarms.flatMap((swarm) => {
    const brief = swarmBrief(swarm.id);
    return (brief?.lanes ?? [])
      .filter((lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released")
      .map((lane) => ({
        swarmId: swarm.id,
        objective: swarm.objective,
        lane: lane.lane,
        owner: lane.owner,
        verifier: lane.verifier,
        taskId: lane.taskId,
        taskQueueStatus: lane.taskQueueStatus,
        recommendedNextActor: lane.recommendedNextActor,
        recommendedNextAction: lane.recommendedNextAction,
        recommendedCommands: lane.recommendedCommands,
        taskBrief: lane.taskId ? taskBrief(lane.taskId) : null,
        summary: `Dispatch ${lane.lane} from ${swarm.id} to ${lane.owner.id ?? lane.owner.name ?? "unknown"}.`
      }));
  });

  const groupsByOwner = new Map();
  for (const assignment of assignments) {
    const ownerId = assignment.owner?.id ?? assignment.owner?.name ?? "unknown";
    const current = groupsByOwner.get(ownerId) ?? {
      owner: assignment.owner,
      count: 0,
      assignments: []
    };
    current.assignments.push(assignment);
    current.count += 1;
    groupsByOwner.set(ownerId, current);
  }

  const groups = [...groupsByOwner.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return (left.owner?.id ?? left.owner?.name ?? "").localeCompare(right.owner?.id ?? right.owner?.name ?? "");
  });
  const next = assignments[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentsReason({ assignments, groups, next });

  return {
    kind: "leader_assignments",
    recommendedReason,
    filters: workspace.filters,
    counts: {
      totalAssignments: assignments.length,
      ownerGroups: groups.length
    },
    next,
    groups,
    summary: buildLeaderAssignmentsSummary(assignments, groups)
  };
}

export function leaderAssignmentDispatch(input = {}) {
  const assignments = leaderAssignments(input);
  const ownerId = input.role ?? input.owner ?? null;
  const ownerGroup = ownerId
    ? (assignments?.groups ?? []).find((group) => (group.owner?.id ?? group.owner?.name ?? null) === ownerId) ?? null
    : assignments?.groups?.[0] ?? null;
  const assignment = input.taskId
    ? (ownerGroup?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : ownerGroup?.assignments?.[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchReason({ ownerId, ownerGroup, assignment, requestedTaskId: input.taskId ?? null });

  if (!assignment) {
    return {
      kind: "leader_assignment_dispatch",
      recommendedReason,
      role: ownerGroup?.owner ?? describeRole(ownerId),
      workerId: input.workerId ?? null,
      assignment: null,
      command: null,
      previewCommand: null,
      pickupCommand: null,
      summary: "Leader assignment dispatch has no matching assignment right now."
    };
  }

  const owner = assignment.owner?.id ?? assignment.owner?.name ?? ownerId ?? "unknown";
  const workerId = input.workerId ?? "<worker-id>";
  const previewCommand = `node ./src/index.js task:assignment-preview --role ${owner} --worker ${workerId} --task ${assignment.taskId}`;
  const pickupCommand = `node ./src/index.js task:assignment-pickup --role ${owner} --worker ${workerId} --task ${assignment.taskId}`;

  return {
    kind: "leader_assignment_dispatch",
    recommendedReason,
    role: assignment.owner,
    workerId: input.workerId ?? null,
    assignment,
    command: pickupCommand,
    previewCommand,
    pickupCommand,
    summary: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId} to ${owner}${input.workerId ? ` via ${input.workerId}` : ""}.`
  };
}

export function leaderAssignmentDispatchPack(input = {}) {
  const assignments = leaderAssignments(input);
  const groups = (assignments?.groups ?? []).map((group) => {
    const ownerId = group.owner?.id ?? group.owner?.name ?? "unknown";
    const workerId = input.workerIds?.[ownerId] ?? input.workerId ?? `<${ownerId}-worker>`;
    const dispatch = leaderAssignmentDispatch({
      ...input,
      role: ownerId,
      workerId
    });

    return {
      owner: group.owner,
      count: group.count,
      next: dispatch.assignment,
      workerId,
      previewCommand: dispatch.previewCommand,
      pickupCommand: dispatch.pickupCommand,
      command: dispatch.command,
      summary: dispatch.summary
    };
  });
  const next = groups[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next });

  return {
    kind: "leader_assignment_dispatch_pack",
    recommendedReason,
    counts: {
      ownerGroups: groups.length,
      totalAssignments: assignments?.counts?.totalAssignments ?? 0
    },
    next,
    groups,
    summary: next
      ? `Leader assignment dispatch pack has ${groups.length} owner group${groups.length === 1 ? "" : "s"} ready; ${next.owner?.id ?? next.owner?.name ?? "unknown"} is first.`
      : "Leader assignment dispatch pack has no worker-targeted assignment dispatches right now."
  };
}

export function leaderAssignmentDispatchBundle(input = {}) {
  const dispatchPack = leaderAssignmentDispatchPack(input);
  const launches = (dispatchPack?.groups ?? []).map((group, index) => ({
    roleId: group.owner?.id ?? group.owner?.name ?? "unknown",
    position: index + 1,
    role: group.owner,
    workerId: group.workerId,
    taskId: group.next?.taskId ?? null,
    swarmId: group.next?.swarmId ?? null,
    objective: group.next?.objective ?? null,
    lane: group.next?.lane ?? null,
    assignment: group.next ?? null,
    sessionCommand: `node ./src/index.js worker:session --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    assignmentPackCommand: `node ./src/index.js runtime:assignment-pack --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    launchCommand: `node ./src/index.js runtime:assignment-pack --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    previewCommand: group.previewCommand,
    pickupCommand: group.pickupCommand,
    command: group.command,
    summary: group.summary
  }));
  const next = launches[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next });

  return {
    kind: "leader_assignment_dispatch_bundle",
    recommendedReason,
    counts: {
      launches: launches.length,
      ownerGroups: dispatchPack?.counts?.ownerGroups ?? 0,
      totalAssignments: dispatchPack?.counts?.totalAssignments ?? 0
    },
    next,
    launches,
    summary: next
      ? `Leader assignment dispatch bundle has ${launches.length} worker launch${launches.length === 1 ? "" : "es"} ready; ${next.role?.id ?? next.role?.name ?? "unknown"} via ${next.workerId ?? "<worker-id>"} is first.`
      : "Leader assignment dispatch bundle has no worker launches right now."
  };
}

export function leaderAssignmentLaunchPlan(input = {}) {
  const bundle = leaderAssignmentDispatchBundle(input);
  const steps = (bundle?.launches ?? []).map((launch, index) => ({
    position: index + 1,
    role: launch.role,
    workerId: launch.workerId,
    taskId: launch.taskId,
    lane: launch.lane,
    swarmId: launch.swarmId,
    launchCommand: launch.launchCommand,
    sessionCommand: launch.sessionCommand,
    previewCommand: launch.previewCommand,
    pickupCommand: launch.pickupCommand,
    handoff: {
      assignmentPackCommand: launch.assignmentPackCommand,
      pickupCommand: launch.pickupCommand
    },
    summary: `Start ${launch.workerId ?? "<worker-id>"} on ${launch.role?.id ?? launch.role?.name ?? "unknown"} for ${launch.taskId ?? "no-task"}.`
  }));
  const next = steps[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentLaunchPlanReason({ bundle, steps, next });

  return {
    kind: "leader_assignment_launch_plan",
    recommendedReason,
    counts: {
      steps: steps.length,
      launches: bundle?.counts?.launches ?? 0,
      ownerGroups: bundle?.counts?.ownerGroups ?? 0,
      totalAssignments: bundle?.counts?.totalAssignments ?? 0
    },
    next,
    steps,
    bundle,
    summary: next
      ? `Leader assignment launch plan has ${steps.length} startup step${steps.length === 1 ? "" : "s"} ready; ${next.workerId ?? "<worker-id>"} is first.`
      : "Leader assignment launch plan has no startup steps right now."
  };
}

export function runtimeDashboard() {
  return buildRuntimeDashboardView(
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
      buildRuntimeDashboardSummary
    }
  );
}

export function runtimeAlerts() {
  return buildRuntimeAlertsView(
    {
      runtimeDashboard,
      listSwarmOverviews,
      compareRuntimeAlerts
    },
    {
      deriveRuntimeAlertsReason,
      buildRuntimeAlertsSummary
    }
  );
}

export function runtimeRoles(input = {}) {
  const catalog = getRuntimeCatalog();
  const assignments = leaderAssignments();
  const assignmentsByRole = new Map(
    (assignments?.groups ?? []).map((group) => [group.owner?.id ?? group.owner?.name ?? "unknown", group.assignments ?? []])
  );
  const roles = catalog.agents
    .map((agent) =>
      buildRuntimeRoleEntry(agent.id, input.limit, assignmentsByRole.get(agent.id) ?? [], {
        describeRole,
        loadState,
        normalizeTask,
        taskInbox,
        taskNext,
        isClaimableTask
      })
    )
    .filter(Boolean)
    .sort(compareRuntimeRoleEntries);
  const next = roles[0] ?? null;
  const recommendedReason = deriveRuntimeRolesReason({ roles, next });

  return {
    kind: "runtime_roles",
    recommendedReason,
    counts: {
      totalRoles: roles.length,
      withPendingReview: roles.filter((entry) => entry.counts.pendingReview > 0).length,
      withBlockedOwnerWork: roles.filter((entry) => entry.counts.ownerBlocked > 0).length,
      withClaimableOwnerWork: roles.filter((entry) => entry.counts.ownerClaimable > 0).length,
      withActiveOwnerWork: roles.filter((entry) => entry.counts.ownerClaimed > 0).length,
      totalPendingReview: roles.reduce((total, entry) => total + entry.counts.pendingReview, 0),
      totalBlockedOwnerWork: roles.reduce((total, entry) => total + entry.counts.ownerBlocked, 0),
      totalClaimableOwnerWork: roles.reduce((total, entry) => total + entry.counts.ownerClaimable, 0)
    },
    roles,
    next,
    summary: buildRuntimeRolesSummary(roles, next)
  };
}

export function runtimeDispatch() {
  return buildRuntimeDispatchView(
    {
      leaderAssignments
    },
    {
      deriveRuntimeDispatchReason,
      buildRuntimeDispatchSummary
    }
  );
}

export function runtimeReview() {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt);
  const groupsByVerifier = new Map();

  for (const task of tasks) {
    const verifierId = task.verifier ?? "unknown";
    const current = groupsByVerifier.get(verifierId) ?? {
      verifier: describeRole(verifierId),
      count: 0,
      tasks: []
    };
    current.tasks.push(buildRuntimeReviewTaskEntry(task, current.count + 1, describeRole, taskBrief));
    current.count += 1;
    groupsByVerifier.set(verifierId, current);
  }

  const groups = [...groupsByVerifier.values()].sort(compareRuntimeReviewGroups);
  const next = groups[0]?.tasks?.[0] ?? null;
  const recommendedReason = deriveRuntimeReviewReason({ groups, next, totalPendingReview: tasks.length });

  return {
    kind: "runtime_review",
    recommendedReason,
    counts: {
      verifierGroups: groups.length,
      totalPendingReview: tasks.length
    },
    groups,
    next,
    summary: buildRuntimeReviewSummary(groups, next)
  };
}

export function runtimeFocus() {
  const dashboard = runtimeDashboard();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const dispatch = runtimeDispatch();
  const roles = runtimeRoles();
  return buildRuntimeFocusView(
    {
      dashboard,
      alerts,
      review,
      dispatch,
      roles
    },
    {
      taskBrief,
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    }
  );
}

export function runtimeActivity(input = {}) {
  return buildRuntimeActivityView(
    input,
    {
      loadState,
      normalizeTask,
      taskBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries,
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary
    }
  );
}

export function runtimeHandoffs() {
  return buildRuntimeHandoffsView(
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
      buildRuntimeHandoffsSummary
    }
  );
}

export function runtimeCloseout() {
  return buildRuntimeCloseoutView(
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
      buildRuntimeCloseoutSummary
    }
  );
}

export function runtimeRecovery() {
  return buildRuntimeRecoveryView(
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
      buildRuntimeRecoverySummary
    }
  );
}

export function runtimeSummaryPack(input = {}) {
  return buildRuntimeSummaryPackView(
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
      buildRuntimeSummaryPackSummary
    }
  );
}

export function runtimeOperatorPack() {
  return buildRuntimeOperatorPackView(
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
      buildRuntimeOperatorPackSummary
    }
  );
}

export function runtimeDispatchPack(input = {}) {
  return buildRuntimeDispatchPackView(
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
      buildRuntimeDispatchPackSummary
    }
  );
}

export function runtimeRecoveryPack() {
  return buildRuntimeRecoveryPackView(
    {
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
    },
    {
      deriveRuntimeRecoveryPackSurface,
      deriveRuntimeRecoveryPackReason,
      buildRuntimeRecoveryPackSummary
    }
  );
}

export function runtimeCloseoutPack(input = {}) {
  return buildRuntimeCloseoutPackView(
    input,
    {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary
    }
  );
}

export function runtimeReviewPack(input = {}) {
  return buildRuntimeReviewPackView(
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
      buildRuntimeReviewPackSummary
    }
  );
}

export function runtimeQueuePack(input = {}) {
  return buildRuntimeQueuePackView(
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
      buildRuntimeQueuePackSummary
    }
  );
}

export function runtimeWorkspacePack(input = {}) {
  return buildRuntimeWorkspacePackView(
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
      buildRuntimeWorkspacePackSummary
    }
  );
}

export function runtimeControlPack(input = {}) {
  return buildRuntimeControlPackView(
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
      buildRuntimeControlPackSummary
    }
  );
}

export function runtimeSignalPack(input = {}) {
  return buildRuntimeSignalPackView(
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
      buildRuntimeSignalPackSummary
    }
  );
}

export function runtimeHandoffPack() {
  return buildRuntimeHandoffPackView(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}

export function runtimeTriagePack() {
  return buildRuntimeTriagePackView(
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary
    }
  );
}

export function runtimeSessionPack(input = {}) {
  return buildRuntimeSessionPackView(
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
      buildRuntimeSessionPackSummary
    }
  );
}

export function runtimeRolePack(input = {}) {
  return buildRuntimeRolePackView(
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
      buildRuntimeRolePackSummary
    }
  );
}

export function runtimeExecutionPack(input = {}) {
  return buildRuntimeExecutionPackView(
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
      buildRuntimeExecutionPackSummary
    }
  );
}

export function runtimePickupPack(input = {}) {
  return buildRuntimePickupPackView(
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
      buildRuntimePickupPackSummary
    }
  );
}

export function runtimeAssignmentPack(input = {}) {
  return buildRuntimeAssignmentPackView(
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
      buildRuntimeAssignmentPackSummary
    }
  );
}

export function runtimeLeaderPack(input = {}) {
  return buildRuntimeLeaderPackView(
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
      buildRuntimeLeaderPackSummary
    }
  );
}

export function runtimeOwnerPack(input = {}) {
  return buildRuntimeOwnerPackView(
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
      buildRuntimeOwnerPackSummary
    }
  );
}

export function runtimeWorkerPack(input = {}) {
  return buildRuntimeWorkerPackView(
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
      buildRuntimeWorkerPackSummary
    }
  );
}

export function runtimeVerifierPack(input = {}) {
  return buildRuntimeVerifierPackView(
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
      buildRuntimeVerifierPackSummary
    }
  );
}

export function leaderWorkspace(input = {}) {
  const filters = {
    status: input.status,
    topology: input.topology,
    owner: input.owner
  };
  const overviews = listSwarmOverviews(filters);
  const swarmEntries = overviews
    .map((overview) => buildLeaderWorkspaceSwarmEntry(overview, swarmBrief, buildSwarmBundleSummary))
    .sort(compareLeaderWorkspaceEntries);
  const focusEntry = swarmEntries[0] ?? null;
  const recommendedReason = deriveLeaderWorkspaceReason({ swarmEntries, focusEntry });

  return {
    kind: "leader_workspace",
    recommendedReason,
    filters,
    counts: {
      totalSwarms: swarmEntries.length,
      planned: swarmEntries.filter((entry) => entry.status === "planned").length,
      active: swarmEntries.filter((entry) => entry.status === "active").length,
      blocked: swarmEntries.filter((entry) => entry.status === "blocked").length,
      completed: swarmEntries.filter((entry) => entry.status === "completed").length,
      cancelled: swarmEntries.filter((entry) => entry.status === "cancelled").length,
      readyToComplete: swarmEntries.filter((entry) => entry.readyToComplete).length,
      dispatchable: swarmEntries.reduce((total, entry) => total + (entry.dispatchableCount ?? 0), 0),
      pendingReview: swarmEntries.reduce((total, entry) => total + (entry.counts?.readyForReview ?? 0), 0)
    },
    swarms: swarmEntries,
    focus: focusEntry
      ? {
          swarmId: focusEntry.id,
          recommendedNextActor: focusEntry.recommendedNextActor,
          recommendedNextAction: focusEntry.recommendedNextAction,
          recommendedCommands: focusEntry.recommendedCommands,
          bundle: swarmBundle(focusEntry.id)
        }
      : null,
    summary: buildLeaderWorkspaceSummary(swarmEntries, focusEntry)
  };
}

export function taskInbox(input = {}) {
  if (!input.role) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.owner === input.role || task.verifier === input.role);
  const sorted = sortInboxTasks(tasks, input.role, input.workerId);
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const visibleTasks = sorted.slice(0, limit).map((task) => summarizeInboxTask(task, input.role, input.workerId));
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  const recommendedReason = deriveTaskInboxReason({ tasks: visibleTasks, next, counts: {
    ownerClaimable: tasks.filter((task) => task.owner === input.role && isClaimableTask(task)).length,
    ownerClaimedByWorker: input.workerId
      ? tasks.filter(
          (task) =>
            task.owner === input.role &&
            task.queueStatus === "claimed" &&
            task.claimedBy === input.workerId
        ).length
      : 0,
    ownerBlocked: tasks.filter((task) => task.owner === input.role && task.queueStatus === "blocked").length,
    pendingReview: tasks.filter((task) => task.verifier === input.role && task.queueStatus === "ready_for_review").length,
    completed: tasks.filter((task) => task.queueStatus === "done").length
  } });

  return {
    kind: "role_inbox",
    role: describeRole(input.role, catalog),
    workerId: input.workerId ?? null,
    recommendedReason,
    counts: {
      total: tasks.length,
      ownerClaimable: tasks.filter((task) => task.owner === input.role && isClaimableTask(task)).length,
      ownerClaimedByWorker: input.workerId
        ? tasks.filter(
            (task) =>
              task.owner === input.role &&
              task.queueStatus === "claimed" &&
              task.claimedBy === input.workerId
          ).length
        : 0,
      ownerBlocked: tasks.filter((task) => task.owner === input.role && task.queueStatus === "blocked").length,
      pendingReview: tasks.filter((task) => task.verifier === input.role && task.queueStatus === "ready_for_review").length,
      completed: tasks.filter((task) => task.queueStatus === "done").length
    },
    tasks: visibleTasks,
    next
  };
}

export function taskNext(input = {}) {
  if (!input.role) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const tasks = loadState().tasks.map(normalizeTask);
  const candidates = sortNextCandidates(tasks, input.role, input.workerId, mode);
  const selected = candidates[0] ?? null;

  return {
    kind: "next_task_candidate",
    role: describeRole(input.role),
    workerId: input.workerId ?? null,
    mode,
    recommendedReason: deriveTaskNextReason(selected ? summarizeInboxTask(selected, input.role, input.workerId).relation : null),
    candidate: selected ? summarizeInboxTask(selected, input.role, input.workerId) : null,
    brief: selected ? taskBrief(selected.id) : null
  };
}

export function taskPickup(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  if (!next?.candidate) {
    return {
      kind: "task_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next?.mode ?? normalizeNextMode(input.mode),
      recommendedReason: "no_candidate_available",
      outcome: "none",
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const relation = next.candidate.relation;
  if (relation === "owner_claimable") {
    const claimed = claimTask({
      id: next.candidate.id,
      claimedBy: input.workerId
    });
    if (!claimed || claimed.error) {
      return {
        kind: "task_pickup",
        role: describeRole(input.role),
        workerId: input.workerId,
        mode: next.mode,
        recommendedReason: "claim_failed",
        outcome: "error",
        candidate: next.candidate,
        task: claimed ?? null,
        brief: next.brief,
        command: null,
        error: claimed?.error ?? `Unable to claim task ${next.candidate.id}`
      };
    }

    return {
      kind: "task_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      recommendedReason: "claimable_owner_work",
      outcome: "claimed",
      candidate: summarizeInboxTask(claimed, input.role, input.workerId),
      task: claimed,
      brief: taskBrief(claimed.id),
      command: `node ./src/index.js task:review --id ${claimed.id} --by ${input.workerId}`
    };
  }

  const currentTask = getTask(next.candidate.id);
  const command = pickupFollowupCommand(next.candidate, input.workerId);
  return {
    kind: "task_pickup",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    recommendedReason: deriveTaskPickupReason(relation),
    outcome: pickupOutcome(relation),
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    command
  };
}

export function taskAssignmentPickup(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = input.taskId
    ? (roleAssignments?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : roleAssignments?.assignments?.[0] ?? null;

  if (!assignment?.taskId) {
    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_assignment_available",
      assignment: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const task = getTask(assignment.taskId);
  if (!task) {
    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "error",
      recommendedReason: "missing_assignment_task",
      assignment,
      task: null,
      brief: null,
      command: null,
      error: `Missing task for assignment ${assignment.taskId}`
    };
  }

  const brief = taskBrief(task.id);
  const candidate = summarizeInboxTask(task, input.role, input.workerId);

  if (candidate.relation === "owner_claimable") {
    const claimed = claimTask({
      id: candidate.id,
      claimedBy: input.workerId
    });
    if (!claimed || claimed.error) {
      return {
        kind: "task_assignment_pickup",
        role: describeRole(input.role),
        workerId: input.workerId,
        mode: normalizeNextMode(input.mode),
        outcome: "error",
        recommendedReason: "assignment_claim_failed",
        assignment,
        task: claimed ?? task,
        brief,
        command: null,
        error: claimed?.error ?? `Unable to claim assigned task ${candidate.id}`
      };
    }

    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "claimed",
      recommendedReason: "claimable_assignment_work",
      assignment,
      candidate: summarizeInboxTask(claimed, input.role, input.workerId),
      task: claimed,
      brief: taskBrief(claimed.id),
      command: `node ./src/index.js task:review --id ${claimed.id} --by ${input.workerId}`
    };
  }

  return {
    kind: "task_assignment_pickup",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: normalizeNextMode(input.mode),
    outcome: assignmentPickupOutcome(candidate.relation),
    recommendedReason: deriveTaskAssignmentPickupReason(candidate.relation),
    assignment,
    candidate,
    task,
    brief,
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function previewTaskAssignment(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = input.taskId
    ? (roleAssignments?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : roleAssignments?.assignments?.[0] ?? null;

  if (!assignment?.taskId) {
    return {
      kind: "task_assignment_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_assignment_preview",
      metadata: {
        hasAssignment: false,
        hasTask: false,
        hasBrief: false,
        taskId: null
      },
      assignment: null,
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const task = getTask(assignment.taskId);
  if (!task) {
    return {
      kind: "task_assignment_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "error",
      recommendedReason: "missing_assignment_task",
      metadata: {
        hasAssignment: true,
        hasTask: false,
        hasBrief: false,
        taskId: assignment.taskId
      },
      assignment,
      candidate: null,
      task: null,
      brief: null,
      command: null,
      error: `Missing task for assignment ${assignment.taskId}`
    };
  }

  const candidate = summarizeInboxTask(task, input.role, input.workerId);
  const brief = taskBrief(task.id);

  return {
    kind: "task_assignment_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: normalizeNextMode(input.mode),
    outcome: candidate.relation === "owner_claimable" ? "claimable" : assignmentPickupOutcome(candidate.relation),
    recommendedReason: deriveTaskAssignmentPreviewReason(candidate.relation),
    metadata: {
      hasAssignment: true,
      hasTask: true,
      hasBrief: Boolean(brief),
      taskId: task.id
    },
    assignment,
    candidate,
    task,
    brief,
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function previewTaskPickup(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  if (!next?.candidate) {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next?.mode ?? normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_pickup_candidate",
      metadata: {
        hasCandidate: false,
        hasTask: false,
        hasBrief: false,
        taskId: null
      },
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const relation = next.candidate.relation;
  const currentTask = getTask(next.candidate.id);

  if (relation === "owner_claimable") {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      outcome: "claimable",
      recommendedReason: "claimable_pickup_preview",
      metadata: {
        hasCandidate: true,
        hasTask: Boolean(currentTask),
        hasBrief: Boolean(next.brief),
        taskId: next.candidate.id
      },
      candidate: next.candidate,
      task: currentTask,
      brief: next.brief,
      command: `node ./src/index.js task:pickup --role ${input.role} --worker ${input.workerId} --mode ${next.mode}`
    };
  }

  return {
    kind: "task_pickup_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    outcome: pickupOutcome(relation),
    recommendedReason: deriveTaskPickupPreviewReason(relation),
    metadata: {
      hasCandidate: true,
      hasTask: Boolean(currentTask),
      hasBrief: Boolean(next.brief),
      taskId: next.candidate.id
    },
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    command: pickupFollowupCommand(next.candidate, input.workerId)
  };
}

export function workerSession(input = {}) {
  return buildWorkerSessionView(input, {
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
  });
}

export function workerHandoff(input = {}) {
  return buildWorkerHandoffView(input, {
    workerSession,
    deriveWorkerHandoffReason,
    buildWorkerHandoffSummary
  });
}

export function workerCloseout(input = {}) {
  return buildWorkerCloseoutView(input, {
    workerHandoff,
    taskReport,
    deriveWorkerCloseoutReason,
    deriveWorkerCloseoutCommand,
    buildWorkerCloseoutSummary
  });
}

export function verifierBundle(input = {}) {
  return buildVerifierBundleView(input, {
    workerSession,
    workerHandoff,
    taskReport,
    describeRole,
    deriveVerifierBundleReason,
    buildVerifierDecisionCommands,
    buildVerifierBundleSummary
  });
}

export function validateTask(id) {
  const task = loadState().tasks.map(normalizeTask).find((item) => item.id === id);
  if (!task) {
    return null;
  }
  return buildTaskValidationView(task, runtimeRoleCatalog());
}

export function validateSwarm(id) {
  const swarm = loadState().swarms.map(normalizeSwarm).find((item) => item.id === id);
  if (!swarm) {
    return null;
  }
  return buildSwarmValidationView(swarm, runtimeRoleCatalog());
}

export function runtimeRoleCatalog() {
  return {
    agents: listAgentRoleIds()
  };
}

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
  const state = loadState();
  const swarm = state.swarms.find((item) => item.id === id);
  if (!swarm) {
    return null;
  }

  const normalizedSwarm = normalizeSwarm(swarm);
  const swarmTasks = state.tasks
    .map(normalizeTask)
    .filter((task) => task.swarmId === normalizedSwarm.id);
  const overview = buildSwarmOverviewData(normalizedSwarm, swarmTasks, {
    deriveSwarmStatus,
    deriveSwarmOverviewReason
  });

  return {
    kind: "swarm_overview",
    recommendedReason: overview.recommendedReason,
    swarm: normalizedSwarm,
    counts: overview.counts,
    lanes: overview.lanes,
    tasks: overview.tasks,
    nextLane: overview.nextLane,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount
  };
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
  const state = loadState();
  const next = updateLoadedTaskState(state, input, {
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  });
  if (!next) {
    return null;
  }
  if (next.error) {
    return next;
  }
  saveState(state);
  return next;
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
  const state = loadState();
  const next = updateLoadedSwarmState(state, input, {
    findSwarmIndex,
    normalizeSwarm,
    buildUpdatedSwarmState
  });
  if (!next) {
    return null;
  }
  if (next.error) {
    return next;
  }
  saveState(state);
  return next;
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
  const state = loadState();
  const result = queueLoadedSwarmTasks(state, input, {
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane,
    validateSwarmValue,
    runtimeRoleCatalog,
    buildTask,
    buildQueuedSwarmLaneTaskInput,
    buildQueuedSwarmLaneState,
    buildQueuedSwarmState
  });
  if (!result) {
    return null;
  }
  if (result.error) {
    return result;
  }
  saveState(state);
  const recommendedReason = deriveSwarmQueueReason({
    swarm: result.swarm,
    created: result.created
  });
  return {
    kind: "swarm_queue",
    recommendedReason,
    swarm: result.swarm,
    created: result.created
  };
}

export function dispatchSwarmLane(input) {
  const state = loadState();
  const result = dispatchLoadedSwarmLane(state, input, {
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
    syncSwarmInLoadedState
  });
  if (!result) {
    return null;
  }
  if (result.error) {
    return result;
  }
  saveState(state);

  const recommendedReason = deriveSwarmDispatchReason({
    lane: result.lane,
    previousTask: result.previousTask,
    task: result.task
  });
  return {
    kind: "swarm_dispatch",
    recommendedReason,
    swarm: result.swarm,
    lane: result.lane,
    task: result.task
  };
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
  const state = loadState();
  const next = transitionLoadedTaskState(state, input, {
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
  if (!next) {
    return null;
  }
  if (next.error) {
    return next;
  }
  saveState(state);
  return next;
}

function transitionSwarm(input) {
  const state = loadState();
  const next = transitionLoadedSwarmState(state, input, {
    findSwarmIndex,
    normalizeSwarm,
    validateNextSwarmStatus,
    validateSwarmStatusTransition,
    canTransitionSwarm,
    validSwarmStatuses: VALID_SWARM_STATUSES,
    buildTransitionedSwarmState
  });
  if (!next) {
    return null;
  }
  if (next.error) {
    return next;
  }
  saveState(state);
  return next;
}
