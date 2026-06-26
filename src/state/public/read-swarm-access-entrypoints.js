import {
  getArchivedSwarmFromSources,
  listArchivedSwarmsFromSources
} from "../archive/core.js";
import {
  getSwarmFromSources,
  listSwarmsFromSources
} from "../swarm/core.js";

export function createStateReadSwarmAccessEntryPoints(shared) {
  const {
    loadState,
    normalizeSwarm
  } = shared;

  function listSwarms(filters = {}) {
    return listSwarmsFromSources(filters, listSwarmsSources);
  }

  function getSwarm(id) {
    return getSwarmFromSources(id, getSwarmSources);
  }

  function listArchivedSwarms() {
    return listArchivedSwarmsFromSources(listArchivedSwarmsSources);
  }

  function getArchivedSwarm(id) {
    return getArchivedSwarmFromSources(id, getArchivedSwarmSources);
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
