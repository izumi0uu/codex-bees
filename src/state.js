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
const STATE_VERSION = 2;
const VALID_QUEUE_STATUSES = new Set([
  "queued",
  "claimed",
  "blocked",
  "ready_for_review",
  "released",
  "done"
]);

const ALLOWED_QUEUE_TRANSITIONS = {
  queued: new Set(["claimed", "blocked"]),
  claimed: new Set(["blocked", "ready_for_review", "released", "done"]),
  blocked: new Set(["claimed", "released", "done"]),
  ready_for_review: new Set(["claimed", "blocked", "released", "done"]),
  released: new Set(["claimed", "blocked"]),
  done: new Set()
};

function defaultState() {
  return {
    version: STATE_VERSION,
    nextId: 1,
    nextMemoryId: 1,
    tasks: [],
    memories: [],
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

function normalizeTask(task) {
  return {
    ...task,
    queueStatus: VALID_QUEUE_STATUSES.has(task.queueStatus) ? task.queueStatus : "queued",
    claimedBy: task.claimedBy ?? null,
    owner: task.owner ?? null,
    verifier: task.verifier ?? null,
    objective: task.objective ?? null,
    lane: task.lane ?? null,
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

function normalizeState(state) {
  if (!state || !Array.isArray(state.tasks)) {
    return defaultState();
  }

  const tasks = state.tasks.map(normalizeTask);
  const memories = Array.isArray(state.memories) ? state.memories.map(normalizeMemory) : [];
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

  const nextId =
    Number.isInteger(state.nextId) && state.nextId > maxTaskNumber
      ? state.nextId
      : maxTaskNumber + 1;
  const nextMemoryId =
    Number.isInteger(state.nextMemoryId) && state.nextMemoryId > maxMemoryNumber
      ? state.nextMemoryId
      : maxMemoryNumber + 1;

  return {
    version: STATE_VERSION,
    nextId,
    nextMemoryId,
    tasks,
    memories,
    updatedAt: state.updatedAt ?? null
  };
}

function canTransition(from, to) {
  const allowed = ALLOWED_QUEUE_TRANSITIONS[from];
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

  if (current.queueStatus !== nextQueueStatus && !canTransition(current.queueStatus, nextQueueStatus)) {
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
