import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

const STATE_DIR = join(cwd(), ".codex-bees");
const STATE_FILE = join(STATE_DIR, "state.json");

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
  return parsed;
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
  const current = state.tasks[index];
  const next = {
    ...current,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.queueStatus !== undefined ? { queueStatus: input.queueStatus } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.claimedBy !== undefined ? { claimedBy: input.claimedBy } : {}),
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
  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }
  const current = state.tasks[index];
  if (current.claimedBy && current.claimedBy !== input.claimedBy) {
    return { error: `Task already claimed by ${current.claimedBy}` };
  }
  const next = {
    ...current,
    claimedBy: input.claimedBy,
    queueStatus: "claimed",
    updatedAt: new Date().toISOString()
  };
  state.tasks[index] = next;
  saveState(state);
  return next;
}

export function releaseTask(input) {
  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }
  const current = state.tasks[index];
  if (current.claimedBy && input.claimedBy && current.claimedBy !== input.claimedBy) {
    return { error: `Task claimed by ${current.claimedBy}, not ${input.claimedBy}` };
  }
  const next = {
    ...current,
    claimedBy: null,
    queueStatus: "queued",
    updatedAt: new Date().toISOString()
  };
  state.tasks[index] = next;
  saveState(state);
  return next;
}
