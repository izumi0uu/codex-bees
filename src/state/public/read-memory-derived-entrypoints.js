import { searchMemoriesFromSources } from "../memory/core.js";
import {
  buildMemoryDetailViewFromSources,
  buildMemoryListViewFromSources,
  buildMemorySearchViewFromSources
} from "../memory/views.js";

export function createStateReadMemoryDerivedEntryPoints(access) {
  const {
    listMemories,
    getMemory
  } = access;

  function listMemoriesView(filters = {}) {
    return buildMemoryListViewFromSources(filters, listMemoriesViewSources);
  }

  function getMemoryView(id) {
    return buildMemoryDetailViewFromSources(id, getMemoryViewSources);
  }

  function searchMemories(query, filters = {}) {
    return searchMemoriesFromSources(query, filters, searchMemoriesSources);
  }

  function searchMemoriesView(query, filters = {}, limit = 10) {
    return buildMemorySearchViewFromSources(query, filters, limit, searchMemoriesViewSources);
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
