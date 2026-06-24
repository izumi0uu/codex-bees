import { filterMemories, filterSwarms, scoreMemory, tokenize } from "./state-query.js";
import {
  getMemoryFromSources,
  listMemoriesFromSources,
  searchMemoriesFromSources
} from "./state-memory-core.js";
import {
  buildMemoryDetailView,
  buildMemoryDetailViewFromSources,
  buildMemoryListView,
  buildMemoryListViewFromSources,
  buildMemorySearchView,
  buildMemorySearchViewFromSources
} from "./state-memory-views.js";
import {
  getSwarmFromSources,
  listSwarmOverviewsFromSources,
  listSwarmsFromSources
} from "./state-swarm-core.js";
import {
  buildSwarmListView,
  buildSwarmListViewFromSources
} from "./state-swarm-views.js";
import {
  buildArchivedSwarmDetailView,
  buildArchivedSwarmListView,
  buildArchivedTaskDetailView,
  buildArchivedTaskListView,
  buildArchivedSwarmDetailViewFromSources,
  buildArchivedSwarmListViewFromSources,
  buildArchivedTaskDetailViewFromSources,
  buildArchivedTaskListViewFromSources
} from "./state-archive-views.js";
import {
  getArchivedSwarmFromSources,
  getArchivedTaskFromSources,
  listArchivedSwarmsFromSources,
  listArchivedTasksFromSources
} from "./state-archive-core.js";
import {
  getTaskFromSources,
  listTasksFromSources
} from "./state-task-core.js";
import {
  buildTaskListViewFromSources
} from "./state-task-views.js";

export function listTasksSurface(sources = {}) {
  return listTasksFromSources(sources);
}

export function listTasksViewSurface(sources = {}) {
  return buildTaskListViewFromSources(sources);
}

export function listMemoriesSurface(filters = {}, sources = {}) {
  return listMemoriesFromSources(filters, {
    ...sources,
    filterMemories
  });
}

export function getMemorySurface(id, sources = {}) {
  return getMemoryFromSources(id, sources);
}

export function listMemoriesViewSurface(filters = {}, sources = {}) {
  return buildMemoryListViewFromSources(filters, sources, {
    buildMemoryListView
  });
}

export function getMemoryViewSurface(id, sources = {}) {
  return buildMemoryDetailViewFromSources(id, sources, {
    buildMemoryDetailView
  });
}

export function listSwarmsSurface(filters = {}, sources = {}) {
  return listSwarmsFromSources(filters, {
    ...sources,
    filterSwarms
  });
}

export function listSwarmOverviewsSurface(filters = {}, sources = {}) {
  return listSwarmOverviewsFromSources(filters, sources);
}

export function listSwarmsViewSurface(filters = {}, options = {}, sources = {}) {
  return buildSwarmListViewFromSources(filters, options, sources, {
    buildSwarmListView
  });
}

export function getTaskSurface(id, sources = {}) {
  return getTaskFromSources(id, sources);
}

export function listArchivedTasksSurface(sources = {}) {
  return listArchivedTasksFromSources(sources);
}

export function getArchivedTaskSurface(id, sources = {}) {
  return getArchivedTaskFromSources(id, sources);
}

export function listArchivedTasksViewSurface(sources = {}) {
  return buildArchivedTaskListViewFromSources(sources, {
    buildArchivedTaskListView
  });
}

export function getArchivedTaskViewSurface(id, sources = {}) {
  return buildArchivedTaskDetailViewFromSources(id, sources, {
    buildArchivedTaskDetailView
  });
}

export function listArchivedSwarmsSurface(sources = {}) {
  return listArchivedSwarmsFromSources(sources);
}

export function getArchivedSwarmSurface(id, sources = {}) {
  return getArchivedSwarmFromSources(id, sources);
}

export function listArchivedSwarmsViewSurface(sources = {}) {
  return buildArchivedSwarmListViewFromSources(sources, {
    buildArchivedSwarmListView
  });
}

export function getArchivedSwarmViewSurface(id, sources = {}) {
  return buildArchivedSwarmDetailViewFromSources(id, sources, {
    buildArchivedSwarmDetailView
  });
}

export function getSwarmSurface(id, sources = {}) {
  return getSwarmFromSources(id, sources);
}

export function searchMemoriesSurface(query, filters = {}, sources = {}) {
  return searchMemoriesFromSources(query, filters, {
    ...sources,
    tokenize,
    scoreMemory
  });
}

export function searchMemoriesViewSurface(query, filters = {}, limit = 10, sources = {}) {
  return buildMemorySearchViewFromSources(query, filters, limit, sources, {
    buildMemorySearchView
  });
}
