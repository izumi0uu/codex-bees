import {
  previewTaskAssignmentFromSources,
  previewTaskPickupFromSources,
  taskAssignmentPickupFromSources,
  taskInboxFromSources,
  taskNextFromSources,
  taskPickupFromSources
} from "../worker/surfaces.js";

export function createStateWorkerQueueEntryPoints(shared, api) {
  const {
    loadState,
    normalizeTask
  } = shared;

  function taskInbox(input = {}) {
    return taskInboxFromSources(input, taskInboxSources);
  }

  function taskNext(input = {}) {
    return taskNextFromSources(input, taskNextSources);
  }

  function taskPickup(input = {}) {
    return taskPickupFromSources(input, taskPickupSources);
  }

  function taskAssignmentPickup(input = {}) {
    return taskAssignmentPickupFromSources(input, {
      ...taskAssignmentPickupSharedSources,
      leaderAssignments: api.leaderAssignments
    });
  }

  function previewTaskAssignment(input = {}) {
    return previewTaskAssignmentFromSources(input, {
      ...previewTaskAssignmentSharedSources,
      leaderAssignments: api.leaderAssignments
    });
  }

  function previewTaskPickup(input = {}) {
    return previewTaskPickupFromSources(input, previewTaskPickupSources);
  }

  const sharedTaskSources = {
    loadState,
    normalizeTask
  };
  const taskInboxSources = {
    ...sharedTaskSources,
    taskNext
  };
  const taskNextSources = {
    ...sharedTaskSources,
    taskBrief: api.taskBrief
  };
  const taskPickupSources = {
    taskNext,
    claimTask: api.claimTask,
    taskBrief: api.taskBrief,
    getTask: api.getTask
  };
  const taskAssignmentPickupSharedSources = {
    getTask: api.getTask,
    taskBrief: api.taskBrief,
    claimTask: api.claimTask
  };
  const previewTaskAssignmentSharedSources = {
    getTask: api.getTask,
    taskBrief: api.taskBrief
  };
  const previewTaskPickupSources = {
    taskNext,
    getTask: api.getTask
  };

  return {
    taskInbox,
    taskNext,
    taskPickup,
    taskAssignmentPickup,
    previewTaskAssignment,
    previewTaskPickup
  };
}
