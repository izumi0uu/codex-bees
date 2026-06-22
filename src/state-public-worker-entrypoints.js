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

export function createStateWorkerEntryPoints(shared, api) {
  const {
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
  } = shared;

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
          taskBrief: api.taskBrief
        }
      );
    }

    function taskPickup(input = {}) {
      return taskPickupFromSources(
        input,
        {
          taskNext,
          claimTask: api.claimTask,
          taskBrief: api.taskBrief,
          getTask: api.getTask
        }
      );
    }

    function taskAssignmentPickup(input = {}) {
      return taskAssignmentPickupFromSources(
        input,
        {
          leaderAssignments: api.leaderAssignments,
          getTask: api.getTask,
          taskBrief: api.taskBrief,
          claimTask: api.claimTask
        }
      );
    }

    function previewTaskAssignment(input = {}) {
      return previewTaskAssignmentFromSources(
        input,
        {
          leaderAssignments: api.leaderAssignments,
          getTask: api.getTask,
          taskBrief: api.taskBrief
        }
      );
    }

    function previewTaskPickup(input = {}) {
      return previewTaskPickupFromSources(
        input,
        {
          taskNext,
          getTask: api.getTask
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
          taskBrief: api.taskBrief
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
          taskReport: api.taskReport
        }
      );
    }

    function verifierBundle(input = {}) {
      return verifierBundleFromSources(
        input,
        {
          workerSession,
          workerHandoff,
          taskReport: api.taskReport
        }
      );
    }

  return {
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
  };
}
