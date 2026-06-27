import { buildSwarmDetailMetadata } from "../core/view-metadata.js";
import { createLoadedValueView } from "../core/view-helpers.js";

export function buildSwarmDetailView(id, { getSwarm, swarmOverview }) {
  const swarm = getSwarm(id);
  if (!swarm) {
    return null;
  }
  const overview = swarmOverview(id);
  return createLoadedValueView("swarm_detail", "swarm", swarm, {
    recommendedReason: "swarm_detail_loaded",
    extra: {
      metadata: buildSwarmDetailMetadata(swarm, overview)
    }
  });
}

export function buildSwarmDetailViewFromSources(id, sources) {
  return buildSwarmDetailView(id, sources);
}
