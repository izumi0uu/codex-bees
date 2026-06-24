import {
  buildRuntimeTaskIdentityFields,
  buildRuntimeTaskRecommendationFields
} from "./state-runtime-task-entry-helpers.js";
import { buildRecommendedNextFields } from "./state-runtime-recommendation-helpers.js";

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
    ...buildRecommendedNextFields(brief),
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
