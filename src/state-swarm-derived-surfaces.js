import { getRuntimeCatalog } from "./catalog.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { validateSwarmValue } from "./state-rules.js";
import {
  buildSwarmBlockersSummary,
  buildSwarmBundleSummary,
  buildSwarmCloseoutSummary,
  buildSwarmDispatchBundleSummary,
  deriveSwarmBlockersReason,
  deriveSwarmBriefReason,
  deriveSwarmBundleReason,
  deriveSwarmCloseoutReason,
  deriveSwarmDispatchBundleReason
} from "./state-swarm-views.js";
import { describeRole } from "./state-task-core.js";
import {
  buildSwarmBlockersViewFromSources,
  buildSwarmBriefViewFromSources,
  buildSwarmBundleViewFromSources,
  buildSwarmCloseoutViewFromSources,
  buildSwarmDispatchBundleViewFromSources,
  buildSwarmHandoff,
  deriveSwarmCloseoutCommand,
  recommendLaneAction,
  recommendSwarmAction
} from "./state-task-views.js";

export { buildSwarmDetailViewFromSources as getSwarmViewFromSources } from "./state-swarm-views.js";

export function swarmBriefFromSources(id, sources = {}) {
  return buildSwarmBriefViewFromSources(id, {
    ...sources,
    getRuntimeCatalog,
    validateSwarmValue,
    runtimeRoleCatalog,
    recommendLaneAction,
    recommendSwarmAction,
    describeRole,
    buildSwarmHandoff,
    deriveSwarmBriefReason
  });
}

export function swarmBundleFromSources(id, sources = {}) {
  return buildSwarmBundleViewFromSources(id, {
    ...sources,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  });
}

export function swarmCloseoutFromSources(id, sources = {}) {
  return buildSwarmCloseoutViewFromSources(id, {
    ...sources,
    deriveSwarmCloseoutCommand,
    deriveSwarmCloseoutReason,
    buildSwarmCloseoutSummary
  });
}

export function swarmBlockersFromSources(id, sources = {}) {
  return buildSwarmBlockersViewFromSources(id, {
    ...sources,
    deriveSwarmBlockersReason,
    buildSwarmBlockersSummary
  });
}

export function swarmDispatchBundleFromSources(id, sources = {}) {
  return buildSwarmDispatchBundleViewFromSources(id, {
    ...sources,
    deriveSwarmDispatchBundleReason,
    buildSwarmDispatchBundleSummary
  });
}
