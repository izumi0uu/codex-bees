import { createCollectionView } from "./state-view-helpers.js";

export function buildSwarmListView(filters = {}, options = {}, { listSwarms, listSwarmOverviews }) {
  const detailed = options.detailed === true;
  const swarms = detailed ? listSwarmOverviews(filters) : listSwarms(filters);
  return createCollectionView("swarm_view", "swarms", swarms, {
    loadedReason: "swarm_list_has_results",
    emptyReason: "swarm_list_empty",
    counts: {
      totalSwarms: swarms.length
    },
    extra: {
      detailed
    }
  });
}

export function buildSwarmListViewFromSources(filters = {}, options = {}, sources) {
  return buildSwarmListView(filters, options, sources);
}
