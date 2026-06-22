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
  getMemorySurface,
  getMemoryViewSurface,
  getSwarmSurface,
  getTaskSurface,
  listMemoriesSurface,
  listMemoriesViewSurface,
  listSwarmOverviewsSurface,
  listSwarmsSurface,
  listSwarmsViewSurface,
  listTasksSurface,
  listTasksViewSurface,
  searchMemoriesSurface,
  searchMemoriesViewSurface
} from "./state-access-surfaces.js";
import {
  leaderAssignmentDispatchBundleSurface,
  leaderAssignmentDispatchPackSurface,
  leaderAssignmentDispatchSurface,
  leaderAssignmentLaunchPlanSurface,
  leaderAssignmentsSurface,
  leaderQueueSurface,
  leaderWorkspaceSurface,
  runtimeActivitySurface,
  runtimeAlertsSurface,
  runtimeAssignmentPackSurface,
  runtimeCloseoutSurface,
  runtimeCloseoutPackSurface,
  runtimeControlPackSurface,
  runtimeDashboardSurface,
  runtimeDispatchPackSurface,
  runtimeDispatchSurface,
  runtimeExecutionPackSurface,
  runtimeFocusSurface,
  runtimeHandoffPackSurface,
  runtimeHandoffsSurface,
  runtimeLeaderPackSurface,
  runtimeOperatorPackSurface,
  runtimeOwnerPackSurface,
  runtimePickupPackSurface,
  runtimeQueuePackSurface,
  runtimeRecoveryPackSurface,
  runtimeRecoverySurface,
  runtimeReviewPackSurface,
  runtimeReviewSurface,
  runtimeRolePackSurface,
  runtimeRolesSurface,
  runtimeSessionPackSurface,
  runtimeSignalPackSurface,
  runtimeSummaryPackSurface,
  runtimeTriagePackSurface,
  runtimeVerifierPackSurface,
  runtimeWorkerPackSurface,
  runtimeWorkspacePackSurface
} from "./state-runtime-entry-surfaces.js";
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
  swarmOverviewSurface,
  syncSwarmStatusSurface,
  validateSwarmSurface,
  validateTaskSurface
} from "./state-validation-overview-surfaces.js";

export function createStatePublicApi({
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
}) {
function listTasks() {
    return listTasksSurface({
      loadState
    });
  }

  function listTasksView() {
    return listTasksViewSurface({
      listTasks
    });
  }

  function listMemories(filters = {}) {
    return listMemoriesSurface(filters, {
      loadState,
      normalizeMemory
    });
  }

  function getMemory(id) {
    return getMemorySurface(id, {
      loadState,
      normalizeMemory
    });
  }

  function listMemoriesView(filters = {}) {
    return listMemoriesViewSurface(filters, {
      listMemories
    });
  }

  function getMemoryView(id) {
    return getMemoryViewSurface(id, {
      getMemory
    });
  }

  function listSwarms(filters = {}) {
    return listSwarmsSurface(filters, {
      loadState
    });
  }

  function listSwarmOverviews(filters = {}) {
    return listSwarmOverviewsSurface(filters, {
      listSwarms,
      swarmOverview
    });
  }

  function listSwarmsView(filters = {}, options = {}) {
    return listSwarmsViewSurface(filters, options, {
      listSwarms,
      listSwarmOverviews
    });
  }

  function getTask(id) {
    return getTaskSurface(id, {
      loadState,
      normalizeTask
    });
  }

  function getTaskView(id) {
    return getTaskViewFromSources(id, { getTask });
  }

  function taskHistory(id) {
    return taskHistoryFromSources(id, { getTask });
  }

  function taskReport(id) {
    return taskReportFromSources(id, { getTask, taskBrief });
  }

  function annotateTask(input = {}) {
    return annotateTaskOperation(input, {
      loadState,
      saveState,
      normalizeTask
    });
  }

  function annotateTaskMutation(input) {
    return annotateTaskMutationOperation(input, { annotateTask });
  }

  function getSwarm(id) {
    return getSwarmSurface(id, {
      loadState,
      normalizeSwarm
    });
  }

  function getSwarmView(id) {
    return getSwarmViewFromSources(id, { getSwarm, swarmOverview });
  }

  function taskBrief(id) {
    return taskBriefFromSources(id, { getTask });
  }

  function swarmBrief(id) {
    return swarmBriefFromSources(id, { swarmOverview });
  }

  function swarmBundle(id) {
    return swarmBundleFromSources(id, { swarmOverview, swarmBrief, taskReport });
  }

  function swarmCloseout(id) {
    return swarmCloseoutFromSources(id, { swarmOverview, swarmBrief, swarmBundle });
  }

  function swarmBlockers(id) {
    return swarmBlockersFromSources(id, { swarmOverview, swarmBrief, taskReport });
  }

  function swarmDispatchBundle(id) {
    return swarmDispatchBundleFromSources(id, { swarmOverview, swarmBrief, taskBrief });
  }

  function leaderQueue(input = {}) {
    return leaderQueueSurface(input, {
      leaderWorkspace
    });
  }

  function leaderAssignments(input = {}) {
    return leaderAssignmentsSurface(input, {
      leaderWorkspace,
      swarmBrief,
      taskBrief
    });
  }

  function leaderAssignmentDispatch(input = {}) {
    return leaderAssignmentDispatchSurface(input, {
      leaderAssignments
    });
  }

  function leaderAssignmentDispatchPack(input = {}) {
    return leaderAssignmentDispatchPackSurface(input, {
      leaderAssignments,
      leaderAssignmentDispatch
    });
  }

  function leaderAssignmentDispatchBundle(input = {}) {
    return leaderAssignmentDispatchBundleSurface(input, {
      leaderAssignmentDispatchPack
    });
  }

  function leaderAssignmentLaunchPlan(input = {}) {
    return leaderAssignmentLaunchPlanSurface(input, {
      leaderAssignmentDispatchBundle
    });
  }

  function runtimeDashboard() {
    return runtimeDashboardSurface({
      loadState,
      normalizeTask,
      listSwarmOverviews,
      leaderQueue,
      leaderAssignments
    });
  }

  function runtimeAlerts() {
    return runtimeAlertsSurface({
      runtimeDashboard,
      listSwarmOverviews
    });
  }

  function runtimeRoles(input = {}) {
    return runtimeRolesSurface(input, {
      leaderAssignments,
      loadState,
      normalizeTask,
      taskInbox,
      taskNext
    });
  }

  function runtimeDispatch() {
    return runtimeDispatchSurface({
      leaderAssignments
    });
  }

  function runtimeReview() {
    return runtimeReviewSurface({
      loadState,
      normalizeTask,
      taskBrief
    });
  }

  function runtimeFocus() {
    return runtimeFocusSurface({
      runtimeDashboard,
      runtimeAlerts,
      runtimeReview,
      runtimeDispatch,
      runtimeRoles,
      taskBrief
    });
  }

  function runtimeActivity(input = {}) {
    return runtimeActivitySurface(input, {
      loadState,
      normalizeTask,
      taskBrief
    });
  }

  function runtimeHandoffs() {
    return runtimeHandoffsSurface({
      loadState,
      normalizeTask,
      taskBrief
    });
  }

  function runtimeCloseout() {
    return runtimeCloseoutSurface({
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
    });
  }

  function runtimeRecovery() {
    return runtimeRecoverySurface({
      loadState,
      normalizeTask,
      taskBrief
    });
  }

  function runtimeSummaryPack(input = {}) {
    return runtimeSummaryPackSurface(input, {
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

  function runtimeOperatorPack() {
    return runtimeOperatorPackSurface({
      runtimeDashboard,
      runtimeFocus,
      runtimeAlerts,
      runtimeHandoffs,
      runtimeCloseout
    });
  }

  function runtimeDispatchPack(input = {}) {
    return runtimeDispatchPackSurface(input, {
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeHandoffs
    });
  }

  function runtimeRecoveryPack() {
    return runtimeRecoveryPackSurface({
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
    });
  }

  function runtimeCloseoutPack(input = {}) {
    return runtimeCloseoutPackSurface(input, {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    });
  }

  function runtimeReviewPack(input = {}) {
    return runtimeReviewPackSurface(input, {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack
    });
  }

  function runtimeQueuePack(input = {}) {
    return runtimeQueuePackSurface(input, {
      leaderQueue,
      runtimeDashboard,
      runtimeFocus,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    });
  }

  function runtimeWorkspacePack(input = {}) {
    return runtimeWorkspacePackSurface(input, {
      runtimeDashboard,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeReview,
      runtimeRecovery
    });
  }

  function runtimeControlPack(input = {}) {
    return runtimeControlPackSurface(input, {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    });
  }

  function runtimeSignalPack(input = {}) {
    return runtimeSignalPackSurface(input, {
      runtimeFocus,
      runtimeAlerts,
      runtimeActivity,
      runtimeRoles
    });
  }

  function runtimeHandoffPack() {
    return runtimeHandoffPackSurface({
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    });
  }

  function runtimeTriagePack() {
    return runtimeTriagePackSurface({
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    });
  }

  function runtimeSessionPack(input = {}) {
    return runtimeSessionPackSurface(input, {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles
    });
  }

  function runtimeRolePack(input = {}) {
    return runtimeRolePackSurface(input, {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack
    });
  }

  function runtimeExecutionPack(input = {}) {
    return runtimeExecutionPackSurface(input, {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    });
  }

  function runtimePickupPack(input = {}) {
    return runtimePickupPackSurface(input, {
      workerSession,
      taskNext,
      previewTaskPickup,
      runtimeRolePack
    });
  }

  function runtimeAssignmentPack(input = {}) {
    return runtimeAssignmentPackSurface(input, {
      leaderAssignments,
      workerSession,
      taskNext,
      previewTaskAssignment,
      runtimeRoles
    });
  }

  function runtimeLeaderPack(input = {}) {
    return runtimeLeaderPackSurface(input, {
      leaderWorkspace,
      leaderQueue,
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeCloseout
    });
  }

  function runtimeOwnerPack(input = {}) {
    return runtimeOwnerPackSurface(input, {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext
    });
  }

  function runtimeWorkerPack(input = {}) {
    return runtimeWorkerPackSurface(input, {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext
    });
  }

  function runtimeVerifierPack(input = {}) {
    return runtimeVerifierPackSurface(input, {
      runtimeReview,
      verifierBundle,
      workerCloseout,
      taskNext
    });
  }

  function leaderWorkspace(input = {}) {
    return leaderWorkspaceSurface(input, {
      listSwarmOverviews,
      swarmBrief,
      swarmBundle
    });
  }

  function taskInbox(input = {}) {
    return taskInboxFromSources(
      input,
      {
        loadState,
        normalizeTask,
        taskNext
      }
    );
  }

  function taskNext(input = {}) {
    return taskNextFromSources(
      input,
      {
        loadState,
        normalizeTask,
        taskBrief
      }
    );
  }

  function taskPickup(input = {}) {
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

  function taskAssignmentPickup(input = {}) {
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

  function previewTaskAssignment(input = {}) {
    return previewTaskAssignmentFromSources(
      input,
      {
        leaderAssignments,
        getTask,
        taskBrief
      }
    );
  }

  function previewTaskPickup(input = {}) {
    return previewTaskPickupFromSources(
      input,
      {
        taskNext,
        getTask
      }
    );
  }

  function workerSession(input = {}) {
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

  function workerHandoff(input = {}) {
    return workerHandoffFromSources(
      input,
      {
        workerSession
      }
    );
  }

  function workerCloseout(input = {}) {
    return workerCloseoutFromSources(
      input,
      {
        workerHandoff,
        taskReport
      }
    );
  }

  function verifierBundle(input = {}) {
    return verifierBundleFromSources(
      input,
      {
        workerSession,
        workerHandoff,
        taskReport
      }
    );
  }

  function validateTask(id) {
    return validateTaskSurface(id, {
      loadState,
      normalizeTask
    });
  }

  function validateSwarm(id) {
    return validateSwarmSurface(id, {
      loadState,
      normalizeSwarm
    });
  }

  function syncSwarmStatus(id) {
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

  function swarmOverview(id) {
    return swarmOverviewSurface(id, {
      loadState,
      normalizeSwarm,
      normalizeTask
    });
  }

  function addTask(input) {
    return addTaskOperation(input, { loadState, saveState });
  }

  function addTaskLifecycle(input) {
    return addTaskMutationOperation(input, { addTask });
  }

  function addTasks(inputs) {
    return addTasksOperation(inputs, { loadState, saveState });
  }

  function storeMemory(input) {
    return storeMemoryOperation(input, { loadState, saveState });
  }

  function storeMemoryMutation(input) {
    return storeMemoryMutationOperation(input, { storeMemory });
  }

  function initSwarm(input) {
    return initSwarmOperation(input, { loadState, saveState });
  }

  function initSwarmMutation(input) {
    return initSwarmMutationOperation(input, { initSwarm });
  }

  function searchMemories(query, filters = {}) {
    return searchMemoriesSurface(query, filters, {
      listMemories
    });
  }

  function searchMemoriesView(query, filters = {}, limit = 10) {
    return searchMemoriesViewSurface(query, filters, limit, {
      searchMemories
    });
  }

  function updateTask(input) {
    return updateTaskOperation(input, {
      loadState,
      saveState,
      findTaskIndex,
      normalizeTask
    });
  }

  function updateTaskMutation(input) {
    return updateTaskMutationOperation(input, { updateTask });
  }

  function updateSwarm(input) {
    return updateSwarmOperation(input, {
      loadState,
      saveState,
      findSwarmIndex,
      normalizeSwarm
    });
  }

  function updateSwarmMutation(input) {
    return updateSwarmMutationOperation(input, { updateSwarm });
  }

  function queueSwarmTasks(input) {
    return queueSwarmTasksOperation(input, {
      loadState,
      saveState,
      findSwarmIndex,
      normalizeSwarm,
      normalizeSwarmLane
    });
  }

  function dispatchSwarmLane(input) {
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

  function stateFilePath() {
    return ensureStateFile();
  }

  function claimTask(input) {
    return claimTaskTransition(input, { transitionTask });
  }

  function claimTaskLifecycle(input) {
    return claimTaskLifecycleView(input, { claimTask });
  }

  function blockTask(input) {
    return blockTaskTransition(input, { transitionTask });
  }

  function blockTaskLifecycle(input) {
    return blockTaskLifecycleView(input, { blockTask });
  }

  function markTaskReadyForReview(input) {
    return markTaskReadyForReviewTransition(input, { transitionTask });
  }

  function markTaskReadyForReviewLifecycle(input) {
    return markTaskReadyForReviewLifecycleView(input, { markTaskReadyForReview });
  }

  function completeTask(input) {
    return completeTaskTransition(input, { transitionTask });
  }

  function completeTaskLifecycle(input) {
    return completeTaskLifecycleView(input, { completeTask });
  }

  function approveTask(input) {
    return approveTaskTransition(input, { transitionTask });
  }

  function approveTaskLifecycle(input) {
    return approveTaskLifecycleView(input, { approveTask });
  }

  function rejectTask(input) {
    return rejectTaskTransition(input, { transitionTask });
  }

  function rejectTaskLifecycle(input) {
    return rejectTaskLifecycleView(input, { rejectTask });
  }

  function releaseTask(input) {
    return releaseTaskTransition(input, { transitionTask });
  }

  function releaseTaskLifecycle(input) {
    return releaseTaskLifecycleView(input, { releaseTask });
  }

  function activateSwarm(input) {
    return activateSwarmLifecycleView(input, { transitionSwarm });
  }

  function blockSwarm(input) {
    return blockSwarmLifecycleView(input, { transitionSwarm });
  }

  function completeSwarm(input) {
    return completeSwarmLifecycleView(input, { transitionSwarm });
  }

  function cancelSwarm(input) {
    return cancelSwarmLifecycleView(input, { transitionSwarm });
  }

    return {
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
  }
