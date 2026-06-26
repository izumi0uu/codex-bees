import { buildSwarmHistoryEntry } from "../../state-builders.js";
import { updateSwarmAtIndex } from "./core-read-sync.js";
import { appendSwarmHistoryEntry } from "./history.js";

export function buildQueuedSwarmLaneTaskInput(current, lane) {
  return {
    title: lane.summary,
    status: "todo",
    queueStatus: "queued",
    owner: lane.owner,
    verifier: lane.verifier,
    objective: current.objective,
    lane: lane.lane,
    lanePurpose: lane.purpose ?? null,
    swarmId: current.id,
    plannerProvenance: current.plannerProvenance ?? null,
    scope: lane.scope,
    dependsOn: lane.dependsOn ?? null,
    acceptance: lane.acceptance,
    verification: lane.verification,
    notes: `Queued from swarm ${current.id}${current.notes ? `: ${current.notes}` : ""}`
  };
}

export function buildQueuedSwarmLaneState(lane, task, normalizeSwarmLane) {
  return normalizeSwarmLane({
    ...lane,
    taskId: task.id
  });
}

export function buildQueuedSwarmState(current, nextLanes, created = [], queuedAt = new Date().toISOString()) {
  const nextStatus = current.status === "planned" ? "active" : current.status;
  return {
    ...current,
    status: nextStatus,
    lanes: nextLanes,
    history: appendSwarmHistoryEntry(
      current,
      buildSwarmHistoryEntry(current, nextStatus, {}, {
        type: "queued",
        notes: `Queued ${created.length} lane task${created.length === 1 ? "" : "s"}.`
      })
    ),
    queuedAt,
    updatedAt: queuedAt
  };
}

export function queueLoadedSwarmTasks(
  state,
  input,
  {
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane,
    validateSwarmValue,
    runtimeRoleCatalog,
    buildTask,
    buildQueuedSwarmLaneTaskInput,
    buildQueuedSwarmLaneState,
    buildQueuedSwarmState
  }
) {
  const swarmIndex = findSwarmIndex(state, input.id);
  if (swarmIndex < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (!Array.isArray(current.lanes) || current.lanes.length === 0) {
    return { error: `Swarm ${current.id} has no lanes to queue` };
  }

  const validation = validateSwarmValue(current, runtimeRoleCatalog());
  if (!validation.ready) {
    return { error: `Swarm ${current.id} is not ready to queue`, validation };
  }

  if (current.lanes.some((lane) => lane.taskId)) {
    return { error: `Swarm ${current.id} already has queued lane tasks` };
  }

  const created = [];
  const nextLanes = [];
  for (const lane of current.lanes) {
    const task = buildTask(buildQueuedSwarmLaneTaskInput(current, lane), state.nextId);
    state.tasks.push(task);
    state.nextId += 1;
    created.push(task);
    nextLanes.push(buildQueuedSwarmLaneState(lane, task, normalizeSwarmLane));
  }

  const updated = normalizeSwarm(buildQueuedSwarmState(current, nextLanes, created));
  updateSwarmAtIndex(state.swarms, swarmIndex, updated);

  return {
    swarm: updated,
    created
  };
}

export function buildSwarmQueueMutation(
  result,
  {
    deriveSwarmQueueReason
  }
) {
  const recommendedReason = deriveSwarmQueueReason({
    swarm: result.swarm,
    created: result.created
  });

  return {
    kind: "swarm_queue",
    recommendedReason,
    swarm: result.swarm,
    created: result.created
  };
}

export function queueSwarmTasksFromSources(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane,
    validateSwarmValue,
    runtimeRoleCatalog,
    buildTask,
    buildQueuedSwarmLaneTaskInput,
    buildQueuedSwarmLaneState,
    buildQueuedSwarmState,
    deriveSwarmQueueReason
  }
) {
  const state = loadState();
  const result = queueLoadedSwarmTasks(state, input, {
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane,
    validateSwarmValue,
    runtimeRoleCatalog,
    buildTask,
    buildQueuedSwarmLaneTaskInput,
    buildQueuedSwarmLaneState,
    buildQueuedSwarmState
  });
  if (!result) {
    return null;
  }
  if (result.error) {
    return result;
  }

  saveState(state);
  return buildSwarmQueueMutation(result, {
    deriveSwarmQueueReason
  });
}
