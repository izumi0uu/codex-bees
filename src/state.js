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
  normalizeTaskAnnotation,
  normalizeTaskHistoryEntry
} from "./state-normalize.js";
import {
  filterMemories,
  filterSwarms,
  scoreMemory,
  tokenize
} from "./state-query.js";
import {
  getMemoryFromSources,
  listMemoriesFromSources,
  searchMemoriesFromSources
} from "./state-memory-core.js";
import {
  buildMemoryDetailView,
  buildMemoryDetailViewFromSources,
  buildMemoryListView,
  buildMemoryListViewFromSources,
  buildMemorySearchView,
  buildMemorySearchViewFromSources
} from "./state-memory-views.js";
import {
  ensureStateFileAtPath,
  loadStateFromFile,
  recoverCorruptStateFile as recoverCorruptStateFileWithPaths,
  saveStateToFile,
  writeStateFile as writeStateFileWithPaths
} from "./state-storage.js";
import {
  buildSyncedSwarmState,
  getSwarmFromSources,
  listSwarmOverviewsFromSources,
  listSwarmsFromSources,
  transitionSwarmFromSources,
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
  buildTransitionedTaskState,
  buildTaskReviewPatch,
  deriveTaskTransitionContext,
  resolveTaskClaimedBy,
  transitionTaskFromSources,
  updateLoadedTaskState,
  transitionLoadedTaskState
} from "./state-transition-helpers.js";
import {
  getTaskFromSources,
  listTasksFromSources,
  appendTaskHistoryEntry
} from "./state-task-core.js";
import {
  buildTaskListView,
  buildTaskListViewFromSources,
} from "./state-task-views.js";
import {
  runtimeActivityFromSources,
  runtimeAlertsFromSources,
  runtimeCloseoutFromSources,
  runtimeDashboardFromSources,
  runtimeDispatchFromSources,
  runtimeFocusFromSources,
  runtimeHandoffsFromSources,
  runtimeRecoveryFromSources,
  runtimeReviewFromSources,
  runtimeRolesFromSources
} from "./state-runtime-overviews.js";
import {
  runtimeAssignmentPackFromSources,
  runtimeCloseoutPackFromSources,
  runtimeControlPackFromSources,
  runtimeDispatchPackFromSources,
  runtimeExecutionPackFromSources,
  runtimeHandoffPackFromSources,
  runtimeLeaderPackFromSources,
  runtimeOperatorPackFromSources,
  runtimeOwnerPackFromSources,
  runtimePickupPackFromSources,
  runtimeQueuePackFromSources,
  runtimeRecoveryPackFromSources,
  runtimeReviewPackFromSources,
  runtimeRolePackFromSources,
  runtimeSessionPackFromSources,
  runtimeSignalPackFromSources,
  runtimeSummaryPackFromSources,
  runtimeTriagePackFromSources,
  runtimeVerifierPackFromSources,
  runtimeWorkerPackFromSources,
  runtimeWorkspacePackFromSources
} from "./state-runtime-packs.js";
import {
  leaderAssignmentsFromSources,
  leaderAssignmentDispatchBundleFromSources,
  leaderAssignmentDispatchFromSources,
  leaderAssignmentDispatchPackFromSources,
  leaderAssignmentLaunchPlanFromSources,
  leaderQueueFromSources,
  leaderWorkspaceFromSources
} from "./state-leader-surfaces.js";
import {
  previewTaskAssignmentFromSources,
  previewTaskPickupFromSources,
  taskAssignmentPickupFromSources,
  taskInboxFromSources,
  taskNextFromSources,
  taskPickupFromSources,
  verifierBundleFromSources,
  workerCloseoutFromSources,
  workerHandoffFromSources,
  workerSessionFromSources
} from "./state-worker-surfaces.js";
import {
  getSwarmViewFromSources,
  getTaskViewFromSources,
  swarmBlockersFromSources,
  swarmBriefFromSources,
  swarmBundleFromSources,
  swarmCloseoutFromSources,
  swarmDispatchBundleFromSources,
  taskBriefFromSources,
  taskHistoryFromSources,
  taskReportFromSources
} from "./state-task-swarm-surfaces.js";
import {
  addTaskMutationOperation,
  addTaskOperation,
  addTasksOperation,
  annotateTaskMutationOperation,
  annotateTaskOperation,
  dispatchSwarmLaneOperation,
  initSwarmMutationOperation,
  initSwarmOperation,
  queueSwarmTasksOperation,
  storeMemoryMutationOperation,
  storeMemoryOperation,
  updateSwarmMutationOperation,
  updateSwarmOperation,
  updateTaskMutationOperation,
  updateTaskOperation
} from "./state-write-operations.js";
import {
  activateSwarmLifecycleView,
  approveTaskLifecycleView,
  approveTaskTransition,
  blockSwarmLifecycleView,
  blockTaskLifecycleView,
  blockTaskTransition,
  cancelSwarmLifecycleView,
  claimTaskLifecycleView,
  claimTaskTransition,
  completeSwarmLifecycleView,
  completeTaskLifecycleView,
  completeTaskTransition,
  markTaskReadyForReviewLifecycleView,
  markTaskReadyForReviewTransition,
  rejectTaskLifecycleView,
  rejectTaskTransition,
  releaseTaskLifecycleView,
  releaseTaskTransition
} from "./state-transition-surfaces.js";
import {
  buildSwarmListView,
  buildSwarmListViewFromSources,
} from "./state-swarm-views.js";
import {
  VALID_QUEUE_STATUSES,
  VALID_SWARM_STATUSES,
  canTransitionSwarm,
  canTransitionTask,
  deriveSwarmStatus,
  validateTaskValue
} from "./state-rules.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import {
  swarmOverviewSurface,
  syncSwarmStatusSurface,
  validateSwarmSurface,
  validateTaskSurface
} from "./state-validation-overview-surfaces.js";

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

export function listTasks() {
  return listTasksFromSources({
    loadState
  });
}

export function listTasksView() {
  return buildTaskListViewFromSources(
    {
      listTasks
    },
    {
      buildTaskListView
    }
  );
}

export function listMemories(filters = {}) {
  return listMemoriesFromSources(filters, {
    loadState,
    filterMemories
  });
}

export function getMemory(id) {
  return getMemoryFromSources(id, {
    loadState,
    normalizeMemory
  });
}

export function listMemoriesView(filters = {}) {
  return buildMemoryListViewFromSources(
    filters,
    {
      listMemories
    },
    {
      buildMemoryListView
    }
  );
}

export function getMemoryView(id) {
  return buildMemoryDetailViewFromSources(
    id,
    {
      getMemory
    },
    {
      buildMemoryDetailView
    }
  );
}

export function listSwarms(filters = {}) {
  return listSwarmsFromSources(filters, {
    loadState,
    filterSwarms
  });
}

export function listSwarmOverviews(filters = {}) {
  return listSwarmOverviewsFromSources(filters, {
    listSwarms,
    swarmOverview
  });
}

export function listSwarmsView(filters = {}, options = {}) {
  return buildSwarmListViewFromSources(
    filters,
    options,
    {
      listSwarms,
      listSwarmOverviews
    },
    {
      buildSwarmListView
    }
  );
}

export function getTask(id) {
  return getTaskFromSources(id, {
    loadState,
    normalizeTask
  });
}

export function getTaskView(id) {
  return getTaskViewFromSources(id, { getTask });
}

export function taskHistory(id) {
  return taskHistoryFromSources(id, { getTask });
}

export function taskReport(id) {
  return taskReportFromSources(id, { getTask, taskBrief });
}

export function annotateTask(input = {}) {
  return annotateTaskOperation(input, {
    loadState,
    saveState,
    normalizeTask
  });
}

export function annotateTaskMutation(input) {
  return annotateTaskMutationOperation(input, { annotateTask });
}

export function getSwarm(id) {
  return getSwarmFromSources(id, {
    loadState,
    normalizeSwarm
  });
}

export function getSwarmView(id) {
  return getSwarmViewFromSources(id, { getSwarm, swarmOverview });
}

export function taskBrief(id) {
  return taskBriefFromSources(id, { getTask });
}

export function swarmBrief(id) {
  return swarmBriefFromSources(id, { swarmOverview });
}

export function swarmBundle(id) {
  return swarmBundleFromSources(id, { swarmOverview, swarmBrief, taskReport });
}

export function swarmCloseout(id) {
  return swarmCloseoutFromSources(id, { swarmOverview, swarmBrief, swarmBundle });
}

export function swarmBlockers(id) {
  return swarmBlockersFromSources(id, { swarmOverview, swarmBrief, taskReport });
}

export function swarmDispatchBundle(id) {
  return swarmDispatchBundleFromSources(id, { swarmOverview, swarmBrief, taskBrief });
}

export function leaderQueue(input = {}) {
  return leaderQueueFromSources(input, {
    leaderWorkspace
  });
}

export function leaderAssignments(input = {}) {
  return leaderAssignmentsFromSources(input, {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  });
}

export function leaderAssignmentDispatch(input = {}) {
  return leaderAssignmentDispatchFromSources(input, {
    leaderAssignments
  });
}

export function leaderAssignmentDispatchPack(input = {}) {
  return leaderAssignmentDispatchPackFromSources(input, {
    leaderAssignments,
    leaderAssignmentDispatch
  });
}

export function leaderAssignmentDispatchBundle(input = {}) {
  return leaderAssignmentDispatchBundleFromSources(input, {
    leaderAssignmentDispatchPack
  });
}

export function leaderAssignmentLaunchPlan(input = {}) {
  return leaderAssignmentLaunchPlanFromSources(input, {
    leaderAssignmentDispatchBundle
  });
}

export function runtimeDashboard() {
  return runtimeDashboardFromSources({
    loadState,
    normalizeTask,
    listSwarmOverviews,
    leaderQueue,
    leaderAssignments
  });
}

export function runtimeAlerts() {
  return runtimeAlertsFromSources({
    runtimeDashboard,
    listSwarmOverviews
  });
}

export function runtimeRoles(input = {}) {
  return runtimeRolesFromSources(input, {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext
  });
}

export function runtimeDispatch() {
  return runtimeDispatchFromSources({
    leaderAssignments
  });
}

export function runtimeReview() {
  return runtimeReviewFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}

export function runtimeFocus() {
  return runtimeFocusFromSources({
    runtimeDashboard,
    runtimeAlerts,
    runtimeReview,
    runtimeDispatch,
    runtimeRoles,
    taskBrief
  });
}

export function runtimeActivity(input = {}) {
  return runtimeActivityFromSources(input, {
    loadState,
    normalizeTask,
    taskBrief
  });
}

export function runtimeHandoffs() {
  return runtimeHandoffsFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}

export function runtimeCloseout() {
  return runtimeCloseoutFromSources({
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  });
}

export function runtimeRecovery() {
  return runtimeRecoveryFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}

export function runtimeSummaryPack(input = {}) {
  return runtimeSummaryPackFromSources(input, {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  });
}

export function runtimeOperatorPack() {
  return runtimeOperatorPackFromSources({
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  });
}

export function runtimeDispatchPack(input = {}) {
  return runtimeDispatchPackFromSources(input, {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  });
}

export function runtimeRecoveryPack() {
  return runtimeRecoveryPackFromSources({
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  });
}

export function runtimeCloseoutPack(input = {}) {
  return runtimeCloseoutPackFromSources(input, {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  });
}

export function runtimeReviewPack(input = {}) {
  return runtimeReviewPackFromSources(input, {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  });
}

export function runtimeQueuePack(input = {}) {
  return runtimeQueuePackFromSources(input, {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  });
}

export function runtimeWorkspacePack(input = {}) {
  return runtimeWorkspacePackFromSources(input, {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeControlPack(input = {}) {
  return runtimeControlPackFromSources(input, {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  });
}

export function runtimeSignalPack(input = {}) {
  return runtimeSignalPackFromSources(input, {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  });
}

export function runtimeHandoffPack() {
  return runtimeHandoffPackFromSources({
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeTriagePack() {
  return runtimeTriagePackFromSources({
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeSessionPack(input = {}) {
  return runtimeSessionPackFromSources(input, {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  });
}

export function runtimeRolePack(input = {}) {
  return runtimeRolePackFromSources(input, {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  });
}

export function runtimeExecutionPack(input = {}) {
  return runtimeExecutionPackFromSources(input, {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  });
}

export function runtimePickupPack(input = {}) {
  return runtimePickupPackFromSources(input, {
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack
  });
}

export function runtimeAssignmentPack(input = {}) {
  return runtimeAssignmentPackFromSources(input, {
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles
  });
}

export function runtimeLeaderPack(input = {}) {
  return runtimeLeaderPackFromSources(input, {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  });
}

export function runtimeOwnerPack(input = {}) {
  return runtimeOwnerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeWorkerPack(input = {}) {
  return runtimeWorkerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeVerifierPack(input = {}) {
  return runtimeVerifierPackFromSources(input, {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  });
}

export function leaderWorkspace(input = {}) {
  return leaderWorkspaceFromSources(input, {
    listSwarmOverviews,
    swarmBrief,
    swarmBundle
  });
}

export function taskInbox(input = {}) {
  return taskInboxFromSources(
    input,
    {
      loadState,
      normalizeTask,
      taskNext
    }
  );
}

export function taskNext(input = {}) {
  return taskNextFromSources(
    input,
    {
      loadState,
      normalizeTask,
      taskBrief
    }
  );
}

export function taskPickup(input = {}) {
  return taskPickupFromSources(
    input,
    {
      taskNext,
      claimTask,
      taskBrief,
      getTask
    }
  );
}

export function taskAssignmentPickup(input = {}) {
  return taskAssignmentPickupFromSources(
    input,
    {
      leaderAssignments,
      getTask,
      taskBrief,
      claimTask
    }
  );
}

export function previewTaskAssignment(input = {}) {
  return previewTaskAssignmentFromSources(
    input,
    {
      leaderAssignments,
      getTask,
      taskBrief
    }
  );
}

export function previewTaskPickup(input = {}) {
  return previewTaskPickupFromSources(
    input,
    {
      taskNext,
      getTask
    }
  );
}

export function workerSession(input = {}) {
  return workerSessionFromSources(
    input,
    {
      loadState,
      normalizeTask,
      taskInbox,
      taskNext,
      taskBrief
    }
  );
}

export function workerHandoff(input = {}) {
  return workerHandoffFromSources(
    input,
    {
      workerSession
    }
  );
}

export function workerCloseout(input = {}) {
  return workerCloseoutFromSources(
    input,
    {
      workerHandoff,
      taskReport
    }
  );
}

export function verifierBundle(input = {}) {
  return verifierBundleFromSources(
    input,
    {
      workerSession,
      workerHandoff,
      taskReport
    }
  );
}

export function validateTask(id) {
  return validateTaskSurface(id, {
    loadState,
    normalizeTask
  });
}

export function validateSwarm(id) {
  return validateSwarmSurface(id, {
    loadState,
    normalizeSwarm
  });
}

export { runtimeRoleCatalog };

export function syncSwarmStatus(id) {
  return syncSwarmStatusSurface(id, {
    loadState,
    saveState,
    syncLoadedSwarmLifecycle,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    buildSyncedSwarmState
  });
}

export function swarmOverview(id) {
  return swarmOverviewSurface(id, {
    loadState,
    normalizeSwarm,
    normalizeTask
  });
}

export function addTask(input) {
  return addTaskOperation(input, { loadState, saveState });
}

export function addTaskLifecycle(input) {
  return addTaskMutationOperation(input, { addTask });
}

export function addTasks(inputs) {
  return addTasksOperation(inputs, { loadState, saveState });
}

export function storeMemory(input) {
  return storeMemoryOperation(input, { loadState, saveState });
}

export function storeMemoryMutation(input) {
  return storeMemoryMutationOperation(input, { storeMemory });
}

export function initSwarm(input) {
  return initSwarmOperation(input, { loadState, saveState });
}

export function initSwarmMutation(input) {
  return initSwarmMutationOperation(input, { initSwarm });
}

export function searchMemories(query, filters = {}) {
  return searchMemoriesFromSources(query, filters, {
    listMemories,
    tokenize,
    scoreMemory
  });
}

export function searchMemoriesView(query, filters = {}, limit = 10) {
  return buildMemorySearchViewFromSources(
    query,
    filters,
    limit,
    {
      searchMemories
    },
    {
      buildMemorySearchView
    }
  );
}

export function updateTask(input) {
  return updateTaskOperation(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  });
}

export function updateTaskMutation(input) {
  return updateTaskMutationOperation(input, { updateTask });
}

export function updateSwarm(input) {
  return updateSwarmOperation(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm
  });
}

export function updateSwarmMutation(input) {
  return updateSwarmMutationOperation(input, { updateSwarm });
}

export function queueSwarmTasks(input) {
  return queueSwarmTasksOperation(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane
  });
}

export function dispatchSwarmLane(input) {
  return dispatchSwarmLaneOperation(input, {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    syncSwarmInLoadedState
  });
}

export function stateFilePath() {
  return ensureStateFile();
}

export function claimTask(input) {
  return claimTaskTransition(input, { transitionTask });
}

export function claimTaskLifecycle(input) {
  return claimTaskLifecycleView(input, { claimTask });
}

export function blockTask(input) {
  return blockTaskTransition(input, { transitionTask });
}

export function blockTaskLifecycle(input) {
  return blockTaskLifecycleView(input, { blockTask });
}

export function markTaskReadyForReview(input) {
  return markTaskReadyForReviewTransition(input, { transitionTask });
}

export function markTaskReadyForReviewLifecycle(input) {
  return markTaskReadyForReviewLifecycleView(input, { markTaskReadyForReview });
}

export function completeTask(input) {
  return completeTaskTransition(input, { transitionTask });
}

export function completeTaskLifecycle(input) {
  return completeTaskLifecycleView(input, { completeTask });
}

export function approveTask(input) {
  return approveTaskTransition(input, { transitionTask });
}

export function approveTaskLifecycle(input) {
  return approveTaskLifecycleView(input, { approveTask });
}

export function rejectTask(input) {
  return rejectTaskTransition(input, { transitionTask });
}

export function rejectTaskLifecycle(input) {
  return rejectTaskLifecycleView(input, { rejectTask });
}

export function releaseTask(input) {
  return releaseTaskTransition(input, { transitionTask });
}

export function releaseTaskLifecycle(input) {
  return releaseTaskLifecycleView(input, { releaseTask });
}

export function activateSwarm(input) {
  return activateSwarmLifecycleView(input, { transitionSwarm });
}

export function blockSwarm(input) {
  return blockSwarmLifecycleView(input, { transitionSwarm });
}

export function completeSwarm(input) {
  return completeSwarmLifecycleView(input, { transitionSwarm });
}

export function cancelSwarm(input) {
  return cancelSwarmLifecycleView(input, { transitionSwarm });
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
