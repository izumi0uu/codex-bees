export const STATE_VERSION = 4;

export function defaultState() {
  return {
    version: STATE_VERSION,
    nextId: 1,
    nextMemoryId: 1,
    nextSwarmId: 1,
    tasks: [],
    memories: [],
    swarms: [],
    archivedTasks: [],
    archivedSwarms: [],
    updatedAt: null
  };
}
