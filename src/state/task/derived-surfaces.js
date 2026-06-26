import { getRuntimeCatalog } from "../../catalog.js";
import { deriveTaskHistoryReason } from "../../state-reasons.js";
import { runtimeRoleCatalog } from "../../state-role-catalog.js";
import { validateTaskValue } from "../../state-rules.js";
import { deriveReviewState, describeRoleWithContract } from "./core.js";
import {
  buildTaskBriefViewFromSources,
  buildTaskDetailViewFromSources,
  buildTaskHistoryViewFromSources,
  buildTaskReportEntries,
  buildTaskReportViewFromSources,
  deriveTaskBriefReason,
  deriveTaskReportReason,
  recommendTaskAction,
  taskReportNextGate
} from "./views.js";

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
