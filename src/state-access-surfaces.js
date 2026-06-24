import { filterMemories, filterSwarms, scoreMemory, tokenize } from "./state-query.js";
import { listMemoriesFromSources, searchMemoriesFromSources } from "./state-memory-core.js";
import { listSwarmsFromSources } from "./state-swarm-core.js";

export { listTasksFromSources as listTasksSurface } from "./state-task-core.js";
export { buildTaskListViewFromSources as listTasksViewSurface } from "./state-task-views.js";
export { getMemoryFromSources as getMemorySurface } from "./state-memory-core.js";
export { buildMemoryListViewFromSources as listMemoriesViewSurface } from "./state-memory-views.js";
export { buildMemoryDetailViewFromSources as getMemoryViewSurface } from "./state-memory-views.js";
export { listSwarmOverviewsFromSources as listSwarmOverviewsSurface } from "./state-swarm-core.js";
export { buildSwarmListViewFromSources as listSwarmsViewSurface } from "./state-swarm-views.js";
export { getTaskFromSources as getTaskSurface } from "./state-task-core.js";
export { listArchivedTasksFromSources as listArchivedTasksSurface } from "./state-archive-core.js";
export { getArchivedTaskFromSources as getArchivedTaskSurface } from "./state-archive-core.js";
export { buildArchivedTaskListViewFromSources as listArchivedTasksViewSurface } from "./state-archive-views.js";
export { buildArchivedTaskDetailViewFromSources as getArchivedTaskViewSurface } from "./state-archive-views.js";
export { listArchivedSwarmsFromSources as listArchivedSwarmsSurface } from "./state-archive-core.js";
export { getArchivedSwarmFromSources as getArchivedSwarmSurface } from "./state-archive-core.js";
export { buildArchivedSwarmListViewFromSources as listArchivedSwarmsViewSurface } from "./state-archive-views.js";
export { buildArchivedSwarmDetailViewFromSources as getArchivedSwarmViewSurface } from "./state-archive-views.js";
export { getSwarmFromSources as getSwarmSurface } from "./state-swarm-core.js";
export { buildMemorySearchViewFromSources as searchMemoriesViewSurface } from "./state-memory-views.js";

export function listMemoriesSurface(filters = {}, sources = {}) {
  return listMemoriesFromSources(filters, {
    ...sources,
    filterMemories
  });
}

export function listSwarmsSurface(filters = {}, sources = {}) {
  return listSwarmsFromSources(filters, {
    ...sources,
    filterSwarms
  });
}

export function searchMemoriesSurface(query, filters = {}, sources = {}) {
  return searchMemoriesFromSources(query, filters, {
    ...sources,
    tokenize,
    scoreMemory
  });
}
