import { summarizePlannerProvenance } from "../../planner/provenance.js";
import { buildSwarmOverviewStatusFields } from "../swarm/overview-status-helpers.js";

export function buildPlanningView(provenance) {
  return summarizePlannerProvenance(provenance);
}

export function buildHistoryView(history = [], options = {}) {
  const entries = Array.isArray(history) ? history : [];
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : entries.length;
  const newestFirst = options.newestFirst === true;
  const visibleEntries = newestFirst ? entries.slice(-limit).reverse() : entries.slice(-limit);

  return {
    count: entries.length,
    entries: visibleEntries
  };
}

export function buildTaskDetailMetadata(task, reviewState) {
  const history = Array.isArray(task?.history) ? task.history : [];
  const annotations = Array.isArray(task?.annotations) ? task.annotations : [];

  return {
    hasHistory: history.length > 0,
    hasAnnotations: annotations.length > 0,
    reviewState,
    plannerProvenance: buildPlanningView(task?.plannerProvenance)
  };
}

export function buildSwarmDetailMetadata(swarm, overview = null) {
  const history = Array.isArray(swarm?.history) ? swarm.history : [];

  return {
    ...buildSwarmOverviewStatusFields(overview, {
      includeStatusAligned: true,
      includeReadyToComplete: true,
      includeDispatchableCount: true,
      fallbackDerivedStatus: swarm?.status ?? null
    }),
    hasHistory: history.length > 0,
    historyEntries: history.length,
    plannerProvenance: buildPlanningView(swarm?.plannerProvenance)
  };
}
