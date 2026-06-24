import { buildRecommendedNextFields } from "./state-runtime-recommendation-helpers.js";
import { buildSwarmOverviewStatusFields } from "./state-swarm-overview-status-helpers.js";

export function buildLeaderQueueSummary(items) {
  if (items.length === 0) {
    return "Leader queue has no swarm work items yet.";
  }

  const next = items[0];
  return `Leader queue is prioritized with ${next.swarmId} first for action ${next.recommendedNextAction ?? "observe"}.`;
}

export function deriveLeaderQueueReason({ items, actionable, next }) {
  if ((actionable ?? 0) > 1) {
    return "multiple_queue_items_visible";
  }
  if (next?.swarmId) {
    return "next_queue_item_ready";
  }
  if ((items?.length ?? 0) > 0) {
    return "queue_items_visible";
  }
  return "no_queue_items";
}

export function buildLeaderQueueView(
  input,
  {
    leaderWorkspace
  },
  {
    deriveLeaderQueueReason,
    buildLeaderQueueSummary
  }
) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const items = workspace.swarms.map((swarm, index) => ({
    position: index + 1,
    swarmId: swarm.id,
    objective: swarm.objective,
    status: swarm.status,
    ...buildSwarmOverviewStatusFields(swarm, {
      includeReadyToComplete: true
    }),
    ...buildRecommendedNextFields(swarm),
    summary: swarm.summary
  }));
  const next = items[0] ?? null;
  const actionable = items.filter((item) => !["completed", "cancelled"].includes(item.status)).length;
  const recommendedReason = deriveLeaderQueueReason({ items, actionable, next });

  return {
    kind: "leader_queue",
    recommendedReason,
    filters: workspace.filters,
    counts: {
      total: items.length,
      actionable
    },
    items,
    next,
    summary: buildLeaderQueueSummary(items)
  };
}

export function buildLeaderQueueViewFromSources(input, sources, helpers) {
  return buildLeaderQueueView(input, sources, helpers);
}
