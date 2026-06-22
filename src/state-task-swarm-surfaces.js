import { getRuntimeCatalog } from "./catalog.js";
import { deriveTaskHistoryReason } from "./state-reasons.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { validateSwarmValue, validateTaskValue } from "./state-rules.js";
import {
  buildSwarmBlockersSummary,
  buildSwarmBundleSummary,
  buildSwarmCloseoutSummary,
  buildSwarmDetailView,
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
  buildTaskBriefView,
  buildTaskBriefViewFromSources,
  buildTaskDetailView,
  buildTaskDetailViewFromSources,
  buildTaskHistoryView,
  buildTaskHistoryViewFromSources,
  buildTaskReportEntries,
  buildTaskReportView,
  buildTaskReportViewFromSources,
  deriveSwarmCloseoutCommand,
  deriveTaskBriefReason,
  deriveTaskReportReason,
  recommendLaneAction,
  recommendSwarmAction,
  recommendTaskAction,
  taskReportNextGate
} from "./state-task-views.js";

export function getTaskViewFromSources(id, { getTask }) {
  return buildTaskDetailViewFromSources(
    id,
    {
      getTask,
      deriveReviewState
    },
    {
      buildTaskDetailView
    }
  );
}

export function taskHistoryFromSources(id, { getTask }) {
  return buildTaskHistoryViewFromSources(
    id,
    {
      getTask,
      deriveTaskHistoryReason
    },
    {
      buildTaskHistoryView
    }
  );
}

export function taskReportFromSources(id, { getTask, taskBrief }) {
  return buildTaskReportViewFromSources(
    id,
    {
      getTask,
      taskBrief,
      buildTaskReportEntries,
      deriveTaskReportReason,
      deriveReviewState,
      taskReportNextGate
    },
    {
      buildTaskReportView
    }
  );
}

export function getSwarmViewFromSources(id, { getSwarm, swarmOverview }) {
  return buildSwarmDetailViewFromSources(
    id,
    {
      getSwarm,
      swarmOverview
    },
    {
      buildSwarmDetailView
    }
  );
}

export function taskBriefFromSources(id, { getTask, listTasks }) {
  return buildTaskBriefViewFromSources(
    id,
    {
      getTask,
      runtimeRoleCatalog,
      validateTaskValue,
      getRuntimeCatalog,
      recommendTaskAction,
      deriveTaskBriefReason,
      describeRole: describeRoleWithContract,
      deriveReviewState,
      dependencyTasks: listTasks()
    },
    {
      buildTaskBriefView
    }
  );
}

export function swarmBriefFromSources(id, { swarmOverview }) {
  return buildSwarmBriefViewFromSources(
    id,
    {
      swarmOverview,
      getRuntimeCatalog,
      validateSwarmValue,
      runtimeRoleCatalog,
      recommendLaneAction,
      recommendSwarmAction,
      describeRole,
      buildSwarmHandoff,
      deriveSwarmBriefReason
    },
    {
      buildSwarmBriefView
    }
  );
}

export function swarmBundleFromSources(id, { swarmOverview, swarmBrief, taskReport }) {
  return buildSwarmBundleViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBundleReason,
      buildSwarmBundleSummary
    },
    {
      buildSwarmBundleView
    }
  );
}

export function swarmCloseoutFromSources(id, { swarmOverview, swarmBrief, swarmBundle }) {
  return buildSwarmCloseoutViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      swarmBundle,
      deriveSwarmCloseoutCommand,
      deriveSwarmCloseoutReason,
      buildSwarmCloseoutSummary
    },
    {
      buildSwarmCloseoutView
    }
  );
}

export function swarmBlockersFromSources(id, { swarmOverview, swarmBrief, taskReport }) {
  return buildSwarmBlockersViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBlockersReason,
      buildSwarmBlockersSummary
    },
    {
      buildSwarmBlockersView
    }
  );
}

export function swarmDispatchBundleFromSources(id, { swarmOverview, swarmBrief, taskBrief }) {
  return buildSwarmDispatchBundleViewFromSources(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskBrief,
      deriveSwarmDispatchBundleReason,
      buildSwarmDispatchBundleSummary
    },
    {
      buildSwarmDispatchBundleView
    }
  );
}
