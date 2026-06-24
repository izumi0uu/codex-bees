import {
  syncSwarmStatusFromSources,
  validateSwarmFromSources
} from "./state-swarm-core.js";
import {
  buildSwarmOverviewData,
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

export function validateTaskSurface(id, sources = {}) {
  return validateTaskFromSources(id, {
    ...sources,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog,
    buildTaskValidationView
  });
}

export function validateSwarmSurface(id, sources = {}) {
  return validateSwarmFromSources(id, {
    ...sources,
    buildSwarmValidationViewFromSources,
    runtimeRoleCatalog,
    buildSwarmValidationView
  });
}

export function syncSwarmStatusSurface(id, sources = {}) {
  return syncSwarmStatusFromSources(id, {
    ...sources,
    deriveSwarmStatus,
    deriveSwarmSyncReason
  });
}

export function swarmOverviewSurface(id, sources = {}) {
  return buildSwarmOverviewViewFromSources(id, {
    ...sources,
    buildSwarmOverviewData,
    deriveSwarmStatus,
    deriveSwarmOverviewReason
  });
}
