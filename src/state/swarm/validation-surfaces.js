import { runtimeRoleCatalog } from "../../state-role-catalog.js";
import {
  buildSwarmValidationViewFromSources,
  deriveSwarmStatus
} from "../../state-rules.js";
import {
  syncSwarmStatusFromSources,
  validateSwarmFromSources
} from "./core.js";
import {
  buildSwarmOverviewData,
  buildSwarmOverviewViewFromSources,
  deriveSwarmOverviewReason,
  deriveSwarmSyncReason
} from "./views.js";

export function validateSwarmSurface(id, sources = {}) {
  return validateSwarmFromSources(id, {
    ...sources,
    buildSwarmValidationViewFromSources,
    runtimeRoleCatalog
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
