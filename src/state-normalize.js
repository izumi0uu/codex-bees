import { VALID_QUEUE_STATUSES, VALID_SWARM_STATUSES } from "./state-rules.js";

export const STATE_VERSION = 3;

export function defaultState() {
  return {
    version: STATE_VERSION,
    nextId: 1,
    nextMemoryId: 1,
    nextSwarmId: 1,
    tasks: [],
    memories: [],
    swarms: [],
    updatedAt: null
  };
}

export function normalizeTask(task) {
  return {
    ...task,
    queueStatus: VALID_QUEUE_STATUSES.has(task.queueStatus) ? task.queueStatus : "queued",
    claimedBy: task.claimedBy ?? null,
    owner: task.owner ?? null,
    verifier: task.verifier ?? null,
    objective: task.objective ?? null,
    lane: task.lane ?? null,
    swarmId: task.swarmId ?? null,
    scope: Array.isArray(task.scope) ? task.scope : null,
    dependsOn: Array.isArray(task.dependsOn) ? Array.from(new Set(task.dependsOn.filter(Boolean))) : null,
    acceptance: Array.isArray(task.acceptance) ? task.acceptance : null,
    verification: Array.isArray(task.verification) ? task.verification : null,
    notes: task.notes ?? null,
    reviewedBy: task.reviewedBy ?? null,
    reviewedAt: task.reviewedAt ?? null,
    reviewOutcome: task.reviewOutcome ?? null,
    reviewNotes: task.reviewNotes ?? null,
    reviewEvidence: Array.isArray(task.reviewEvidence) ? task.reviewEvidence : null,
    history: Array.isArray(task.history) ? task.history.map(normalizeTaskHistoryEntry) : [],
    annotations: Array.isArray(task.annotations) ? task.annotations.map(normalizeTaskAnnotation) : []
  };
}

export function normalizeTaskHistoryEntry(entry, index = 0) {
  return {
    id: entry.id ?? `event-${index + 1}`,
    at: entry.at ?? null,
    type: entry.type ?? "updated",
    fromQueueStatus: entry.fromQueueStatus ?? null,
    toQueueStatus: entry.toQueueStatus ?? null,
    actor: entry.actor ?? null,
    notes: entry.notes ?? null,
    evidence: Array.isArray(entry.evidence) ? entry.evidence : [],
    outcome: entry.outcome ?? null
  };
}

export function normalizeTaskAnnotation(annotation, index = 0) {
  return {
    id: annotation.id ?? `annotation-${index + 1}`,
    at: annotation.at ?? null,
    actor: annotation.actor ?? null,
    kind: annotation.kind ?? "note",
    content: annotation.content ?? ""
  };
}

export function normalizeMemory(memory) {
  return {
    ...memory,
    namespace: memory.namespace ?? "default",
    kind: memory.kind ?? "note",
    title: memory.title ?? null,
    content: memory.content ?? "",
    agent: memory.agent ?? null,
    tags: Array.isArray(memory.tags) ? memory.tags : [],
    notes: memory.notes ?? null
  };
}

export function normalizeSwarmLane(lane, index = 0) {
  return {
    lane: lane.lane ?? `lane-${index + 1}`,
    summary: lane.summary ?? `Lane ${index + 1}`,
    owner: lane.owner ?? null,
    verifier: lane.verifier ?? null,
    scope: Array.isArray(lane.scope) ? lane.scope : null,
    dependsOn: Array.isArray(lane.dependsOn) ? Array.from(new Set(lane.dependsOn.filter(Boolean))) : null,
    acceptance: Array.isArray(lane.acceptance) ? lane.acceptance : null,
    verification: Array.isArray(lane.verification) ? lane.verification : null,
    taskId: lane.taskId ?? null
  };
}

export function normalizeSwarm(swarm) {
  return {
    ...swarm,
    status: VALID_SWARM_STATUSES.has(swarm.status) ? swarm.status : "planned",
    topology: swarm.topology ?? "bounded-local",
    maxWorkers:
      Number.isInteger(Number(swarm.maxWorkers)) && Number(swarm.maxWorkers) > 0
        ? Number(swarm.maxWorkers)
        : 1,
    owner: swarm.owner ?? null,
    laneSource: swarm.laneSource ?? "manual",
    lanes: Array.isArray(swarm.lanes)
      ? swarm.lanes.map((lane, index) => normalizeSwarmLane(lane, index))
      : [],
    queuedAt: swarm.queuedAt ?? null,
    notes: swarm.notes ?? null
  };
}

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
    updatedAt: state.updatedAt ?? null
  };
}
