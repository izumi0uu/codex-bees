import {
  filterMemories,
  filterSwarms,
  scoreMemory,
  tokenize
} from "./state-query.js";
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
  getTaskFromSources,
  listTasksFromSources
} from "./state-task-core.js";
import {
  buildTaskListView,
  buildTaskListViewFromSources
} from "./state-task-views.js";

export function listTasksSurface({ loadState, normalizeTask }) {
  return listTasksFromSources({
    loadState,
    normalizeTask
  });
}

export function listTasksViewSurface({ listTasks }) {
  return buildTaskListViewFromSources(
    {
      listTasks
    },
    {
      buildTaskListView
    }
  );
}

export function listMemoriesSurface(filters = {}, { loadState }) {
  return listMemoriesFromSources(filters, {
    loadState,
    filterMemories
  });
}

export function getMemorySurface(id, { loadState, normalizeMemory }) {
  return getMemoryFromSources(id, {
    loadState,
    normalizeMemory
  });
}

export function listMemoriesViewSurface(filters = {}, { listMemories }) {
  return buildMemoryListViewFromSources(
    filters,
    {
      listMemories
    },
    {
      buildMemoryListView
    }
  );
}

export function getMemoryViewSurface(id, { getMemory }) {
  return buildMemoryDetailViewFromSources(
    id,
    {
      getMemory
    },
    {
      buildMemoryDetailView
    }
  );
}

export function listSwarmsSurface(filters = {}, { loadState }) {
  return listSwarmsFromSources(filters, {
    loadState,
    filterSwarms
  });
}

export function listSwarmOverviewsSurface(filters = {}, { listSwarms, swarmOverview }) {
  return listSwarmOverviewsFromSources(filters, {
    listSwarms,
    swarmOverview
  });
}

export function listSwarmsViewSurface(filters = {}, options = {}, { listSwarms, listSwarmOverviews }) {
  return buildSwarmListViewFromSources(
    filters,
    options,
    {
      listSwarms,
      listSwarmOverviews
    },
    {
      buildSwarmListView
    }
  );
}

export function getTaskSurface(id, { loadState, normalizeTask }) {
  return getTaskFromSources(id, {
    loadState,
    normalizeTask
  });
}

export function getSwarmSurface(id, { loadState, normalizeSwarm }) {
  return getSwarmFromSources(id, {
    loadState,
    normalizeSwarm
  });
}

export function searchMemoriesSurface(query, filters = {}, { listMemories }) {
  return searchMemoriesFromSources(query, filters, {
    listMemories,
    tokenize,
    scoreMemory
  });
}

export function searchMemoriesViewSurface(query, filters = {}, limit = 10, { searchMemories }) {
  return buildMemorySearchViewFromSources(
    query,
    filters,
    limit,
    {
      searchMemories
    },
    {
      buildMemorySearchView
    }
  );
}
