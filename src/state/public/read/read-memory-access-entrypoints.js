import {
  getMemoryFromSources,
  listMemoriesFromSources
} from "../../memory/core.js";

export function createStateReadMemoryAccessEntryPoints(shared) {
  const {
    loadState,
    normalizeMemory
  } = shared;

  function listMemories(filters = {}) {
    return listMemoriesFromSources(filters, listMemoriesSources);
  }

  function getMemory(id) {
    return getMemoryFromSources(id, getMemorySources);
  }

  const listMemoriesSources = {
    loadState,
    normalizeMemory
  };
  const getMemorySources = {
    loadState,
    normalizeMemory
  };

  return {
    listMemories,
    getMemory
  };
}
