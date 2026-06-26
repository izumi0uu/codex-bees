import {
  swarmOverviewSurface,
  syncSwarmStatusSurface,
  validateSwarmSurface
} from "../swarm/validation-surfaces.js";
import { validateTaskSurface } from "../task/validation-surface.js";

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
    return validateTaskSurface(id, validateTaskSources);
  }

  function validateSwarm(id) {
    return validateSwarmSurface(id, validateSwarmSources);
  }

  function syncSwarmStatus(id) {
    return syncSwarmStatusSurface(id, syncSwarmStatusSources);
  }

  function swarmOverview(id) {
    return swarmOverviewSurface(id, swarmOverviewSources);
  }

  const validateTaskSources = {
    loadState,
    normalizeTask
  };
  const validateSwarmSources = {
    loadState,
    normalizeSwarm
  };
  const syncSwarmStatusSources = {
    loadState,
    saveState,
    syncLoadedSwarmLifecycle,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    buildSyncedSwarmState
  };
  const swarmOverviewSources = {
    loadState,
    normalizeSwarm,
    normalizeTask
  };

  return {
    validateTask,
    validateSwarm,
    syncSwarmStatus,
    swarmOverview
  };
}
