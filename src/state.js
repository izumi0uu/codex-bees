import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

const STATE_DIR = join(cwd(), ".codex-bees");
const STATE_FILE = join(STATE_DIR, "state.json");
const STATE_VERSION = 3;
const VALID_QUEUE_STATUSES = new Set([
  "queued",
  "claimed",
  "blocked",
  "ready_for_review",
  "released",
  "done"
]);
const VALID_SWARM_STATUSES = new Set([
  "planned",
  "active",
  "blocked",
  "completed",
  "cancelled"
]);

const ALLOWED_QUEUE_TRANSITIONS = {
  queued: new Set(["claimed", "blocked"]),
  claimed: new Set(["blocked", "ready_for_review", "released", "done"]),
  blocked: new Set(["claimed", "released", "done"]),
  ready_for_review: new Set(["claimed", "blocked", "released", "done"]),
  released: new Set(["claimed", "blocked"]),
  done: new Set()
};

const ALLOWED_SWARM_TRANSITIONS = {
  planned: new Set(["active", "blocked", "completed", "cancelled"]),
  active: new Set(["blocked", "completed", "cancelled"]),
  blocked: new Set(["active", "completed", "cancelled"]),
  completed: new Set(),
  cancelled: new Set()
};

function defaultState() {
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

export function ensureStateFile() {
  mkdirSync(STATE_DIR, { recursive: true });
  if (!existsSync(STATE_FILE)) {
    writeStateFile(defaultState());
  }
  return STATE_FILE;
}

export function loadState() {
  ensureStateFile();
  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (error) {
    recoverCorruptStateFile(error);
    return defaultState();
  }
}

export function saveState(state) {
  ensureStateFile();
  const next = normalizeState({
    ...state,
    updatedAt: new Date().toISOString()
  });
  writeStateFile(next);
  return next;
}

export function listTasks() {
  return loadState().tasks;
}

export function listMemories(filters = {}) {
  return filterMemories(loadState().memories, filters);
}

export function listSwarms(filters = {}) {
  return filterSwarms(loadState().swarms, filters);
}

export function getSwarm(id) {
  const swarm = loadState().swarms.find((item) => item.id === id);
  return swarm ? normalizeSwarm(swarm) : null;
}

export function syncSwarmStatus(id) {
  const state = loadState();
  const index = state.swarms.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[index]);
  if (current.status === "cancelled") {
    return { swarm: current, derivedStatus: "cancelled", changed: false };
  }

  const swarmTasks = state.tasks
    .map(normalizeTask)
    .filter((task) => task.swarmId === current.id);
  const derivedStatus = deriveSwarmStatus(current, swarmTasks);
  const next = normalizeSwarm({
    ...current,
    status: derivedStatus,
    updatedAt: new Date().toISOString()
  });

  state.swarms[index] = next;
  saveState(state);
  return { swarm: next, derivedStatus, changed: next.status !== current.status };
}

export function swarmOverview(id) {
  const state = loadState();
  const swarm = state.swarms.find((item) => item.id === id);
  if (!swarm) {
    return null;
  }

  const normalizedSwarm = normalizeSwarm(swarm);
  const swarmTasks = state.tasks
    .map(normalizeTask)
    .filter((task) => task.swarmId === normalizedSwarm.id);

  const laneSummaries = normalizedSwarm.lanes.map((lane) => {
    const task = lane.taskId
      ? swarmTasks.find((item) => item.id === lane.taskId) ?? null
      : swarmTasks.find((item) => item.lane === lane.lane) ?? null;

    return {
      lane: lane.lane,
      summary: lane.summary,
      owner: lane.owner,
      verifier: lane.verifier,
      taskId: lane.taskId,
      queueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      status: task?.status ?? null,
      scope: lane.scope,
      ready: task?.queueStatus === "queued" || task?.queueStatus === "released",
      done: task?.queueStatus === "done"
    };
  });

  const counts = {
    totalLanes: laneSummaries.length,
    queued: laneSummaries.filter((lane) => lane.queueStatus === "queued").length,
    claimed: laneSummaries.filter((lane) => lane.queueStatus === "claimed").length,
    blocked: laneSummaries.filter((lane) => lane.queueStatus === "blocked").length,
    readyForReview: laneSummaries.filter((lane) => lane.queueStatus === "ready_for_review").length,
    released: laneSummaries.filter((lane) => lane.queueStatus === "released").length,
    done: laneSummaries.filter((lane) => lane.queueStatus === "done").length,
    unqueued: laneSummaries.filter((lane) => !lane.taskId).length
  };

  const derivedStatus = deriveSwarmStatus(normalizedSwarm, swarmTasks);
  const nextLane =
    laneSummaries.find((lane) => lane.queueStatus === "queued" || lane.queueStatus === "released") ?? null;

  return {
    swarm: normalizedSwarm,
    counts,
    lanes: laneSummaries,
    tasks: swarmTasks,
    nextLane,
    derivedStatus,
    statusAligned: normalizedSwarm.status === derivedStatus,
    readyToComplete: counts.totalLanes > 0 && counts.done === counts.totalLanes,
    dispatchableCount: counts.queued + counts.released
  };
}

export function addTask(input) {
  const state = loadState();
  const task = buildTask(input, state.nextId);
  state.tasks.push(task);
  state.nextId += 1;
  saveState(state);
  return task;
}

export function addTasks(inputs) {
  const state = loadState();
  const created = [];

  for (const input of inputs) {
    const task = buildTask(input, state.nextId);
    state.tasks.push(task);
    state.nextId += 1;
    created.push(task);
  }

  saveState(state);
  return created;
}

export function storeMemory(input) {
  const state = loadState();
  const memory = buildMemory(input, state.nextMemoryId);
  state.memories.push(memory);
  state.nextMemoryId += 1;
  saveState(state);
  return memory;
}

export function initSwarm(input) {
  const state = loadState();
  const swarm = buildSwarm(input, state.nextSwarmId);
  state.swarms.push(swarm);
  state.nextSwarmId += 1;
  saveState(state);
  return swarm;
}

export function searchMemories(query, filters = {}) {
  const memories = filterMemories(loadState().memories, filters);
  if (!query?.trim()) {
    return memories.map((memory) => ({ ...memory, score: 0 }));
  }

  const tokens = tokenize(query);
  return memories
    .map((memory) => ({
      ...memory,
      score: scoreMemory(memory, tokens)
    }))
    .filter((memory) => memory.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.updatedAt.localeCompare(left.updatedAt);
    });
}

export function updateTask(input) {
  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }
  const current = normalizeTask(state.tasks[index]);
  if (input.queueStatus !== undefined) {
    return { error: "queueStatus must be changed through lifecycle commands" };
  }
  if (input.claimedBy !== undefined) {
    return { error: "claimedBy must be changed through lifecycle commands" };
  }
  const next = {
    ...current,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.verifier !== undefined ? { verifier: input.verifier } : {}),
    ...(input.objective !== undefined ? { objective: input.objective } : {}),
    ...(input.lane !== undefined ? { lane: input.lane } : {}),
    ...(input.swarmId !== undefined ? { swarmId: input.swarmId } : {}),
    ...(input.scope !== undefined ? { scope: input.scope } : {}),
    ...(input.acceptance !== undefined ? { acceptance: input.acceptance } : {}),
    ...(input.verification !== undefined ? { verification: input.verification } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    updatedAt: new Date().toISOString()
  };
  state.tasks[index] = next;
  saveState(state);
  return next;
}

export function updateSwarm(input) {
  const state = loadState();
  const index = state.swarms.findIndex((swarm) => swarm.id === input.id);
  if (index < 0) {
    return null;
  }
  if (input.status !== undefined) {
    return { error: "status must be changed through lifecycle commands" };
  }

  const current = normalizeSwarm(state.swarms[index]);
  const next = normalizeSwarm({
    ...current,
    ...(input.objective !== undefined ? { objective: input.objective } : {}),
    ...(input.topology !== undefined ? { topology: input.topology } : {}),
    ...(input.maxWorkers !== undefined ? { maxWorkers: input.maxWorkers } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.laneSource !== undefined ? { laneSource: input.laneSource } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.lanes !== undefined ? { lanes: input.lanes } : {}),
    updatedAt: new Date().toISOString()
  });

  state.swarms[index] = next;
  saveState(state);
  return next;
}

export function queueSwarmTasks(input) {
  const state = loadState();
  const index = state.swarms.findIndex((swarm) => swarm.id === input.id);
  if (index < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[index]);
  if (!Array.isArray(current.lanes) || current.lanes.length === 0) {
    return { error: `Swarm ${current.id} has no lanes to queue` };
  }
  if (current.lanes.some((lane) => lane.taskId)) {
    return { error: `Swarm ${current.id} already has queued lane tasks` };
  }

  const created = [];
  const nextLanes = [];
  for (const lane of current.lanes) {
    const task = buildTask(
      {
        title: lane.summary,
        status: "todo",
        queueStatus: "queued",
        owner: lane.owner,
        verifier: lane.verifier,
        objective: current.objective,
        lane: lane.lane,
        swarmId: current.id,
        scope: lane.scope,
        acceptance: lane.acceptance,
        verification: lane.verification,
        notes: `Queued from swarm ${current.id}${current.notes ? `: ${current.notes}` : ""}`
      },
      state.nextId
    );
    state.tasks.push(task);
    state.nextId += 1;
    created.push(task);
    nextLanes.push(
      normalizeSwarmLane({
        ...lane,
        taskId: task.id
      })
    );
  }

  const nextStatus = current.status === "planned" ? "active" : current.status;
  const queuedAt = new Date().toISOString();
  const updated = normalizeSwarm({
    ...current,
    status: nextStatus,
    lanes: nextLanes,
    queuedAt,
    updatedAt: queuedAt
  });

  state.swarms[index] = updated;
  saveState(state);
  return {
    swarm: updated,
    created
  };
}

export function dispatchSwarmLane(input) {
  const state = loadState();
  const swarmIndex = state.swarms.findIndex((swarm) => swarm.id === input.id);
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

  const candidateLane = swarm.lanes.find((lane) => {
    if (!lane.taskId) {
      return false;
    }
    const task = state.tasks.map(normalizeTask).find((item) => item.id === lane.taskId);
    if (!task) {
      return false;
    }
    if (input.owner && lane.owner && lane.owner !== input.owner) {
      return false;
    }
    return task.queueStatus === "queued" || task.queueStatus === "released";
  });

  if (!candidateLane) {
    return { error: `No dispatchable lane available for swarm ${swarm.id}` };
  }

  const taskIndex = state.tasks.findIndex((task) => task.id === candidateLane.taskId);
  if (taskIndex < 0) {
    return { error: `Missing task for lane ${candidateLane.lane}` };
  }

  const currentTask = normalizeTask(state.tasks[taskIndex]);
  const nextTask = normalizeTask({
    ...currentTask,
    queueStatus: "claimed",
    claimedBy: input.claimedBy,
    updatedAt: new Date().toISOString()
  });
  state.tasks[taskIndex] = nextTask;

  const nextSwarm = normalizeSwarm({
    ...swarm,
    status: swarm.status === "planned" ? "active" : swarm.status,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    updatedAt: new Date().toISOString()
  });
  state.swarms[swarmIndex] = nextSwarm;

  saveState(state);

  return {
    swarm: nextSwarm,
    lane: normalizeSwarmLane(candidateLane),
    task: nextTask
  };
}

export function stateFilePath() {
  return ensureStateFile();
}

export function claimTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "claimed",
    requireClaimedBy: true
  });
}

export function blockTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "blocked"
  });
}

export function markTaskReadyForReview(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "ready_for_review"
  });
}

export function completeTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "done"
  });
}

export function releaseTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "released"
  });
}

export function activateSwarm(input) {
  return transitionSwarm({
    ...input,
    nextStatus: "active"
  });
}

export function blockSwarm(input) {
  return transitionSwarm({
    ...input,
    nextStatus: "blocked"
  });
}

export function completeSwarm(input) {
  return transitionSwarm({
    ...input,
    nextStatus: "completed"
  });
}

export function cancelSwarm(input) {
  return transitionSwarm({
    ...input,
    nextStatus: "cancelled"
  });
}

function normalizeTask(task) {
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
    acceptance: Array.isArray(task.acceptance) ? task.acceptance : null,
    verification: Array.isArray(task.verification) ? task.verification : null,
    notes: task.notes ?? null
  };
}

function normalizeMemory(memory) {
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

function normalizeSwarmLane(lane, index = 0) {
  return {
    lane: lane.lane ?? `lane-${index + 1}`,
    summary: lane.summary ?? `Lane ${index + 1}`,
    owner: lane.owner ?? null,
    verifier: lane.verifier ?? null,
    scope: Array.isArray(lane.scope) ? lane.scope : null,
    acceptance: Array.isArray(lane.acceptance) ? lane.acceptance : null,
    verification: Array.isArray(lane.verification) ? lane.verification : null,
    taskId: lane.taskId ?? null
  };
}

function normalizeSwarm(swarm) {
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

function normalizeState(state) {
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


function deriveSwarmStatus(swarm, tasks) {
  if (swarm.status === "cancelled") {
    return "cancelled";
  }

  const laneTaskIds = new Set(swarm.lanes.map((lane) => lane.taskId).filter(Boolean));
  const relatedTasks = tasks.filter((task) => laneTaskIds.size === 0 || laneTaskIds.has(task.id));

  if (swarm.lanes.length === 0 || relatedTasks.length === 0) {
    return "planned";
  }

  const allDone = relatedTasks.length === swarm.lanes.length && relatedTasks.every((task) => task.queueStatus === "done");
  if (allDone) {
    return "completed";
  }

  const hasRunnable = relatedTasks.some((task) =>
    ["queued", "released", "claimed", "ready_for_review"].includes(task.queueStatus)
  );
  if (hasRunnable) {
    return "active";
  }

  const hasBlocked = relatedTasks.some((task) => task.queueStatus === "blocked");
  if (hasBlocked) {
    return "blocked";
  }

  return swarm.status === "completed" ? "completed" : "active";
}

function canTransition(from, to) {
  const allowed = ALLOWED_QUEUE_TRANSITIONS[from];
  return allowed ? allowed.has(to) : false;
}

function canTransitionSwarm(from, to) {
  const allowed = ALLOWED_SWARM_TRANSITIONS[from];
  return allowed ? allowed.has(to) : false;
}

function transitionTask(input) {
  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[index]);
  const nextQueueStatus = input.nextQueueStatus;

  if (!VALID_QUEUE_STATUSES.has(nextQueueStatus)) {
    return { error: `Invalid queue status: ${nextQueueStatus}` };
  }

  if (
    current.queueStatus !== nextQueueStatus &&
    !canTransition(current.queueStatus, nextQueueStatus)
  ) {
    return {
      error: `Cannot transition task from ${current.queueStatus} to ${nextQueueStatus}`
    };
  }

  if (input.requireClaimedBy && !input.claimedBy) {
    return { error: "claimedBy is required for this transition" };
  }

  if (current.claimedBy && current.claimedBy !== input.claimedBy) {
    if (nextQueueStatus === "claimed" || input.claimedBy) {
      return { error: `Task already claimed by ${current.claimedBy}` };
    }
  }

  let claimedBy = current.claimedBy;
  if (nextQueueStatus === "claimed") {
    claimedBy = input.claimedBy;
  } else if (nextQueueStatus === "released") {
    claimedBy = null;
  } else if (input.claimedBy && !claimedBy) {
    claimedBy = input.claimedBy;
  }

  const next = normalizeTask({
    ...current,
    queueStatus: nextQueueStatus,
    claimedBy,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    updatedAt: new Date().toISOString()
  });

  state.tasks[index] = next;
  saveState(state);
  return next;
}

function transitionSwarm(input) {
  const state = loadState();
  const index = state.swarms.findIndex((swarm) => swarm.id === input.id);
  if (index < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[index]);
  const nextStatus = input.nextStatus;

  if (!VALID_SWARM_STATUSES.has(nextStatus)) {
    return { error: `Invalid swarm status: ${nextStatus}` };
  }

  if (current.status !== nextStatus && !canTransitionSwarm(current.status, nextStatus)) {
    return {
      error: `Cannot transition swarm from ${current.status} to ${nextStatus}`
    };
  }

  const next = normalizeSwarm({
    ...current,
    status: nextStatus,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    updatedAt: new Date().toISOString()
  });

  state.swarms[index] = next;
  saveState(state);
  return next;
}

function buildTask(input, nextId) {
  return normalizeTask({
    id: `task-${nextId}`,
    title: input.title,
    status: input.status ?? "todo",
    queueStatus: input.queueStatus ?? "queued",
    owner: input.owner ?? null,
    verifier: input.verifier ?? null,
    objective: input.objective ?? null,
    lane: input.lane ?? null,
    swarmId: input.swarmId ?? null,
    scope: input.scope ?? null,
    acceptance: input.acceptance ?? null,
    verification: input.verification ?? null,
    claimedBy: input.claimedBy ?? null,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

function buildMemory(input, nextMemoryId) {
  return normalizeMemory({
    id: `memory-${nextMemoryId}`,
    namespace: input.namespace ?? "default",
    kind: input.kind ?? "note",
    title: input.title ?? null,
    content: input.content,
    agent: input.agent ?? null,
    tags: input.tags ?? [],
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

function buildSwarm(input, nextSwarmId) {
  return normalizeSwarm({
    id: `swarm-${nextSwarmId}`,
    objective: input.objective,
    status: input.status ?? "planned",
    topology: input.topology ?? "bounded-local",
    maxWorkers: input.maxWorkers ?? 1,
    owner: input.owner ?? null,
    laneSource: input.laneSource ?? "manual",
    lanes: input.lanes ?? [],
    queuedAt: input.queuedAt ?? null,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

function filterMemories(memories, filters = {}) {
  return memories.filter((memory) => {
    if (filters.namespace && memory.namespace !== filters.namespace) {
      return false;
    }
    if (filters.kind && memory.kind !== filters.kind) {
      return false;
    }
    if (filters.agent && memory.agent !== filters.agent) {
      return false;
    }
    if (Array.isArray(filters.tags) && filters.tags.length > 0) {
      const tagSet = new Set(memory.tags);
      for (const tag of filters.tags) {
        if (!tagSet.has(tag)) {
          return false;
        }
      }
    }
    return true;
  });
}

function filterSwarms(swarms, filters = {}) {
  return swarms.filter((swarm) => {
    if (filters.status && swarm.status !== filters.status) {
      return false;
    }
    if (filters.topology && swarm.topology !== filters.topology) {
      return false;
    }
    if (filters.owner && swarm.owner !== filters.owner) {
      return false;
    }
    return true;
  });
}

function tokenize(value) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_-]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function scoreMemory(memory, tokens) {
  const haystack = [
    memory.title ?? "",
    memory.content ?? "",
    memory.namespace ?? "",
    memory.kind ?? "",
    memory.agent ?? "",
    ...(memory.tags ?? [])
  ]
    .join(" \n")
    .toLowerCase();

  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

function writeStateFile(state) {
  mkdirSync(STATE_DIR, { recursive: true });
  const tmpPath = `${STATE_FILE}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(state, null, 2) + "\n", "utf8");
  renameSync(tmpPath, STATE_FILE);
}

function recoverCorruptStateFile(error) {
  try {
    if (existsSync(STATE_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const corruptPath = join(STATE_DIR, `state.corrupt.${timestamp}.json`);
      renameSync(STATE_FILE, corruptPath);
    }
  } catch {
    try {
      unlinkSync(STATE_FILE);
    } catch {
      // ignore cleanup failures; caller will rewrite a clean file on next save
    }
  }
  writeStateFile(defaultState());
  console.warn(`[codex-bees] recovered corrupt state file: ${error.message}`);
}
