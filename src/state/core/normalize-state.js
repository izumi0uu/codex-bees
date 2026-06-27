import { defaultState, STATE_VERSION } from "./normalize-core.js";
import { normalizeMemory } from "../memory/normalize.js";
import { normalizeSwarm } from "../swarm/normalize.js";
import { normalizeTask } from "../task/normalize.js";

export function normalizeState(state) {
  if (!state || !Array.isArray(state.tasks)) {
    return defaultState();
  }

  const tasks = state.tasks.map(normalizeTask);
  const memories = Array.isArray(state.memories) ? state.memories.map(normalizeMemory) : [];
  const swarms = Array.isArray(state.swarms) ? state.swarms.map(normalizeSwarm) : [];
  const maxTaskNumber = tasks.reduce((max, task) => {
    const match = /^task-(\d+)$/.exec(task.id ?? "");
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[1]));
  }, 0);
  const maxMemoryNumber = memories.reduce((max, memory) => {
    const match = /^memory-(\d+)$/.exec(memory.id ?? "");
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[1]));
  }, 0);
  const maxSwarmNumber = swarms.reduce((max, swarm) => {
    const match = /^swarm-(\d+)$/.exec(swarm.id ?? "");
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[1]));
  }, 0);

  const nextId =
    Number.isInteger(state.nextId) && state.nextId > maxTaskNumber
      ? state.nextId
      : maxTaskNumber + 1;
  const nextMemoryId =
    Number.isInteger(state.nextMemoryId) && state.nextMemoryId > maxMemoryNumber
      ? state.nextMemoryId
      : maxMemoryNumber + 1;
  const nextSwarmId =
    Number.isInteger(state.nextSwarmId) && state.nextSwarmId > maxSwarmNumber
      ? state.nextSwarmId
      : maxSwarmNumber + 1;

  return {
    version: STATE_VERSION,
    nextId,
    nextMemoryId,
    nextSwarmId,
    tasks,
    memories,
    swarms,
    archivedTasks: Array.isArray(state.archivedTasks) ? state.archivedTasks.map(normalizeTask) : [],
    archivedSwarms: Array.isArray(state.archivedSwarms) ? state.archivedSwarms.map(normalizeSwarm) : [],
    updatedAt: state.updatedAt ?? null
  };
}
