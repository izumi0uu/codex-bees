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
import { getRuntimeCatalog, listAgentRoleIds } from "./catalog.js";

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
  claimed: new Set(["blocked", "ready_for_review", "released"]),
  blocked: new Set(["claimed", "released"]),
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

export function listSwarmOverviews(filters = {}) {
  return filterSwarms(loadState().swarms, filters)
    .map((swarm) => swarmOverview(swarm.id))
    .filter(Boolean);
}

export function getTask(id) {
  const task = loadState().tasks.find((item) => item.id === id);
  return task ? normalizeTask(task) : null;
}

export function taskHistory(id) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  return {
    kind: "task_history",
    taskId: task.id,
    title: task.title,
    queueStatus: task.queueStatus,
    history: task.history ?? []
  };
}

export function annotateTask(input = {}) {
  if (!input.id) {
    return null;
  }

  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[index]);
  if (!input.content?.trim()) {
    return { error: "content is required for task annotation" };
  }

  const next = normalizeTask({
    ...current,
    annotations: appendTaskAnnotation(current, {
      at: new Date().toISOString(),
      actor: input.actor ?? current.claimedBy ?? null,
      kind: input.kind ?? "note",
      content: input.content.trim()
    }),
    updatedAt: new Date().toISOString()
  });

  state.tasks[index] = next;
  saveState(state);
  return next;
}

export function getSwarm(id) {
  const swarm = loadState().swarms.find((item) => item.id === id);
  return swarm ? normalizeSwarm(swarm) : null;
}

export function taskBrief(id) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const validation = validateTaskValue(task);
  const catalog = getRuntimeCatalog();
  const recommended = recommendTaskAction(task);

  return {
    kind: "task_execution_brief",
    task,
    objective: task.objective ?? task.title,
    roles: {
      owner: describeRole(task.owner, catalog),
      verifier: describeRole(task.verifier, catalog)
    },
    coordination: {
      swarmId: task.swarmId,
      lane: task.lane,
      queueStatus: task.queueStatus,
      claimedBy: task.claimedBy,
      notes: task.notes
    },
    execution: {
      scope: task.scope ?? [],
      acceptance: task.acceptance ?? [],
      verification: task.verification ?? []
    },
    review: {
      state: deriveReviewState(task),
      reviewedBy: task.reviewedBy,
      reviewedAt: task.reviewedAt,
      outcome: task.reviewOutcome,
      notes: task.reviewNotes,
      evidence: task.reviewEvidence ?? []
    },
    history: {
      count: task.history?.length ?? 0,
      entries: task.history ?? []
    },
    annotations: {
      count: task.annotations?.length ?? 0,
      entries: (task.annotations ?? []).slice(-5)
    },
    validation,
    recommendedNextActor: recommended.actor,
    recommendedNextAction: recommended.action,
    recommendedCommands: recommended.commands
  };
}

export function swarmBrief(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const validation = validateSwarmValue(overview.swarm);
  const lanes = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    const recommended = recommendLaneAction(laneSummary, task);

    return {
      lane: laneSummary.lane,
      summary: laneSummary.summary,
      owner: describeRole(laneSummary.owner, catalog),
      verifier: describeRole(laneSummary.verifier, catalog),
      taskId: laneSummary.taskId,
      taskQueueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      scope: laneSummary.scope ?? [],
      acceptance: task?.acceptance ?? [],
      verification: task?.verification ?? [],
      ready: laneSummary.ready,
      done: laneSummary.done,
      recommendedNextActor: recommended.actor,
      recommendedNextAction: recommended.action,
      recommendedCommands: recommended.commands
    };
  });

  const recommended = recommendSwarmAction(overview, lanes);

  return {
    kind: "swarm_execution_brief",
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    owner: describeRole(overview.swarm.owner, catalog),
    lanes,
    nextLane: lanes.find((lane) => lane.lane === overview.nextLane?.lane) ?? null,
    validation,
    leaderHandoff: buildSwarmHandoff(overview, recommended),
    recommendedNextActor: recommended.actor,
    recommendedNextAction: recommended.action,
    recommendedCommands: recommended.commands
  };
}

export function taskInbox(input = {}) {
  if (!input.role) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.owner === input.role || task.verifier === input.role);
  const sorted = sortInboxTasks(tasks, input.role, input.workerId);
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const visibleTasks = sorted.slice(0, limit).map((task) => summarizeInboxTask(task, input.role, input.workerId));
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  return {
    kind: "role_inbox",
    role: describeRole(input.role, catalog),
    workerId: input.workerId ?? null,
    counts: {
      total: tasks.length,
      ownerClaimable: tasks.filter((task) => task.owner === input.role && isClaimableTask(task)).length,
      ownerClaimedByWorker: input.workerId
        ? tasks.filter(
            (task) =>
              task.owner === input.role &&
              task.queueStatus === "claimed" &&
              task.claimedBy === input.workerId
          ).length
        : 0,
      ownerBlocked: tasks.filter((task) => task.owner === input.role && task.queueStatus === "blocked").length,
      pendingReview: tasks.filter((task) => task.verifier === input.role && task.queueStatus === "ready_for_review").length,
      completed: tasks.filter((task) => task.queueStatus === "done").length
    },
    tasks: visibleTasks,
    next
  };
}

export function taskNext(input = {}) {
  if (!input.role) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const tasks = loadState().tasks.map(normalizeTask);
  const candidates = sortNextCandidates(tasks, input.role, input.workerId, mode);
  const selected = candidates[0] ?? null;

  return {
    kind: "next_task_candidate",
    role: describeRole(input.role),
    workerId: input.workerId ?? null,
    mode,
    candidate: selected ? summarizeInboxTask(selected, input.role, input.workerId) : null,
    brief: selected ? taskBrief(selected.id) : null
  };
}

export function taskPickup(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  if (!next?.candidate) {
    return {
      kind: "task_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next?.mode ?? normalizeNextMode(input.mode),
      outcome: "none",
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const relation = next.candidate.relation;
  if (relation === "owner_claimable") {
    const claimed = claimTask({
      id: next.candidate.id,
      claimedBy: input.workerId
    });
    if (!claimed || claimed.error) {
      return {
        kind: "task_pickup",
        role: describeRole(input.role),
        workerId: input.workerId,
        mode: next.mode,
        outcome: "error",
        candidate: next.candidate,
        task: claimed ?? null,
        brief: next.brief,
        command: null,
        error: claimed?.error ?? `Unable to claim task ${next.candidate.id}`
      };
    }

    return {
      kind: "task_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      outcome: "claimed",
      candidate: summarizeInboxTask(claimed, input.role, input.workerId),
      task: claimed,
      brief: taskBrief(claimed.id),
      command: `node ./src/index.js task:review --id ${claimed.id} --by ${input.workerId}`
    };
  }

  const currentTask = getTask(next.candidate.id);
  const command = pickupFollowupCommand(next.candidate, input.workerId);
  return {
    kind: "task_pickup",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    outcome: pickupOutcome(relation),
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    command
  };
}

export function workerSession(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const role = input.role;
  const workerId = input.workerId;
  const mode = normalizeNextMode(input.mode);
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.owner === role || task.verifier === role);

  const activeOwned = tasks
    .filter((task) => task.owner === role && task.claimedBy === workerId && task.queueStatus === "claimed")
    .sort(compareTasksByUpdatedAt);
  const blockedOwned = tasks
    .filter((task) => task.owner === role && task.claimedBy === workerId && task.queueStatus === "blocked")
    .sort(compareTasksByUpdatedAt);
  const handoffsAwaitingReview = tasks
    .filter((task) => task.owner === role && task.claimedBy === workerId && task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt);
  const reviewQueue = tasks
    .filter((task) => task.verifier === role && task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt);

  const inbox = taskInbox({
    role,
    workerId,
    mode,
    limit: input.limit
  });
  const next = taskNext({
    role,
    workerId,
    mode
  });
  const focus = recommendWorkerSessionFocus({
    role,
    workerId,
    mode,
    activeOwned,
    blockedOwned,
    handoffsAwaitingReview,
    reviewQueue,
    next
  });

  return {
    kind: "worker_session",
    role: describeRole(role),
    workerId,
    mode,
    counts: {
      activeOwned: activeOwned.length,
      blockedOwned: blockedOwned.length,
      handoffsAwaitingReview: handoffsAwaitingReview.length,
      reviewQueue: reviewQueue.length
    },
    activeOwned: activeOwned.map((task) => buildSessionTaskSnapshot(task, role, workerId)),
    blockedOwned: blockedOwned.map((task) => buildSessionTaskSnapshot(task, role, workerId)),
    handoffsAwaitingReview: handoffsAwaitingReview.map((task) => buildSessionTaskSnapshot(task, role, workerId)),
    reviewQueue: reviewQueue.map((task) => buildSessionTaskSnapshot(task, role, workerId)),
    inbox,
    next,
    focus
  };
}

export function workerHandoff(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const session = workerSession(input);
  if (!session) {
    return null;
  }

  const focusTaskSnapshot =
    session.activeOwned[0] ??
    session.reviewQueue[0] ??
    session.blockedOwned[0] ??
    session.handoffsAwaitingReview[0] ??
    null;
  const focusBrief = focusTaskSnapshot?.brief ?? session.next?.brief ?? null;

  return {
    kind: "worker_handoff",
    role: session.role,
    workerId: session.workerId,
    mode: session.mode,
    focus: session.focus,
    currentTask: focusTaskSnapshot?.summary ?? null,
    brief: focusBrief,
    recentHistory: focusTaskSnapshot?.recentHistory ?? [],
    recentAnnotations: focusTaskSnapshot?.recentAnnotations ?? [],
    nextCandidate: session.next?.candidate ?? null,
    nextCommand: session.focus?.command ?? null,
    summary: buildWorkerHandoffSummary(session, focusTaskSnapshot)
  };
}

export function validateTask(id) {
  const task = loadState().tasks.map(normalizeTask).find((item) => item.id === id);
  if (!task) {
    return null;
  }
  return validateTaskValue(task);
}

export function validateSwarm(id) {
  const swarm = loadState().swarms.map(normalizeSwarm).find((item) => item.id === id);
  if (!swarm) {
    return null;
  }
  return validateSwarmValue(swarm);
}

export function runtimeRoleCatalog() {
  return {
    agents: listAgentRoleIds()
  };
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
  const validation = validateSwarmValue(current);
  if (!validation.ready) {
    return { error: `Swarm ${current.id} is not ready to queue`, validation };
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
  const taskValidation = validateTaskValue(currentTask);
  if (!taskValidation.ready) {
    return { error: `Lane task ${currentTask.id} is not ready to dispatch`, validation: taskValidation };
  }

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
  const syncedSwarm = syncSwarmInLoadedState(state, swarm.id) ?? nextSwarm;

  saveState(state);

  return {
    swarm: syncedSwarm,
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

export function approveTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: "done"
  });
}

export function rejectTask(input) {
  return transitionTask({
    ...input,
    nextQueueStatus: input.nextQueueStatus ?? "claimed"
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

function normalizeTaskHistoryEntry(entry, index = 0) {
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

function normalizeTaskAnnotation(annotation, index = 0) {
  return {
    id: annotation.id ?? `annotation-${index + 1}`,
    at: annotation.at ?? null,
    actor: annotation.actor ?? null,
    kind: annotation.kind ?? "note",
    content: annotation.content ?? ""
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

function appendTaskHistoryEntry(task, entry) {
  const history = Array.isArray(task.history) ? task.history : [];
  return [
    ...history,
    normalizeTaskHistoryEntry(
      {
        id: `event-${history.length + 1}`,
        ...entry
      },
      history.length
    )
  ];
}

function appendTaskAnnotation(task, annotation) {
  const annotations = Array.isArray(task.annotations) ? task.annotations : [];
  return [
    ...annotations,
    normalizeTaskAnnotation(
      {
        id: `annotation-${annotations.length + 1}`,
        ...annotation
      },
      annotations.length
    )
  ];
}

function describeRole(roleId, catalog = getRuntimeCatalog()) {
  if (!roleId) {
    return {
      id: null,
      exists: false,
      name: null,
      description: null,
      promptPath: null
    };
  }

  const agent = catalog.agents.find((item) => item.id === roleId) ?? null;
  return {
    id: roleId,
    exists: Boolean(agent),
    name: agent?.name ?? roleId,
    description: agent?.description ?? null,
    promptPath: agent?.path ?? null
  };
}

function deriveReviewState(task) {
  if (task.queueStatus === "ready_for_review") {
    return "pending_verifier";
  }
  if (task.reviewOutcome === "approved") {
    return "approved";
  }
  if (task.reviewOutcome === "changes_requested") {
    return "changes_requested";
  }
  return "not_started";
}

function recommendTaskAction(task) {
  if (task.queueStatus === "done") {
    return {
      actor: null,
      action: "complete",
      commands: []
    };
  }

  if (task.queueStatus === "ready_for_review") {
    return {
      actor: {
        type: "verifier_role",
        id: task.verifier,
        claimedBy: null
      },
      action: "review_and_decide",
      commands: [
        `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`,
        `node ./src/index.js task:reject --id ${task.id} --by ${task.verifier ?? "<verifier-role>"} --status claimed --notes "<changes requested>"`
      ]
    };
  }

  if (task.queueStatus === "queued" || task.queueStatus === "released") {
    return {
      actor: {
        type: "owner_role",
        id: task.owner,
        claimedBy: null
      },
      action: "claim_and_execute",
      commands: [
        `node ./src/index.js task:claim --id ${task.id} --by <worker-id>`,
        `node ./src/index.js task:review --id ${task.id} --by <worker-id>`
      ]
    };
  }

  if (task.queueStatus === "claimed") {
    return {
      actor: {
        type: "claimed_worker",
        id: task.owner,
        claimedBy: task.claimedBy ?? null
      },
      action: "continue_execution_and_handoff",
      commands: [
        `node ./src/index.js task:review --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`,
        `node ./src/index.js task:block --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"} --notes "<blocker>"`
      ]
    };
  }

  return {
    actor: {
      type: "owner_role",
      id: task.owner,
      claimedBy: task.claimedBy ?? null
    },
    action: "resolve_blocker_and_requeue",
    commands: [
      `node ./src/index.js task:claim --id ${task.id} --by <worker-id>`,
      `node ./src/index.js task:release --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`
    ]
  };
}

function recommendLaneAction(laneSummary, task) {
  if (!task) {
    return {
      actor: {
        type: "swarm_owner",
        id: laneSummary.owner
      },
      action: "queue_lane_task",
      commands: []
    };
  }

  return recommendTaskAction(task);
}

function recommendSwarmAction(overview, lanes) {
  const pendingReviewLane = lanes.find((lane) => lane.taskQueueStatus === "ready_for_review");
  if (pendingReviewLane) {
    return {
      actor: pendingReviewLane.recommendedNextActor,
      action: `review_lane:${pendingReviewLane.lane}`,
      commands: pendingReviewLane.recommendedCommands
    };
  }

  const runnableLane = lanes.find((lane) =>
    lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released"
  );
  if (runnableLane) {
    return {
      actor: runnableLane.recommendedNextActor,
      action: `dispatch_lane:${runnableLane.lane}`,
      commands: [
        `node ./src/index.js swarm:dispatch --id ${overview.swarm.id} --by <worker-id> --owner ${runnableLane.owner.id ?? "<owner-role>"}`
      ]
    };
  }

  const claimedLane = lanes.find((lane) => lane.taskQueueStatus === "claimed");
  if (claimedLane) {
    return {
      actor: claimedLane.recommendedNextActor,
      action: `continue_lane:${claimedLane.lane}`,
      commands: claimedLane.recommendedCommands
    };
  }

  const blockedLane = lanes.find((lane) => lane.taskQueueStatus === "blocked");
  if (blockedLane) {
    return {
      actor: blockedLane.recommendedNextActor,
      action: `unblock_lane:${blockedLane.lane}`,
      commands: blockedLane.recommendedCommands
    };
  }

  if (overview.counts.unqueued > 0) {
    return {
      actor: {
        type: "swarm_owner",
        id: overview.swarm.owner,
        claimedBy: null
      },
      action: "queue_swarm_lanes",
      commands: [`node ./src/index.js swarm:queue --id ${overview.swarm.id}`]
    };
  }

  return {
    actor: null,
    action: "complete",
    commands: []
  };
}

function buildSwarmHandoff(overview, recommended) {
  if (recommended.action === "complete") {
    return `Swarm ${overview.swarm.id} is complete; all ${overview.counts.totalLanes} lanes are done.`;
  }
  if (recommended.action.startsWith("dispatch_lane:")) {
    return `Swarm ${overview.swarm.id} has a runnable lane; dispatch the next owner-scoped task.`;
  }
  if (recommended.action.startsWith("review_lane:")) {
    return `Swarm ${overview.swarm.id} is waiting on verifier review before the lane can close.`;
  }
  if (recommended.action.startsWith("continue_lane:")) {
    return `Swarm ${overview.swarm.id} already has an active worker; continue execution inside the claimed lane scope.`;
  }
  if (recommended.action.startsWith("unblock_lane:")) {
    return `Swarm ${overview.swarm.id} is blocked in at least one lane and needs unblock ownership.`;
  }
  if (recommended.action === "queue_swarm_lanes") {
    return `Swarm ${overview.swarm.id} has planned lanes but no queued tasks yet.`;
  }
  return `Swarm ${overview.swarm.id} is active with bounded local coordination state.`;
}

function buildSessionTaskSnapshot(task, role, workerId) {
  return {
    summary: summarizeInboxTask(task, role, workerId),
    brief: taskBrief(task.id),
    recentHistory: (task.history ?? []).slice(-5),
    recentAnnotations: (task.annotations ?? []).slice(-5)
  };
}

function recommendWorkerSessionFocus(input) {
  const activeTask = input.activeOwned[0];
  if (activeTask) {
    return {
      kind: "active_task",
      taskId: activeTask.id,
      command: `node ./src/index.js task:review --id ${activeTask.id} --by ${input.workerId}`,
      reason: "worker already owns active execution"
    };
  }

  const reviewTask = input.reviewQueue[0];
  if (reviewTask) {
    return {
      kind: "review_task",
      taskId: reviewTask.id,
      command: `node ./src/index.js task:approve --id ${reviewTask.id} --by ${input.role}`,
      reason: "verifier has pending review work"
    };
  }

  const blockedTask = input.blockedOwned[0];
  if (blockedTask) {
    return {
      kind: "blocked_task",
      taskId: blockedTask.id,
      command: `node ./src/index.js task:release --id ${blockedTask.id} --by ${input.workerId}`,
      reason: "worker has blocked owned work"
    };
  }

  const handoffTask = input.handoffsAwaitingReview[0];
  if (handoffTask) {
    return {
      kind: "awaiting_review",
      taskId: handoffTask.id,
      command: null,
      reason: "worker has already handed this task to its verifier"
    };
  }

  if (input.next?.candidate) {
    return {
      kind: "pickup_next",
      taskId: input.next.candidate.id,
      command: `node ./src/index.js task:pickup --role ${input.role} --worker ${input.workerId} --mode ${input.mode}`,
      reason: "worker has no active task and can pick up the next candidate"
    };
  }

  return {
    kind: "idle",
    taskId: null,
    command: null,
    reason: "no current or queued work for this worker session"
  };
}

function buildWorkerHandoffSummary(session, focusTaskSnapshot) {
  if (session.focus?.kind === "active_task" && focusTaskSnapshot) {
    return `Worker ${session.workerId} owns ${focusTaskSnapshot.summary.id} and should continue execution before handoff to verifier ${focusTaskSnapshot.summary.verifier}.`;
  }
  if (session.focus?.kind === "review_task" && focusTaskSnapshot) {
    return `Worker ${session.workerId} is acting as verifier for ${focusTaskSnapshot.summary.id} and should decide approval or requested changes.`;
  }
  if (session.focus?.kind === "blocked_task" && focusTaskSnapshot) {
    return `Worker ${session.workerId} is blocked on ${focusTaskSnapshot.summary.id} and should release or annotate the blocker context.`;
  }
  if (session.focus?.kind === "awaiting_review" && focusTaskSnapshot) {
    return `Worker ${session.workerId} already handed ${focusTaskSnapshot.summary.id} to its verifier and is waiting on review.`;
  }
  if (session.focus?.kind === "pickup_next" && session.next?.candidate) {
    return `Worker ${session.workerId} has no active task and can pick up ${session.next.candidate.id} next.`;
  }
  return `Worker ${session.workerId} is idle with no current handoff target.`;
}

function pickupOutcome(relation) {
  if (relation === "owner_claimed_by_worker") {
    return "continue";
  }
  if (relation === "verifier_review") {
    return "review";
  }
  if (relation === "owner_blocked") {
    return "blocked";
  }
  return "observe";
}

function pickupFollowupCommand(candidate, workerId) {
  if (candidate.relation === "owner_claimed_by_worker") {
    return `node ./src/index.js task:review --id ${candidate.id} --by ${workerId}`;
  }
  if (candidate.relation === "verifier_review") {
    return `node ./src/index.js task:approve --id ${candidate.id} --by ${candidate.verifier ?? "<verifier-role>"}`;
  }
  if (candidate.relation === "owner_blocked") {
    return `node ./src/index.js task:release --id ${candidate.id} --by ${candidate.claimedBy ?? workerId}`;
  }
  return null;
}

function summarizeInboxTask(task, role, workerId) {
  const relation = task.verifier === role && task.queueStatus === "ready_for_review"
    ? "verifier_review"
    : task.owner === role && isClaimableTask(task)
      ? "owner_claimable"
      : task.owner === role && task.queueStatus === "claimed" && workerId && task.claimedBy === workerId
        ? "owner_claimed_by_worker"
        : task.owner === role && task.queueStatus === "blocked"
          ? "owner_blocked"
          : task.owner === role
            ? "owner_observe"
            : "verifier_observe";

  return {
    id: task.id,
    title: task.title,
    objective: task.objective,
    lane: task.lane,
    swarmId: task.swarmId,
    queueStatus: task.queueStatus,
    claimedBy: task.claimedBy,
    owner: task.owner,
    verifier: task.verifier,
    scope: task.scope ?? [],
    relation,
    recommendedAction: relationToAction(relation),
    updatedAt: task.updatedAt,
    createdAt: task.createdAt
  };
}

function relationToAction(relation) {
  if (relation === "verifier_review") {
    return "review";
  }
  if (relation === "owner_claimable") {
    return "claim";
  }
  if (relation === "owner_claimed_by_worker") {
    return "continue";
  }
  if (relation === "owner_blocked") {
    return "unblock";
  }
  return "observe";
}

function isClaimableTask(task) {
  return task.queueStatus === "queued" || task.queueStatus === "released";
}

function normalizeNextMode(mode) {
  if (mode === "owner" || mode === "verifier") {
    return mode;
  }
  return "any";
}

function sortInboxTasks(tasks, role, workerId) {
  return [...tasks].sort((left, right) => {
    const leftRank = inboxPriority(left, role, workerId);
    const rightRank = inboxPriority(right, role, workerId);
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }
    return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  });
}

function sortNextCandidates(tasks, role, workerId, mode) {
  return tasks
    .filter((task) => nextCandidatePriority(task, role, workerId, mode) < Number.POSITIVE_INFINITY)
    .sort((left, right) => {
      const leftRank = nextCandidatePriority(left, role, workerId, mode);
      const rightRank = nextCandidatePriority(right, role, workerId, mode);
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      return (left.createdAt ?? "").localeCompare(right.createdAt ?? "");
    });
}

function compareTasksByUpdatedAt(left, right) {
  return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
}

function inboxPriority(task, role, workerId) {
  if (task.verifier === role && task.queueStatus === "ready_for_review") {
    return 0;
  }
  if (task.owner === role && isClaimableTask(task)) {
    return 1;
  }
  if (task.owner === role && task.queueStatus === "claimed" && workerId && task.claimedBy === workerId) {
    return 2;
  }
  if (task.owner === role && task.queueStatus === "blocked") {
    return 3;
  }
  if (task.owner === role && task.queueStatus === "claimed") {
    return 4;
  }
  if (task.queueStatus === "done") {
    return 7;
  }
  return 6;
}

function nextCandidatePriority(task, role, workerId, mode) {
  if ((mode === "any" || mode === "verifier") && task.verifier === role && task.queueStatus === "ready_for_review") {
    return 0;
  }

  if ((mode === "any" || mode === "owner") && task.owner === role && isClaimableTask(task)) {
    return 1;
  }

  if (
    workerId &&
    (mode === "any" || mode === "owner") &&
    task.owner === role &&
    task.queueStatus === "claimed" &&
    task.claimedBy === workerId
  ) {
    return 2;
  }

  if ((mode === "any" || mode === "owner") && task.owner === role && task.queueStatus === "blocked") {
    return 3;
  }

  return Number.POSITIVE_INFINITY;
}



function validateTaskValue(task) {
  const issues = [];
  const roleCatalog = runtimeRoleCatalog();

  if (!task.title?.trim()) {
    issues.push({ code: "missing_title", message: "Task title is required" });
  }
  if (!task.owner?.trim()) {
    issues.push({ code: "missing_owner", message: "Task owner is required for bounded execution" });
  } else if (!roleCatalog.agents.includes(task.owner)) {
    issues.push({
      code: "unknown_owner",
      message: `Task owner ${task.owner} is not a shipped agent role`,
      allowed: roleCatalog.agents
    });
  }
  if (!task.verifier?.trim()) {
    issues.push({ code: "missing_verifier", message: "Task verifier is required for bounded execution" });
  } else if (!roleCatalog.agents.includes(task.verifier)) {
    issues.push({
      code: "unknown_verifier",
      message: `Task verifier ${task.verifier} is not a shipped agent role`,
      allowed: roleCatalog.agents
    });
  }
  if (!Array.isArray(task.scope) || task.scope.length === 0) {
    issues.push({ code: "missing_scope", message: "Task scope is required for bounded execution" });
  }
  if (!Array.isArray(task.acceptance) || task.acceptance.length === 0) {
    issues.push({ code: "missing_acceptance", message: "Task acceptance checks are required" });
  }
  if (!Array.isArray(task.verification) || task.verification.length === 0) {
    issues.push({ code: "missing_verification", message: "Task verification steps are required" });
  }
  if (task.queueStatus === "claimed" && !task.claimedBy) {
    issues.push({ code: "missing_claimed_by", message: "Claimed tasks must record claimedBy" });
  }

  return {
    task,
    ready: issues.length === 0,
    issues,
    catalog: roleCatalog
  };
}

function validateSwarmValue(swarm) {
  const issues = [];
  const laneReports = [];
  const roleCatalog = runtimeRoleCatalog();

  if (!swarm.objective?.trim()) {
    issues.push({ code: "missing_objective", message: "Swarm objective is required" });
  }
  if (!Array.isArray(swarm.lanes) || swarm.lanes.length === 0) {
    issues.push({ code: "missing_lanes", message: "Swarm must contain at least one lane" });
  }

  for (const lane of swarm.lanes) {
    const laneIssues = [];
    if (!lane.owner?.trim()) {
      laneIssues.push({ code: "missing_owner", message: "Lane owner is required" });
    } else if (!roleCatalog.agents.includes(lane.owner)) {
      laneIssues.push({
        code: "unknown_owner",
        message: `Lane owner ${lane.owner} is not a shipped agent role`,
        allowed: roleCatalog.agents
      });
    }
    if (!lane.verifier?.trim()) {
      laneIssues.push({ code: "missing_verifier", message: "Lane verifier is required" });
    } else if (!roleCatalog.agents.includes(lane.verifier)) {
      laneIssues.push({
        code: "unknown_verifier",
        message: `Lane verifier ${lane.verifier} is not a shipped agent role`,
        allowed: roleCatalog.agents
      });
    }
    if (!Array.isArray(lane.scope) || lane.scope.length === 0) {
      laneIssues.push({ code: "missing_scope", message: "Lane scope is required" });
    }
    if (!Array.isArray(lane.acceptance) || lane.acceptance.length === 0) {
      laneIssues.push({ code: "missing_acceptance", message: "Lane acceptance checks are required" });
    }
    if (!Array.isArray(lane.verification) || lane.verification.length === 0) {
      laneIssues.push({ code: "missing_verification", message: "Lane verification steps are required" });
    }

    laneReports.push({
      lane: lane.lane,
      ready: laneIssues.length === 0,
      issues: laneIssues
    });
  }

  const overlapIssues = [];
  const seen = new Map();
  for (const lane of swarm.lanes) {
    for (const path of lane.scope ?? []) {
      const owners = seen.get(path) ?? [];
      for (const otherLane of owners) {
        overlapIssues.push({
          code: "scope_overlap",
          message: `Lanes ${otherLane} and ${lane.lane} overlap on ${path}` ,
          lanes: [otherLane, lane.lane],
          path
        });
      }
      owners.push(lane.lane);
      seen.set(path, owners);
    }
  }

  return {
    swarm,
    ready: issues.length === 0 && laneReports.every((lane) => lane.ready) && overlapIssues.length === 0,
    issues,
    lanes: laneReports,
    overlaps: overlapIssues,
    catalog: roleCatalog
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


function syncSwarmInLoadedState(state, swarmId) {
  const swarmIndex = state.swarms.findIndex((item) => item.id === swarmId);
  if (swarmIndex < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (current.status === "cancelled") {
    state.swarms[swarmIndex] = current;
    return current;
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
  state.swarms[swarmIndex] = next;
  return next;
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

  const isVerifierApproval = nextQueueStatus === "done";
  const isVerifierReturn = current.queueStatus === "ready_for_review" && ["claimed", "blocked", "released"].includes(nextQueueStatus);
  const verifierActor = input.reviewedBy ?? null;

  if (nextQueueStatus === "claimed" && !isVerifierReturn) {
    const validation = validateTaskValue(current);
    if (!validation.ready) {
      return { error: `Task ${current.id} is not ready to claim`, validation };
    }
  }

  if (isVerifierApproval || isVerifierReturn) {
    if (current.queueStatus !== "ready_for_review") {
      return { error: `Task ${current.id} must be ready_for_review before verifier action` };
    }
    if (!verifierActor) {
      return { error: "reviewedBy is required for verifier action" };
    }
    if (!current.verifier || current.verifier !== verifierActor) {
      return { error: `Task ${current.id} must be reviewed by verifier ${current.verifier ?? "unknown"}` };
    }
  }

  if (current.claimedBy && current.claimedBy !== input.claimedBy) {
    if (!isVerifierReturn && (nextQueueStatus === "claimed" || input.claimedBy)) {
      return { error: `Task already claimed by ${current.claimedBy}` };
    }
  }

  let claimedBy = current.claimedBy;
  if (nextQueueStatus === "claimed" && !isVerifierReturn) {
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
    ...(nextQueueStatus === "ready_for_review"
      ? {
          reviewedBy: null,
          reviewedAt: null,
          reviewOutcome: null,
          reviewNotes: null,
          reviewEvidence: null
        }
      : {}),
    ...(isVerifierApproval || isVerifierReturn
      ? {
          reviewedBy: verifierActor,
          reviewedAt: new Date().toISOString(),
          reviewOutcome: isVerifierApproval ? "approved" : "changes_requested",
          reviewNotes: input.notes ?? null,
          reviewEvidence: input.reviewEvidence ?? null
        }
      : {}),
    history: appendTaskHistoryEntry(current, buildTaskHistoryEntry(current, nextQueueStatus, input)),
    updatedAt: new Date().toISOString()
  });

  state.tasks[index] = next;
  if (next.swarmId) {
    syncSwarmInLoadedState(state, next.swarmId);
  }
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
    reviewedBy: input.reviewedBy ?? null,
    reviewedAt: input.reviewedAt ?? null,
    reviewOutcome: input.reviewOutcome ?? null,
    reviewNotes: input.reviewNotes ?? null,
    reviewEvidence: input.reviewEvidence ?? null,
    annotations: input.annotations ?? [],
    history: [
      {
        id: "event-1",
        at: new Date().toISOString(),
        type: "created",
        fromQueueStatus: null,
        toQueueStatus: input.queueStatus ?? "queued",
        actor: input.claimedBy ?? null,
        notes: input.notes ?? null,
        evidence: [],
        outcome: null
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

function buildTaskHistoryEntry(current, nextQueueStatus, input) {
  const actor = input.reviewedBy ?? input.claimedBy ?? current.claimedBy ?? null;
  const isVerifierApproval = nextQueueStatus === "done";
  const isVerifierReturn =
    current.queueStatus === "ready_for_review" &&
    ["claimed", "blocked", "released"].includes(nextQueueStatus);

  let type = "updated";
  let outcome = null;
  if (nextQueueStatus === "claimed" && current.queueStatus !== "ready_for_review") {
    type = "claimed";
  } else if (nextQueueStatus === "blocked") {
    type = "blocked";
  } else if (nextQueueStatus === "ready_for_review") {
    type = "ready_for_review";
  } else if (nextQueueStatus === "released") {
    type = "released";
  } else if (isVerifierApproval) {
    type = "approved";
    outcome = "approved";
  } else if (isVerifierReturn) {
    type = "changes_requested";
    outcome = "changes_requested";
  }

  return {
    at: new Date().toISOString(),
    type,
    fromQueueStatus: current.queueStatus,
    toQueueStatus: nextQueueStatus,
    actor,
    notes: input.notes ?? null,
    evidence: input.reviewEvidence ?? [],
    outcome
  };
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
