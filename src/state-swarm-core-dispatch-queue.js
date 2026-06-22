import { updateSwarmAtIndex } from "./state-swarm-core-read-sync.js";
import { taskDependenciesReady } from "./state-task-core.js";

export function buildDispatchedSwarmTaskState(currentTask, input, updatedAt = new Date().toISOString()) {
  return {
    ...currentTask,
    queueStatus: "claimed",
    claimedBy: input.claimedBy,
    updatedAt
  };
}

export function buildDispatchedSwarmState(swarm, input, updatedAt = new Date().toISOString()) {
  return {
    ...swarm,
    status: swarm.status === "planned" ? "active" : swarm.status,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    updatedAt
  };
}

export function findDispatchableSwarmLane(swarm, input, tasks, normalizeTask) {
  const normalizedTasks = tasks.map(normalizeTask);
  return (
    swarm.lanes.find((lane) => {
      if (!lane.taskId) {
        return false;
      }
      const task = normalizedTasks.find((item) => item.id === lane.taskId);
      if (!task) {
        return false;
      }
      if (input.owner && lane.owner && lane.owner !== input.owner) {
        return false;
      }
      return (task.queueStatus === "queued" || task.queueStatus === "released") && taskDependenciesReady(task, normalizedTasks);
    }) ?? null
  );
}

export function dispatchLoadedSwarmLane(
  state,
  input,
  {
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    validateTaskValue,
    runtimeRoleCatalog,
    buildDispatchedSwarmTaskState,
    buildDispatchedSwarmState,
    findDispatchableSwarmLane,
    syncSwarmInLoadedState
  }
) {
  const swarmIndex = findSwarmIndex(state, input.id);
  if (swarmIndex < 0) {
    return null;
  }

  const swarm = normalizeSwarm(state.swarms[swarmIndex]);
  if (!input.claimedBy) {
    return { error: "claimedBy is required for swarm dispatch" };
  }
  if (swarm.status === "cancelled" || swarm.status === "completed") {
    return { error: `Cannot dispatch lanes from swarm in status ${swarm.status}` };
  }
  if (!Array.isArray(swarm.lanes) || swarm.lanes.length === 0) {
    return { error: `Swarm ${swarm.id} has no lanes to dispatch` };
  }

  const candidateLane = findDispatchableSwarmLane(swarm, input, state.tasks, normalizeTask);
  if (!candidateLane) {
    return { error: `No dispatchable lane available for swarm ${swarm.id}` };
  }

  const taskIndex = findTaskIndex(state, candidateLane.taskId);
  if (taskIndex < 0) {
    return { error: `Missing task for lane ${candidateLane.lane}` };
  }

  const currentTask = normalizeTask(state.tasks[taskIndex]);
  const taskValidation = validateTaskValue(currentTask, runtimeRoleCatalog(), state.tasks.map(normalizeTask));
  if (!taskValidation.ready) {
    return { error: `Lane task ${currentTask.id} is not ready to dispatch`, validation: taskValidation };
  }

  const nextTask = normalizeTask(buildDispatchedSwarmTaskState(currentTask, input));
  state.tasks[taskIndex] = nextTask;

  const nextSwarm = normalizeSwarm(buildDispatchedSwarmState(swarm, input));
  state.swarms[swarmIndex] = nextSwarm;
  const syncedSwarm = syncSwarmInLoadedState(state, swarm.id) ?? nextSwarm;

  return {
    swarm: syncedSwarm,
    lane: normalizeSwarmLane(candidateLane),
    task: nextTask,
    previousTask: currentTask
  };
}

export function buildQueuedSwarmLaneTaskInput(current, lane) {
  return {
    title: lane.summary,
    status: "todo",
    queueStatus: "queued",
    owner: lane.owner,
    verifier: lane.verifier,
    objective: current.objective,
    lane: lane.lane,
    swarmId: current.id,
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

export function buildQueuedSwarmState(current, nextLanes, queuedAt = new Date().toISOString()) {
  const nextStatus = current.status === "planned" ? "active" : current.status;
  return {
    ...current,
    status: nextStatus,
    lanes: nextLanes,
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

  const updated = normalizeSwarm(buildQueuedSwarmState(current, nextLanes));
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

export function buildSwarmDispatchMutation(
  result,
  {
    deriveSwarmDispatchReason
  }
) {
  const recommendedReason = deriveSwarmDispatchReason({
    lane: result.lane,
    previousTask: result.previousTask,
    task: result.task
  });

  return {
    kind: "swarm_dispatch",
    recommendedReason,
    swarm: result.swarm,
    lane: result.lane,
    task: result.task
  };
}

export function dispatchSwarmLaneFromSources(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    validateTaskValue,
    runtimeRoleCatalog,
    buildDispatchedSwarmTaskState,
    buildDispatchedSwarmState,
    findDispatchableSwarmLane,
    syncSwarmInLoadedState,
    deriveSwarmDispatchReason
  }
) {
  const state = loadState();
  const result = dispatchLoadedSwarmLane(state, input, {
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    validateTaskValue,
    runtimeRoleCatalog,
    buildDispatchedSwarmTaskState,
    buildDispatchedSwarmState,
    findDispatchableSwarmLane,
    syncSwarmInLoadedState
  });
  if (!result) {
    return null;
  }
  if (result.error) {
    return result;
  }

  saveState(state);
  return buildSwarmDispatchMutation(result, {
    deriveSwarmDispatchReason
  });
}
