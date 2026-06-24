export function listSwarmsFromSources(filters = {}, { loadState, filterSwarms }) {
  return filterSwarms(loadState().swarms, filters);
}

export function getSwarmFromSources(id, { loadState, normalizeSwarm }) {
  const swarm = loadState().swarms.find((item) => item.id === id);
  return swarm ? normalizeSwarm(swarm) : null;
}

export function listSwarmOverviewsFromSources(filters = {}, { listSwarms, swarmOverview }) {
  return listSwarms(filters)
    .map((swarm) => swarmOverview(swarm.id))
    .filter(Boolean);
}

export function validateSwarmFromSources(
  id,
  {
    loadState,
    normalizeSwarm,
    buildSwarmValidationViewFromSources,
    runtimeRoleCatalog
  }
) {
  const swarm = loadState().swarms.map(normalizeSwarm).find((item) => item.id === id);
  if (!swarm) {
    return null;
  }
  return buildSwarmValidationViewFromSources(
    swarm,
    {
      runtimeRoleCatalog
    }
  );
}
