import {
  getMemorySurface,
  listMemoriesSurface
} from "./state-access-surfaces.js";

export function createStateReadMemoryAccessEntryPoints(shared) {
  const {
    loadState,
    normalizeMemory
  } = shared;

  function listMemories(filters = {}) {
    return listMemoriesSurface(filters, listMemoriesSources);
  }

  function getMemory(id) {
    return getMemorySurface(id, getMemorySources);
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
