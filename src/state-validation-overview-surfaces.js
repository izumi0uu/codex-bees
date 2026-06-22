import {
  syncSwarmStatusFromSources,
  validateSwarmFromSources
} from "./state-swarm-core.js";
import {
  buildSwarmOverviewData,
  buildSwarmOverviewView,
  buildSwarmOverviewViewFromSources,
  deriveSwarmOverviewReason,
  deriveSwarmSyncReason
} from "./state-swarm-views.js";
import { validateTaskFromSources } from "./state-task-core.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import {
  buildSwarmValidationView,
  buildSwarmValidationViewFromSources,
  buildTaskValidationView,
  buildTaskValidationViewFromSources,
  deriveSwarmStatus
} from "./state-rules.js";

export function validateTaskSurface(id, { loadState, normalizeTask }) {
  return validateTaskFromSources(id, {
    loadState,
    normalizeTask,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog,
    buildTaskValidationView
  });
}

export function validateSwarmSurface(id, { loadState, normalizeSwarm }) {
  return validateSwarmFromSources(id, {
    loadState,
    normalizeSwarm,
    buildSwarmValidationViewFromSources,
    runtimeRoleCatalog,
    buildSwarmValidationView
  });
}

export function syncSwarmStatusSurface(
  id,
  {
    loadState,
    saveState,
    syncLoadedSwarmLifecycle,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    buildSyncedSwarmState
  }
) {
  return syncSwarmStatusFromSources(id, {
    loadState,
    saveState,
    syncLoadedSwarmLifecycle,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState,
    deriveSwarmSyncReason
  });
}

export function swarmOverviewSurface(id, { loadState, normalizeSwarm, normalizeTask }) {
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
