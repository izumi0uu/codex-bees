import {
  buildRuntimeTaskIdentityFields,
  buildRuntimeTaskRecommendationFields
} from "./state-runtime-task-entry-helpers.js";

export function buildRuntimeActivityEventSummary(entity, event) {
  if (entity.entityType === "swarm") {
    if (event.type === "blocked") {
      return `Swarm ${entity.id} is blocked for ${event.actor ?? entity.owner ?? "unknown"}.`;
    }
    if (event.type === "queued") {
      return `Swarm ${entity.id} queued its lane tasks.`;
    }
    if (event.type === "dispatched") {
      return `Swarm ${entity.id} dispatched ${event.lane ?? "a lane"} to ${event.actor ?? "unknown"}.`;
    }
    if (event.type === "completed") {
      return `Swarm ${entity.id} completed its bounded execution.`;
    }
    if (event.type === "cancelled") {
      return `Swarm ${entity.id} was cancelled.`;
    }
    if (event.type === "activated") {
      return `Swarm ${entity.id} is now active.`;
    }
    if (event.type === "synced") {
      return `Swarm ${entity.id} synced to ${event.toStatus ?? entity.status ?? "unknown"}.`;
    }
    if (event.type === "created") {
      return `Swarm ${entity.id} was created for ${entity.objective}.`;
    }
    if (event.type === "restored") {
      return `Swarm ${entity.id} was restored from archive.`;
    }
    if (event.type === "reopened") {
      return `Swarm ${entity.id} was reopened for active work.`;
    }
    return `Swarm ${entity.id} recorded event ${event.type}.`;
  }

  if (event.type === "blocked") {
    return `Task ${entity.id} was blocked by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "ready_for_review") {
    return `Task ${entity.id} is now waiting on verifier ${entity.verifier ?? "unknown"}.`;
  }
  if (event.type === "approved") {
    return `Task ${entity.id} was approved by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "changes_requested") {
    return `Task ${entity.id} received requested changes from ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "claimed") {
    return `Task ${entity.id} was claimed by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "released") {
    return `Task ${entity.id} was released back to the queue.`;
  }
  if (event.type === "created") {
    return `Task ${entity.id} was created for ${entity.objective ?? "the current objective"}.`;
  }
  if (event.type === "restored") {
    return `Task ${entity.id} was restored from archive.`;
  }
  if (event.type === "reopened") {
    return `Task ${entity.id} was reopened and returned to the queue.`;
  }
  return `Task ${entity.id} recorded event ${event.type}.`;
}

export function buildRuntimeTaskActivityEntry(task, event, taskBrief) {
  const brief = taskBrief(task.id);
  return {
    entityType: "task",
    at: event.at,
    type: event.type,
    objective: task.objective ?? null,
    ...buildRuntimeTaskIdentityFields(task),
    queueStatus: task.queueStatus,
    actor: event.actor,
    fromQueueStatus: event.fromQueueStatus,
    toQueueStatus: event.toQueueStatus,
    fromStatus: null,
    toStatus: null,
    outcome: event.outcome,
    notes: event.notes,
    ...buildRuntimeTaskRecommendationFields(brief),
    summary: buildRuntimeActivityEventSummary(
      {
        entityType: "task",
        ...task
      },
      event
    )
  };
}

export function buildRuntimeSwarmActivityEntry(swarm, event, swarmBrief) {
  const brief = swarmBrief(swarm.id);
  return {
    entityType: "swarm",
    at: event.at,
    type: event.type,
    taskId: event.taskId ?? null,
    title: null,
    owner: swarm.owner,
    verifier: null,
    swarmId: swarm.id,
    objective: swarm.objective,
    lane: event.lane ?? null,
    lanePurpose: null,
    queueStatus: null,
    actor: event.actor ?? null,
    fromQueueStatus: null,
    toQueueStatus: null,
    fromStatus: event.fromStatus ?? null,
    toStatus: event.toStatus ?? null,
    outcome: event.outcome ?? null,
    notes: event.notes ?? null,
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    summary: buildRuntimeActivityEventSummary(
      {
        entityType: "swarm",
        ...swarm
      },
      event
    )
  };
}

export function buildRuntimeActivityEntry(entity, event, helpers) {
  if (entity.entityType === "swarm") {
    return buildRuntimeSwarmActivityEntry(entity, event, helpers.swarmBrief);
  }
  return buildRuntimeTaskActivityEntry(entity, event, helpers.taskBrief);
}

export function compareRuntimeActivityEntries(left, right) {
  const byTime = (right.at ?? "").localeCompare(left.at ?? "");
  if (byTime !== 0) {
    return byTime;
  }

  const leftId = left.taskId ?? left.swarmId ?? "";
  const rightId = right.taskId ?? right.swarmId ?? "";
  return leftId.localeCompare(rightId);
}

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
