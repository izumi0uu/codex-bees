import { getRuntimeCatalog } from "./catalog.js";
import { deriveTaskHistoryReason } from "./state-reasons.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { validateSwarmValue, validateTaskValue } from "./state-rules.js";
import {
  buildSwarmBlockersSummary,
  buildSwarmBundleSummary,
  buildSwarmCloseoutSummary,
  buildSwarmDetailViewFromSources,
  buildSwarmDispatchBundleSummary,
  deriveSwarmBlockersReason,
  deriveSwarmBriefReason,
  deriveSwarmBundleReason,
  deriveSwarmCloseoutReason,
  deriveSwarmDispatchBundleReason
} from "./state-swarm-views.js";
import { deriveReviewState, describeRole, describeRoleWithContract } from "./state-task-core.js";
import {
  buildSwarmBlockersView,
  buildSwarmBlockersViewFromSources,
  buildSwarmBriefView,
  buildSwarmBriefViewFromSources,
  buildSwarmBundleView,
  buildSwarmBundleViewFromSources,
  buildSwarmCloseoutView,
  buildSwarmCloseoutViewFromSources,
  buildSwarmDispatchBundleView,
  buildSwarmDispatchBundleViewFromSources,
  buildSwarmHandoff,
  buildTaskBriefViewFromSources,
  buildTaskDetailViewFromSources,
  buildTaskHistoryViewFromSources,
  buildTaskReportEntries,
  buildTaskReportViewFromSources,
  deriveSwarmCloseoutCommand,
  deriveTaskBriefReason,
  deriveTaskReportReason,
  recommendLaneAction,
  recommendSwarmAction,
  recommendTaskAction,
  taskReportNextGate
} from "./state-task-views.js";

export function getTaskViewFromSources(id, sources = {}) {
  return buildTaskDetailViewFromSources(id, {
    ...sources,
    deriveReviewState
  });
}

export function taskHistoryFromSources(id, sources = {}) {
  return buildTaskHistoryViewFromSources(id, {
    ...sources,
    deriveTaskHistoryReason
  });
}

export function taskReportFromSources(id, sources = {}) {
  return buildTaskReportViewFromSources(id, {
    ...sources,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  });
}

export function getSwarmViewFromSources(id, sources = {}) {
  return buildSwarmDetailViewFromSources(id, sources);
}

export function taskBriefFromSources(id, sources = {}) {
  const { listTasks, ...restSources } = sources;

  return buildTaskBriefViewFromSources(id, {
    ...restSources,
    runtimeRoleCatalog,
    validateTaskValue,
    getRuntimeCatalog,
    recommendTaskAction,
    deriveTaskBriefReason,
    describeRole: describeRoleWithContract,
    deriveReviewState,
    dependencyTasks: listTasks()
  });
}

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
  }, {
    buildSwarmBriefView
  });
}

export function swarmBundleFromSources(id, sources = {}) {
  return buildSwarmBundleViewFromSources(id, {
    ...sources,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  }, {
    buildSwarmBundleView
  });
}

export function swarmCloseoutFromSources(id, sources = {}) {
  return buildSwarmCloseoutViewFromSources(id, {
    ...sources,
    deriveSwarmCloseoutCommand,
    deriveSwarmCloseoutReason,
    buildSwarmCloseoutSummary
  }, {
    buildSwarmCloseoutView
  });
}

export function swarmBlockersFromSources(id, sources = {}) {
  return buildSwarmBlockersViewFromSources(id, {
    ...sources,
    deriveSwarmBlockersReason,
    buildSwarmBlockersSummary
  }, {
    buildSwarmBlockersView
  });
}

export function swarmDispatchBundleFromSources(id, sources = {}) {
  return buildSwarmDispatchBundleViewFromSources(id, {
    ...sources,
    deriveSwarmDispatchBundleReason,
    buildSwarmDispatchBundleSummary
  }, {
    buildSwarmDispatchBundleView
  });
}
