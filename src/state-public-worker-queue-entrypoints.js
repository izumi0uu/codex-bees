import {
  previewTaskAssignmentFromSources,
  previewTaskPickupFromSources,
  taskAssignmentPickupFromSources,
  taskInboxFromSources,
  taskNextFromSources,
  taskPickupFromSources
} from "./state-worker-surfaces.js";

export function createStateWorkerQueueEntryPoints(shared, api) {
  const {
    loadState,
    normalizeTask
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

  return {
    taskInbox,
    taskNext,
    taskPickup,
    taskAssignmentPickup,
    previewTaskAssignment,
    previewTaskPickup
  };
}
