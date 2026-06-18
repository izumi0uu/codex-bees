import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

const STATE_DIR = join(cwd(), ".codex-bees");
const STATE_FILE = join(STATE_DIR, "state.json");
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
    tasks: [],
    updatedAt: null
  };
}

export function ensureStateFile() {
  mkdirSync(STATE_DIR, { recursive: true });
  if (!existsSync(STATE_FILE)) {
    writeFileSync(STATE_FILE, JSON.stringify(defaultState(), null, 2) + "\n", "utf8");
  }
  return STATE_FILE;
}

export function loadState() {
  ensureStateFile();
  const raw = readFileSync(STATE_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.tasks)) {
    return defaultState();
  }
  return {
    ...parsed,
    tasks: parsed.tasks.map(normalizeTask)
  };
}

export function saveState(state) {
  ensureStateFile();
  const next = {
    ...state,
    updatedAt: new Date().toISOString()
  };
  writeFileSync(STATE_FILE, JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

export function listTasks() {
  return loadState().tasks;
}

export function addTask(input) {
  const state = loadState();
  const task = {
    id: `task-${state.tasks.length + 1}`,
    title: input.title,
    status: input.status ?? "todo",
    queueStatus: input.queueStatus ?? "queued",
    owner: input.owner ?? null,
    claimedBy: input.claimedBy ?? null,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.tasks.push(task);
  saveState(state);
  return task;
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
    notes: task.notes ?? null
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
