import {
  getArchivedSwarmSurface,
  getSwarmSurface,
  listArchivedSwarmsSurface,
  listSwarmsSurface
} from "./state-access-surfaces.js";

export function createStateReadSwarmAccessEntryPoints(shared) {
  const {
    loadState,
    normalizeSwarm
  } = shared;

  function listSwarms(filters = {}) {
    return listSwarmsSurface(filters, listSwarmsSources);
  }

  function getSwarm(id) {
    return getSwarmSurface(id, getSwarmSources);
  }

  function listArchivedSwarms() {
    return listArchivedSwarmsSurface(listArchivedSwarmsSources);
  }

  function getArchivedSwarm(id) {
    return getArchivedSwarmSurface(id, getArchivedSwarmSources);
  }

  const listSwarmsSources = {
    loadState
  };
  const getSwarmSources = {
    loadState,
    normalizeSwarm
  };
  const listArchivedSwarmsSources = {
    loadState,
    normalizeSwarm
  };
  const getArchivedSwarmSources = {
    loadState,
    normalizeSwarm
  };

  return {
    listSwarms,
    getSwarm,
    listArchivedSwarms,
    getArchivedSwarm
  };
}
