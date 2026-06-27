import { getRuntimeCatalog } from "../../catalog.js";
import { runtimeRoleCatalog } from "../role/catalog.js";
import { validateSwarmValue } from "../rules/index.js";
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
} from "./views.js";
import { describeRole } from "../task/core.js";
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
} from "../task/views.js";

export { buildSwarmDetailViewFromSources as getSwarmViewFromSources } from "./views.js";

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
