export function buildRuntimeActivityView(
  input,
  {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief,
    swarmBrief,
    buildRuntimeActivityEntry,
    compareRuntimeActivityEntries,
    deriveRuntimeActivityReason,
    buildRuntimeActivitySummary
  }
) {
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const state = loadState();
  const taskBriefCache = new Map();
  const swarmBriefCache = new Map();
  const cachedTaskBrief = (id) => {
    if (!taskBriefCache.has(id)) {
      taskBriefCache.set(id, taskBrief(id));
    }
    return taskBriefCache.get(id);
  };
  const cachedSwarmBrief = (id) => {
    if (!swarmBriefCache.has(id)) {
      swarmBriefCache.set(id, swarmBrief(id));
    }
    return swarmBriefCache.get(id);
  };

  const taskEntries = state.tasks
    .map(normalizeTask)
    .flatMap((task) =>
      (task.history ?? []).map((event) =>
        buildRuntimeActivityEntry(task, event, {
          taskBrief: cachedTaskBrief,
          swarmBrief: cachedSwarmBrief
        })
      )
    );
  const swarmEntries = state.swarms
    .map(normalizeSwarm)
    .flatMap((swarm) =>
      (swarm.history ?? []).map((event) =>
        buildRuntimeActivityEntry(
          {
            entityType: "swarm",
            ...swarm
          },
          event,
          {
            taskBrief: cachedTaskBrief,
            swarmBrief: cachedSwarmBrief
          }
        )
      )
    );
  const entries = [...taskEntries, ...swarmEntries]
    .sort(compareRuntimeActivityEntries)
    .slice(0, limit);
  const next = entries[0] ?? null;
  const recommendedReason = deriveRuntimeActivityReason({ entries, next });

  return {
    kind: "runtime_activity",
    recommendedReason,
    counts: {
      totalEntries: entries.length,
      taskEvents: entries.filter((entry) => entry.entityType === "task").length,
      swarmEvents: entries.filter((entry) => entry.entityType === "swarm").length,
      blockedEvents: entries.filter((entry) => entry.type === "blocked").length,
      reviewEvents: entries.filter((entry) => ["ready_for_review", "approved", "changes_requested"].includes(entry.type)).length
    },
    entries,
    next,
    summary: buildRuntimeActivitySummary(entries, next)
  };
}

export function buildRuntimeActivityViewFromState(
  input,
  {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief,
    swarmBrief,
    buildRuntimeActivityEntry,
    compareRuntimeActivityEntries
  },
  {
    deriveRuntimeActivityReason,
    buildRuntimeActivitySummary,
    buildRuntimeActivityView
  }
) {
  return buildRuntimeActivityView(
    input,
    {
      loadState,
      normalizeTask,
      normalizeSwarm,
      taskBrief,
      swarmBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries,
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary
    }
  );
}
