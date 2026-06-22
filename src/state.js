import { join } from "node:path";
import { cwd } from "node:process";
import {
  buildTaskHistoryEntry
} from "./state-builders.js";
import {
  defaultState,
  normalizeMemory,
  normalizeState,
  normalizeSwarm,
  normalizeSwarmLane,
  normalizeTask,
  normalizeTaskAnnotation
} from "./state-normalize.js";
import {
  ensureStateFileAtPath,
  loadStateFromFile,
  recoverCorruptStateFile as recoverCorruptStateFileWithPaths,
  saveStateToFile,
  writeStateFile as writeStateFileWithPaths
} from "./state-storage.js";
import {
  buildSyncedSwarmState,
  buildTransitionedSwarmState,
  syncLoadedSwarmLifecycle,
  syncLoadedSwarmState,
  transitionSwarmFromSources
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
  buildTransitionedTaskState,
  buildTaskReviewPatch,
  deriveTaskTransitionContext,
  resolveTaskClaimedBy,
  transitionTaskFromSources
} from "./state-transition-helpers.js";
import {
  appendTaskHistoryEntry
} from "./state-task-core.js";
import {
  VALID_QUEUE_STATUSES,
  VALID_SWARM_STATUSES,
  canTransitionSwarm,
  canTransitionTask,
  deriveSwarmStatus,
  validateTaskValue
} from "./state-rules.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { createStatePublicApi } from "./state-public-entrypoints.js";

const STATE_DIR = join(cwd(), ".codex-bees");
const STATE_FILE = join(STATE_DIR, "state.json");

export function ensureStateFile() {
  return ensureStateFileAtPath({
    stateDir: STATE_DIR,
    stateFile: STATE_FILE,
    defaultState,
    writeStateFile: writeStateFileWithPaths
  });
}

export function loadState() {
  return loadStateFromFile({
    stateDir: STATE_DIR,
    stateFile: STATE_FILE,
    defaultState,
    normalizeState,
    ensureStateFile,
    recoverCorruptStateFile: recoverCorruptStateFileWithPaths
  });
}

export function saveState(state) {
  return saveStateToFile(state, {
    stateDir: STATE_DIR,
    stateFile: STATE_FILE,
    normalizeState,
    ensureStateFile,
    writeStateFile: writeStateFileWithPaths
  });
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

const statePublicApi = createStatePublicApi({
  ensureStateFile,
  loadState,
  saveState,
  normalizeMemory,
  normalizeSwarm,
  normalizeSwarmLane,
  normalizeTask,
  normalizeTaskAnnotation,
  findSwarmIndex,
  findTaskIndex,
  syncLoadedSwarmLifecycle,
  buildSyncedSwarmState,
  syncSwarmInLoadedState,
  transitionTask,
  transitionSwarm
});

const {
  listTasks,
  listTasksView,
  listMemories,
  getMemory,
  listMemoriesView,
  getMemoryView,
  listSwarms,
  listSwarmOverviews,
  listSwarmsView,
  getTask,
  getTaskView,
  taskHistory,
  taskReport,
  annotateTask,
  annotateTaskMutation,
  getSwarm,
  getSwarmView,
  taskBrief,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmBlockers,
  swarmDispatchBundle,
  leaderQueue,
  leaderAssignments,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchPack,
  leaderAssignmentDispatchBundle,
  leaderAssignmentLaunchPlan,
  runtimeDashboard,
  runtimeAlerts,
  runtimeRoles,
  runtimeDispatch,
  runtimeReview,
  runtimeFocus,
  runtimeActivity,
  runtimeHandoffs,
  runtimeCloseout,
  runtimeRecovery,
  runtimeSummaryPack,
  runtimeOperatorPack,
  runtimeDispatchPack,
  runtimeRecoveryPack,
  runtimeCloseoutPack,
  runtimeReviewPack,
  runtimeQueuePack,
  runtimeWorkspacePack,
  runtimeControlPack,
  runtimeSignalPack,
  runtimeHandoffPack,
  runtimeTriagePack,
  runtimeSessionPack,
  runtimeRolePack,
  runtimeExecutionPack,
  runtimePickupPack,
  runtimeAssignmentPack,
  runtimeLeaderPack,
  runtimeOwnerPack,
  runtimeWorkerPack,
  runtimeVerifierPack,
  leaderWorkspace,
  taskInbox,
  taskNext,
  taskPickup,
  taskAssignmentPickup,
  previewTaskAssignment,
  previewTaskPickup,
  workerSession,
  workerHandoff,
  workerCloseout,
  verifierBundle,
  validateTask,
  validateSwarm,
  syncSwarmStatus,
  swarmOverview,
  addTask,
  addTaskLifecycle,
  addTasks,
  storeMemory,
  storeMemoryMutation,
  initSwarm,
  initSwarmMutation,
  searchMemories,
  searchMemoriesView,
  updateTask,
  updateTaskMutation,
  updateSwarm,
  updateSwarmMutation,
  queueSwarmTasks,
  dispatchSwarmLane,
  stateFilePath,
  claimTask,
  claimTaskLifecycle,
  blockTask,
  blockTaskLifecycle,
  markTaskReadyForReview,
  markTaskReadyForReviewLifecycle,
  completeTask,
  completeTaskLifecycle,
  approveTask,
  approveTaskLifecycle,
  rejectTask,
  rejectTaskLifecycle,
  releaseTask,
  releaseTaskLifecycle,
  activateSwarm,
  blockSwarm,
  completeSwarm,
  cancelSwarm,
} = statePublicApi;

export {
  listTasks,
  listTasksView,
  listMemories,
  getMemory,
  listMemoriesView,
  getMemoryView,
  listSwarms,
  listSwarmOverviews,
  listSwarmsView,
  getTask,
  getTaskView,
  taskHistory,
  taskReport,
  annotateTask,
  annotateTaskMutation,
  getSwarm,
  getSwarmView,
  taskBrief,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmBlockers,
  swarmDispatchBundle,
  leaderQueue,
  leaderAssignments,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchPack,
  leaderAssignmentDispatchBundle,
  leaderAssignmentLaunchPlan,
  runtimeDashboard,
  runtimeAlerts,
  runtimeRoles,
  runtimeDispatch,
  runtimeReview,
  runtimeFocus,
  runtimeActivity,
  runtimeHandoffs,
  runtimeCloseout,
  runtimeRecovery,
  runtimeSummaryPack,
  runtimeOperatorPack,
  runtimeDispatchPack,
  runtimeRecoveryPack,
  runtimeCloseoutPack,
  runtimeReviewPack,
  runtimeQueuePack,
  runtimeWorkspacePack,
  runtimeControlPack,
  runtimeSignalPack,
  runtimeHandoffPack,
  runtimeTriagePack,
  runtimeSessionPack,
  runtimeRolePack,
  runtimeExecutionPack,
  runtimePickupPack,
  runtimeAssignmentPack,
  runtimeLeaderPack,
  runtimeOwnerPack,
  runtimeWorkerPack,
  runtimeVerifierPack,
  leaderWorkspace,
  taskInbox,
  taskNext,
  taskPickup,
  taskAssignmentPickup,
  previewTaskAssignment,
  previewTaskPickup,
  workerSession,
  workerHandoff,
  workerCloseout,
  verifierBundle,
  validateTask,
  validateSwarm,
  syncSwarmStatus,
  swarmOverview,
  addTask,
  addTaskLifecycle,
  addTasks,
  storeMemory,
  storeMemoryMutation,
  initSwarm,
  initSwarmMutation,
  searchMemories,
  searchMemoriesView,
  updateTask,
  updateTaskMutation,
  updateSwarm,
  updateSwarmMutation,
  queueSwarmTasks,
  dispatchSwarmLane,
  stateFilePath,
  claimTask,
  claimTaskLifecycle,
  blockTask,
  blockTaskLifecycle,
  markTaskReadyForReview,
  markTaskReadyForReviewLifecycle,
  completeTask,
  completeTaskLifecycle,
  approveTask,
  approveTaskLifecycle,
  rejectTask,
  rejectTaskLifecycle,
  releaseTask,
  releaseTaskLifecycle,
  activateSwarm,
  blockSwarm,
  completeSwarm,
  cancelSwarm,
};

export { runtimeRoleCatalog };
