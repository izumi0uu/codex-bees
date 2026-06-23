import {
  swarmOverviewSurface,
  syncSwarmStatusSurface,
  validateSwarmSurface,
  validateTaskSurface
} from "./state-validation-overview-surfaces.js";

export function createStateReadValidationEntryPoints(shared) {
  const {
    loadState,
    saveState,
    normalizeSwarm,
    normalizeTask,
    findSwarmIndex,
    syncLoadedSwarmLifecycle,
    buildSyncedSwarmState
  } = shared;

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

  return {
    validateTask,
    validateSwarm,
    syncSwarmStatus,
    swarmOverview
  };
}
