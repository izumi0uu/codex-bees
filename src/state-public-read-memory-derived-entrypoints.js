import {
  getMemoryViewSurface,
  listMemoriesViewSurface,
  searchMemoriesSurface,
  searchMemoriesViewSurface
} from "./state-access-surfaces.js";

export function createStateReadMemoryDerivedEntryPoints(access) {
  const {
    listMemories,
    getMemory
  } = access;

  function listMemoriesView(filters = {}) {
    return listMemoriesViewSurface(filters, listMemoriesViewSources);
  }

  function getMemoryView(id) {
    return getMemoryViewSurface(id, getMemoryViewSources);
  }

  function searchMemories(query, filters = {}) {
    return searchMemoriesSurface(query, filters, searchMemoriesSources);
  }

  function searchMemoriesView(query, filters = {}, limit = 10) {
    return searchMemoriesViewSurface(query, filters, limit, searchMemoriesViewSources);
  }

  const listMemoriesViewSources = {
    listMemories
  };
  const getMemoryViewSources = {
    getMemory
  };
  const searchMemoriesSources = {
    listMemories
  };
  const searchMemoriesViewSources = {
    searchMemories
  };

  return {
    listMemoriesView,
    getMemoryView,
    searchMemories,
    searchMemoriesView
  };
}
