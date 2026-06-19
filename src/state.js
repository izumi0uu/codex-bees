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

export function taskReport(id) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const brief = taskBrief(id);
  const reportEntries = buildTaskReportEntries(task);
  return {
    kind: "task_report",
    task: {
      id: task.id,
      title: task.title,
      objective: task.objective,
      queueStatus: task.queueStatus,
      owner: task.owner,
      verifier: task.verifier,
      claimedBy: task.claimedBy,
      swarmId: task.swarmId,
      lane: task.lane
    },
    closure: {
      reviewState: deriveReviewState(task),
      reviewedBy: task.reviewedBy,
      reviewedAt: task.reviewedAt,
      reviewOutcome: task.reviewOutcome,
      reviewNotes: task.reviewNotes,
      closureReady: task.queueStatus === "ready_for_review" || task.queueStatus === "done",
      nextGate: taskReportNextGate(task)
    },
    acceptance: (task.acceptance ?? []).map((item) => ({
      item,
      status: task.reviewOutcome === "approved" || task.queueStatus === "done" ? "verified" : "pending"
    })),
    verification: task.verification ?? [],
    evidence: {
      reviewEvidence: task.reviewEvidence ?? [],
      annotations: reportEntries.annotations,
      recentHistory: reportEntries.history
    },
    brief
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

export function swarmBundle(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const laneBundles = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    return {
      lane: laneSummary.lane,
      summary: laneSummary.summary,
      owner: laneSummary.owner,
      verifier: laneSummary.verifier,
      taskId: task?.id ?? null,
      queueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      ready: laneSummary.ready,
      done: laneSummary.done,
      report: task ? taskReport(task.id) : null
    };
  });

  return {
    kind: "swarm_bundle",
    swarm: overview.swarm,
    brief,
    counts: overview.counts,
    derivedStatus: overview.derivedStatus,
    readyToComplete: overview.readyToComplete,
    nextLane: overview.nextLane,
    lanes: laneBundles,
    summary: buildSwarmBundleSummary(overview, laneBundles)
  };
}

export function swarmCloseout(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const bundle = swarmBundle(id);
  const command = deriveSwarmCloseoutCommand(overview, brief);

  return {
    kind: "swarm_closeout",
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    readyToComplete: overview.readyToComplete,
    brief,
    bundle,
    command,
    summary: buildSwarmCloseoutSummary(overview, command)
  };
}

export function swarmBlockers(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const blockedLanes = (brief?.lanes ?? [])
    .filter((lane) => lane.taskQueueStatus === "blocked")
    .map((lane) => ({
      lane: lane.lane,
      summary: lane.summary,
      owner: lane.owner,
      verifier: lane.verifier,
      taskId: lane.taskId,
      claimedBy: lane.claimedBy,
      recommendedNextActor: lane.recommendedNextActor,
      recommendedNextAction: lane.recommendedNextAction,
      recommendedCommands: lane.recommendedCommands,
      report: lane.taskId ? taskReport(lane.taskId) : null
    }));

  return {
    kind: "swarm_blockers",
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    blockedCount: blockedLanes.length,
    blockers: blockedLanes,
    summary: buildSwarmBlockersSummary(overview, blockedLanes)
  };
}

export function swarmDispatchBundle(id) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const dispatchLane = (brief?.lanes ?? []).find(
    (lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released"
  ) ?? null;

  return {
    kind: "swarm_dispatch_bundle",
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    dispatchableCount: overview.dispatchableCount,
    nextLane: dispatchLane,
    taskBrief: dispatchLane?.taskId ? taskBrief(dispatchLane.taskId) : null,
    command: dispatchLane?.recommendedCommands?.[0] ?? null,
    summary: buildSwarmDispatchBundleSummary(overview, dispatchLane)
  };
}

export function leaderQueue(input = {}) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const items = workspace.swarms.map((swarm, index) => ({
    position: index + 1,
    swarmId: swarm.id,
    objective: swarm.objective,
    status: swarm.status,
    derivedStatus: swarm.derivedStatus,
    readyToComplete: swarm.readyToComplete,
    recommendedNextActor: swarm.recommendedNextActor,
    recommendedNextAction: swarm.recommendedNextAction,
    recommendedCommands: swarm.recommendedCommands,
    summary: swarm.summary
  }));

  return {
    kind: "leader_queue",
    filters: workspace.filters,
    counts: {
      total: items.length,
      actionable: items.filter((item) => !["completed", "cancelled"].includes(item.status)).length
    },
    items,
    next: items[0] ?? null,
    summary: buildLeaderQueueSummary(items)
  };
}

export function leaderAssignments(input = {}) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const assignments = workspace.swarms.flatMap((swarm) => {
    const brief = swarmBrief(swarm.id);
    return (brief?.lanes ?? [])
      .filter((lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released")
      .map((lane) => ({
        swarmId: swarm.id,
        objective: swarm.objective,
        lane: lane.lane,
        owner: lane.owner,
        verifier: lane.verifier,
        taskId: lane.taskId,
        taskQueueStatus: lane.taskQueueStatus,
        recommendedNextActor: lane.recommendedNextActor,
        recommendedNextAction: lane.recommendedNextAction,
        recommendedCommands: lane.recommendedCommands,
        taskBrief: lane.taskId ? taskBrief(lane.taskId) : null,
        summary: `Dispatch ${lane.lane} from ${swarm.id} to ${lane.owner.id ?? lane.owner.name ?? "unknown"}.`
      }));
  });

  const groupsByOwner = new Map();
  for (const assignment of assignments) {
    const ownerId = assignment.owner?.id ?? assignment.owner?.name ?? "unknown";
    const current = groupsByOwner.get(ownerId) ?? {
      owner: assignment.owner,
      count: 0,
      assignments: []
    };
    current.assignments.push(assignment);
    current.count += 1;
    groupsByOwner.set(ownerId, current);
  }

  const groups = [...groupsByOwner.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return (left.owner?.id ?? left.owner?.name ?? "").localeCompare(right.owner?.id ?? right.owner?.name ?? "");
  });

  return {
    kind: "leader_assignments",
    filters: workspace.filters,
    counts: {
      totalAssignments: assignments.length,
      ownerGroups: groups.length
    },
    next: assignments[0] ?? null,
    groups,
    summary: buildLeaderAssignmentsSummary(assignments, groups)
  };
}

export function runtimeDashboard() {
  const state = loadState();
  const tasks = state.tasks.map(normalizeTask);
  const swarms = listSwarmOverviews();
  const queue = leaderQueue();
  const assignments = leaderAssignments();

  const blockedTasks = tasks
    .filter((task) => task.queueStatus === "blocked")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const pendingReview = tasks
    .filter((task) => task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const activeClaimed = tasks
    .filter((task) => task.queueStatus === "claimed")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));

  return {
    kind: "runtime_dashboard",
    counts: {
      tasks: tasks.length,
      swarms: swarms.length,
      blockedTasks: blockedTasks.length,
      pendingReview: pendingReview.length,
      activeClaimed: activeClaimed.length,
      leaderQueueItems: queue?.counts?.total ?? 0,
      leaderAssignments: assignments?.counts?.totalAssignments ?? 0
    },
    leader: {
      queue,
      assignments
    },
    blockedTasks,
    pendingReview,
    activeClaimed,
    summary: buildRuntimeDashboardSummary(queue, blockedTasks, pendingReview, activeClaimed)
  };
}

export function runtimeAlerts() {
  const dashboard = runtimeDashboard();
  const alerts = [];

  for (const task of dashboard.blockedTasks) {
    alerts.push({
      kind: "blocked_task",
      severity: "high",
      taskId: task.id,
      swarmId: task.swarmId,
      lane: task.lane,
      owner: task.owner,
      summary: `Task ${task.id} is blocked${task.swarmId ? ` in ${task.swarmId}` : ""}.`
    });
  }

  for (const task of dashboard.pendingReview) {
    alerts.push({
      kind: "pending_review",
      severity: "medium",
      taskId: task.id,
      swarmId: task.swarmId,
      lane: task.lane,
      verifier: task.verifier,
      summary: `Task ${task.id} is waiting on verifier ${task.verifier ?? "unknown"}.`
    });
  }

  const readySwarms = listSwarmOverviews()
    .filter((swarm) => swarm.readyToComplete)
    .map((swarm) => ({
      kind: "swarm_ready_to_complete",
      severity: "medium",
      swarmId: swarm.swarm.id,
      summary: `Swarm ${swarm.swarm.id} is ready to complete.`
    }));
  alerts.push(...readySwarms);

  alerts.sort(compareRuntimeAlerts);

  return {
    kind: "runtime_alerts",
    counts: {
      total: alerts.length,
      high: alerts.filter((alert) => alert.severity === "high").length,
      medium: alerts.filter((alert) => alert.severity === "medium").length
    },
    alerts,
    summary: buildRuntimeAlertsSummary(alerts)
  };
}

export function runtimeRoles(input = {}) {
  const catalog = getRuntimeCatalog();
  const assignments = leaderAssignments();
  const assignmentsByRole = new Map(
    (assignments?.groups ?? []).map((group) => [group.owner?.id ?? group.owner?.name ?? "unknown", group.assignments ?? []])
  );
  const roles = catalog.agents
    .map((agent) => buildRuntimeRoleEntry(agent.id, input.limit, assignmentsByRole.get(agent.id) ?? []))
    .filter(Boolean)
    .sort(compareRuntimeRoleEntries);
  const next = roles[0] ?? null;

  return {
    kind: "runtime_roles",
    counts: {
      totalRoles: roles.length,
      withPendingReview: roles.filter((entry) => entry.counts.pendingReview > 0).length,
      withBlockedOwnerWork: roles.filter((entry) => entry.counts.ownerBlocked > 0).length,
      withClaimableOwnerWork: roles.filter((entry) => entry.counts.ownerClaimable > 0).length,
      withActiveOwnerWork: roles.filter((entry) => entry.counts.ownerClaimed > 0).length,
      totalPendingReview: roles.reduce((total, entry) => total + entry.counts.pendingReview, 0),
      totalBlockedOwnerWork: roles.reduce((total, entry) => total + entry.counts.ownerBlocked, 0),
      totalClaimableOwnerWork: roles.reduce((total, entry) => total + entry.counts.ownerClaimable, 0)
    },
    roles,
    next,
    summary: buildRuntimeRolesSummary(roles, next)
  };
}

export function runtimeDispatch() {
  const assignments = leaderAssignments();
  const groups = (assignments?.groups ?? []).map((group) => ({
    owner: group.owner,
    count: group.count,
    next: group.assignments?.[0] ?? null,
    assignments: (group.assignments ?? []).map((assignment, index) => ({
      position: index + 1,
      swarmId: assignment.swarmId,
      objective: assignment.objective,
      lane: assignment.lane,
      taskId: assignment.taskId,
      taskQueueStatus: assignment.taskQueueStatus,
      verifier: assignment.verifier,
      recommendedNextActor: assignment.recommendedNextActor,
      recommendedNextAction: assignment.recommendedNextAction,
      recommendedCommands: assignment.recommendedCommands,
      taskBrief: assignment.taskBrief,
      summary: assignment.summary
    }))
  }));
  const next = groups[0]?.assignments?.[0] ?? null;

  return {
    kind: "runtime_dispatch",
    counts: {
      ownerGroups: groups.length,
      totalAssignments: groups.reduce((total, group) => total + (group.count ?? 0), 0)
    },
    groups,
    next,
    summary: buildRuntimeDispatchSummary(groups, next)
  };
}

export function runtimeReview() {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt);
  const groupsByVerifier = new Map();

  for (const task of tasks) {
    const verifierId = task.verifier ?? "unknown";
    const current = groupsByVerifier.get(verifierId) ?? {
      verifier: describeRole(verifierId),
      count: 0,
      tasks: []
    };
    current.tasks.push(buildRuntimeReviewTaskEntry(task, current.count + 1));
    current.count += 1;
    groupsByVerifier.set(verifierId, current);
  }

  const groups = [...groupsByVerifier.values()].sort(compareRuntimeReviewGroups);
  const next = groups[0]?.tasks?.[0] ?? null;

  return {
    kind: "runtime_review",
    counts: {
      verifierGroups: groups.length,
      totalPendingReview: tasks.length
    },
    groups,
    next,
    summary: buildRuntimeReviewSummary(groups, next)
  };
}

export function runtimeFocus() {
  const dashboard = runtimeDashboard();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const dispatch = runtimeDispatch();
  const roles = runtimeRoles();
  const queueNext = dashboard?.leader?.queue?.next ?? null;

  const blockedAlert = alerts.alerts?.find((alert) => alert.kind === "blocked_task") ?? null;
  if (blockedAlert?.taskId) {
    const brief = taskBrief(blockedAlert.taskId);
    return {
      kind: "runtime_focus",
      focus: {
        source: "alerts",
        priority: "high",
        type: "blocked_task",
        taskId: blockedAlert.taskId,
        swarmId: blockedAlert.swarmId,
        lane: blockedAlert.lane,
        recommendedNextActor: brief?.recommendedNextActor ?? null,
        recommendedNextAction: brief?.recommendedNextAction ?? null,
        recommendedCommands: brief?.recommendedCommands ?? [],
        taskBrief: brief,
        summary: blockedAlert.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("blocked_task", blockedAlert.summary)
    };
  }

  if (review.next?.taskId) {
    return {
      kind: "runtime_focus",
      focus: {
        source: "review",
        priority: "medium",
        type: "review_task",
        taskId: review.next.taskId,
        swarmId: review.next.swarmId,
        lane: review.next.lane,
        verifier: review.groups?.[0]?.verifier ?? null,
        recommendedNextActor: review.next.recommendedNextActor,
        recommendedNextAction: review.next.recommendedNextAction,
        recommendedCommands: review.next.recommendedCommands,
        taskBrief: review.next.taskBrief,
        summary: review.next.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("review_task", review.next.summary)
    };
  }

  if (dispatch.next?.lane) {
    return {
      kind: "runtime_focus",
      focus: {
        source: "dispatch",
        priority: "medium",
        type: "dispatch_lane",
        taskId: dispatch.next.taskId,
        swarmId: dispatch.next.swarmId,
        lane: dispatch.next.lane,
        owner: dispatch.groups?.[0]?.owner ?? null,
        recommendedNextActor: dispatch.next.recommendedNextActor,
        recommendedNextAction: dispatch.next.recommendedNextAction,
        recommendedCommands: dispatch.next.recommendedCommands,
        taskBrief: dispatch.next.taskBrief,
        summary: dispatch.next.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("dispatch_lane", dispatch.next.summary)
    };
  }

  if (roles.next?.nextAction?.task || (roles.next?.counts?.total ?? 0) > 0) {
    return {
      kind: "runtime_focus",
      focus: {
        source: "roles",
        priority: "low",
        type: "role_pressure",
        role: roles.next.role,
        lane: roles.next.nextAction?.lane ?? null,
        recommendedNextActor: roles.next.role,
        recommendedNextAction: roles.next.nextAction?.reason ?? null,
        recommendedCommands: roles.next.nextAction?.command ? [roles.next.nextAction.command] : [],
        task: roles.next.nextAction?.task ?? null,
        summary: roles.next.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("role_pressure", roles.next.summary)
    };
  }

  if (queueNext?.swarmId) {
    return {
      kind: "runtime_focus",
      focus: {
        source: "leader_queue",
        priority: "low",
        type: "leader_queue_item",
        swarmId: queueNext.swarmId,
        recommendedNextActor: queueNext.recommendedNextActor ?? null,
        recommendedNextAction: queueNext.recommendedNextAction ?? null,
        recommendedCommands: queueNext.recommendedCommands ?? [],
        summary: queueNext.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("leader_queue_item", queueNext.summary)
    };
  }

  return {
    kind: "runtime_focus",
    focus: {
      source: "idle",
      priority: "none",
      type: "idle",
      recommendedNextActor: null,
      recommendedNextAction: null,
      recommendedCommands: [],
      summary: "Runtime focus has no active next action right now."
    },
    sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
    summary: buildRuntimeFocusSummary("idle", "Runtime focus has no active next action right now.")
  };
}

export function runtimeActivity(input = {}) {
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const tasks = loadState().tasks.map(normalizeTask);
  const entries = tasks
    .flatMap((task) => (task.history ?? []).map((event) => buildRuntimeActivityEntry(task, event)))
    .sort(compareRuntimeActivityEntries)
    .slice(0, limit);
  const next = entries[0] ?? null;

  return {
    kind: "runtime_activity",
    counts: {
      totalEntries: entries.length,
      blockedEvents: entries.filter((entry) => entry.type === "blocked").length,
      reviewEvents: entries.filter((entry) => ["ready_for_review", "approved", "changes_requested"].includes(entry.type)).length
    },
    entries,
    next,
    summary: buildRuntimeActivitySummary(entries, next)
  };
}

export function runtimeHandoffs() {
  const handoffs = loadState().tasks
    .map(normalizeTask)
    .filter((task) => ["ready_for_review", "blocked", "queued", "released"].includes(task.queueStatus))
    .map((task) => buildRuntimeHandoffEntry(task))
    .sort(compareRuntimeHandoffEntries);
  const groupsByActor = new Map();

  for (const handoff of handoffs) {
    const key = runtimeHandoffActorKey(handoff.actor);
    const current = groupsByActor.get(key) ?? {
      actor: handoff.actor,
      count: 0,
      handoffs: []
    };
    current.handoffs.push({
      position: current.count + 1,
      ...handoff
    });
    current.count += 1;
    groupsByActor.set(key, current);
  }

  const groups = [...groupsByActor.values()].sort(compareRuntimeHandoffGroups);
  const next = groups[0]?.handoffs?.[0] ?? null;

  return {
    kind: "runtime_handoffs",
    counts: {
      actorGroups: groups.length,
      totalHandoffs: handoffs.length,
      reviewDecisions: handoffs.filter((handoff) => handoff.handoffType === "verifier_decision").length,
      blockedRecoveries: handoffs.filter((handoff) => handoff.handoffType === "blocked_recovery").length,
      ownerClaims: handoffs.filter((handoff) => handoff.handoffType === "owner_claim").length
    },
    groups,
    next,
    summary: buildRuntimeHandoffsSummary(groups, next)
  };
}

export function runtimeCloseout() {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === "done")
    .map((task) => buildRuntimeCloseoutTaskEntry(task))
    .sort(compareRuntimeCloseoutTasks);
  const swarms = listSwarmOverviews()
    .filter((overview) => overview.readyToComplete)
    .map((overview) => buildRuntimeCloseoutSwarmEntry(overview))
    .sort(compareRuntimeCloseoutSwarms);
  const nextTask = tasks[0] ?? null;
  const nextSwarm = swarms[0] ?? null;
  const next = chooseRuntimeCloseoutNext(nextTask, nextSwarm);

  return {
    kind: "runtime_closeout",
    counts: {
      tasksReady: tasks.length,
      swarmsReady: swarms.length,
      totalReady: tasks.length + swarms.length
    },
    tasks,
    swarms,
    next,
    summary: buildRuntimeCloseoutSummary(tasks, swarms, next)
  };
}

export function runtimeRecovery() {
  const entries = loadState().tasks
    .map(normalizeTask)
    .filter((task) => isRuntimeRecoveryTask(task))
    .map((task) => buildRuntimeRecoveryEntry(task))
    .sort(compareRuntimeRecoveryEntries);
  const groupsByType = new Map();

  for (const entry of entries) {
    const current = groupsByType.get(entry.recoveryType) ?? {
      recoveryType: entry.recoveryType,
      count: 0,
      next: null,
      entries: []
    };
    current.entries.push({
      position: current.count + 1,
      ...entry
    });
    current.count += 1;
    current.next = current.entries[0] ?? null;
    groupsByType.set(entry.recoveryType, current);
  }

  const groups = [...groupsByType.values()].sort(compareRuntimeRecoveryGroups);
  const next = groups[0]?.entries?.[0] ?? null;

  return {
    kind: "runtime_recovery",
    counts: {
      recoveryGroups: groups.length,
      totalEntries: entries.length,
      blocked: entries.filter((entry) => entry.recoveryType === "blocked_recovery").length,
      released: entries.filter((entry) => entry.recoveryType === "released_repickup").length,
      changesRequested: entries.filter((entry) => entry.recoveryType === "changes_requested").length
    },
    groups,
    next,
    summary: buildRuntimeRecoverySummary(groups, next)
  };
}

export function runtimeSummaryPack() {
  const dashboard = runtimeDashboard();
  const alerts = runtimeAlerts();
  const focus = runtimeFocus();
  const handoffs = runtimeHandoffs();
  const recovery = runtimeRecovery();
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeSummaryPackSurface({ focus, recovery, closeout, handoffs, dashboard });

  return {
    kind: "runtime_summary_pack",
    recommendedSurface,
    focus,
    overview: {
      dashboard: dashboard.counts,
      alerts: alerts.counts,
      handoffs: handoffs.counts,
      recovery: recovery.counts,
      closeout: closeout.counts
    },
    next: {
      focus: focus.focus ?? null,
      handoff: handoffs.next ?? null,
      recovery: recovery.next ?? null,
      closeout: closeout.next ?? null
    },
    surfaces: {
      dashboard,
      alerts,
      handoffs,
      recovery,
      closeout
    },
    summary: buildRuntimeSummaryPackSummary(recommendedSurface, focus)
  };
}

export function runtimeOperatorPack() {
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const handoffs = runtimeHandoffs();
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts });

  return {
    kind: "runtime_operator_pack",
    recommendedSurface,
    focus,
    overview: {
      dashboard: dashboard?.counts ?? null,
      alerts: alerts?.counts ?? null,
      handoffs: handoffs?.counts ?? null,
      closeout: closeout?.counts ?? null
    },
    next: {
      focus: focus?.focus ?? null,
      handoff: handoffs?.next ?? null,
      closeout: closeout?.next ?? null,
      alert: alerts?.alerts?.[0] ?? null
    },
    surfaces: {
      dashboard,
      focus,
      alerts,
      handoffs,
      closeout
    },
    summary: buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts)
  };
}

export function runtimeDispatchPack() {
  const dispatch = runtimeDispatch();
  const roles = runtimeRoles();
  const handoffs = runtimeHandoffs();
  const recommendedSurface = deriveRuntimeDispatchPackSurface({ dispatch, roles, handoffs });

  return {
    kind: "runtime_dispatch_pack",
    recommendedSurface,
    overview: {
      dispatch: dispatch?.counts ?? null,
      roles: roles?.counts ?? null,
      handoffs: handoffs?.counts ?? null
    },
    next: {
      dispatch: dispatch?.next ?? null,
      role: roles?.next ?? null,
      handoff: handoffs?.next ?? null
    },
    surfaces: {
      dispatch,
      roles,
      handoffs
    },
    summary: buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, handoffs, roles)
  };
}

export function runtimeRecoveryPack() {
  const recovery = runtimeRecovery();
  const handoffs = runtimeHandoffs();
  const focus = runtimeFocus();
  const recommendedSurface = deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus });

  return {
    kind: "runtime_recovery_pack",
    recommendedSurface,
    focus,
    overview: {
      recovery: recovery?.counts ?? null,
      handoffs: handoffs?.counts ?? null
    },
    next: {
      recovery: recovery?.next ?? null,
      handoff: handoffs?.next ?? null,
      focus: focus?.focus ?? null
    },
    surfaces: {
      recovery,
      handoffs,
      focus
    },
    summary: buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus)
  };
}

export function runtimeCloseoutPack() {
  const closeout = runtimeCloseout();
  const summaryPack = runtimeSummaryPack();
  const leaderPack = runtimeLeaderPack();
  const recommendedSurface = deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack });

  return {
    kind: "runtime_closeout_pack",
    recommendedSurface,
    overview: {
      closeout: closeout?.counts ?? null,
      summary: summaryPack?.overview?.closeout ?? null,
      leader: leaderPack?.overview?.closeout ?? null
    },
    next: {
      closeout: closeout?.next ?? null,
      summary: summaryPack?.next?.closeout ?? null,
      leader: leaderPack?.next?.closeout ?? null
    },
    surfaces: {
      closeout,
      summaryPack,
      leaderPack
    },
    summary: buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack)
  };
}

export function runtimeReviewPack(input = {}) {
  const review = runtimeReview();
  const roles = runtimeRoles();
  const verifierPack = input.role && input.workerId
    ? runtimeVerifierPack({ role: input.role, workerId: input.workerId })
    : null;
  const recommendedSurface = deriveRuntimeReviewPackSurface({ review, roles, verifierPack });

  return {
    kind: "runtime_review_pack",
    role: input.role ? describeRole(input.role) : null,
    workerId: input.workerId ?? null,
    recommendedSurface,
    overview: {
      review: review?.counts ?? null,
      roles: roles?.counts ?? null,
      verifier: verifierPack?.overview ?? null
    },
    next: {
      review: review?.next ?? null,
      role: roles?.next ?? null,
      verifier: verifierPack?.next ?? null
    },
    surfaces: {
      review,
      roles,
      verifierPack
    },
    summary: buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles)
  };
}

export function runtimeQueuePack() {
  const queue = leaderQueue();
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const recommendedSurface = deriveRuntimeQueuePackSurface({ queue, dashboard, focus });

  return {
    kind: "runtime_queue_pack",
    recommendedSurface,
    overview: {
      queue: queue?.counts ?? null,
      dashboard: dashboard?.counts ?? null
    },
    next: {
      queue: queue?.next ?? null,
      focus: focus?.focus ?? null
    },
    surfaces: {
      queue,
      dashboard,
      focus
    },
    summary: buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard)
  };
}

export function runtimeWorkspacePack() {
  const dashboard = runtimeDashboard();
  const dispatch = runtimeDispatch();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeWorkspacePackSurface({ dashboard, dispatch, review, recovery });

  return {
    kind: "runtime_workspace_pack",
    recommendedSurface,
    overview: {
      dashboard: dashboard?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: {
      dashboard: dashboard?.leader?.queue?.next ?? null,
      dispatch: dispatch?.next ?? null,
      review: review?.next ?? null,
      recovery: recovery?.next ?? null
    },
    surfaces: {
      dashboard,
      dispatch,
      review,
      recovery
    },
    summary: buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, review, recovery)
  };
}

export function runtimeControlPack() {
  const summaryPack = runtimeSummaryPack();
  const workspacePack = runtimeWorkspacePack();
  const operatorPack = runtimeOperatorPack();
  const leaderPack = runtimeLeaderPack();
  const recommendedSurface = deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack });

  return {
    kind: "runtime_control_pack",
    recommendedSurface,
    overview: {
      summary: summaryPack?.overview ?? null,
      workspace: workspacePack?.overview ?? null,
      operator: operatorPack?.overview ?? null,
      leader: leaderPack?.overview ?? null
    },
    next: {
      summary: summaryPack?.focus?.focus ?? null,
      workspace: workspacePack?.next ?? null,
      operator: operatorPack?.next ?? null,
      leader: leaderPack?.next ?? null
    },
    surfaces: {
      summaryPack,
      workspacePack,
      operatorPack,
      leaderPack
    },
    summary: buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack)
  };
}

export function runtimeSignalPack(input = {}) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const activity = runtimeActivity(input);
  const roles = runtimeRoles(input);
  const recommendedSurface = deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles });

  return {
    kind: "runtime_signal_pack",
    recommendedSurface,
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      alerts: alerts?.counts ?? null,
      activity: activity?.counts ?? null,
      roles: roles?.counts ?? null
    },
    next: {
      focus: focus?.focus ?? null,
      alert: alerts?.alerts?.[0] ?? null,
      activity: activity?.next ?? null,
      role: roles?.next ?? null
    },
    surfaces: {
      focus,
      alerts,
      activity,
      roles
    },
    summary: buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles)
  };
}

export function runtimeHandoffPack() {
  const handoffs = runtimeHandoffs();
  const dispatch = runtimeDispatch();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery });

  return {
    kind: "runtime_handoff_pack",
    recommendedSurface,
    overview: {
      handoffs: handoffs?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: {
      handoff: handoffs?.next ?? null,
      dispatch: dispatch?.next ?? null,
      review: review?.next ?? null,
      recovery: recovery?.next ?? null
    },
    surfaces: {
      handoffs,
      dispatch,
      review,
      recovery
    },
    summary: buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch)
  };
}

export function runtimeTriagePack() {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery });

  return {
    kind: "runtime_triage_pack",
    recommendedSurface,
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      alerts: alerts?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: {
      focus: focus?.focus ?? null,
      alert: alerts?.alerts?.[0] ?? null,
      review: review?.next ?? null,
      recovery: recovery?.next ?? null
    },
    surfaces: {
      focus,
      alerts,
      review,
      recovery
    },
    summary: buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery)
  };
}

export function runtimeSessionPack(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const workerPack = runtimeWorkerPack({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const ownerPack = runtimeOwnerPack({
    role: input.role,
    workerId: input.workerId
  });
  const verifierPack = runtimeVerifierPack({
    role: input.role,
    workerId: input.workerId
  });
  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const recommendedSurface = deriveRuntimeSessionPackSurface({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role: input.role,
    workerId: input.workerId
  });

  return {
    kind: "runtime_session_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: input.mode ?? "any",
    recommendedSurface,
    overview: {
      worker: workerPack?.overview ?? null,
      owner: ownerPack?.overview ?? null,
      verifier: verifierPack?.overview ?? null,
      role: roleEntry?.counts ?? null
    },
    next: {
      worker: workerPack?.next ?? null,
      owner: ownerPack?.next ?? null,
      verifier: verifierPack?.next ?? null,
      role: roleEntry?.nextAction ?? null
    },
    surfaces: {
      workerPack,
      ownerPack,
      verifierPack,
      role: roleEntry
    },
    summary: buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry)
  };
}

export function runtimeRolePack(input = {}) {
  if (!input.role) {
    return null;
  }

  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const sessionPack = input.workerId
    ? runtimeSessionPack({
        role: input.role,
        workerId: input.workerId,
        mode: input.mode ?? "any"
      })
    : null;
  const ownerPack = input.workerId
    ? runtimeOwnerPack({
        role: input.role,
        workerId: input.workerId
      })
    : null;
  const verifierPack = input.workerId
    ? runtimeVerifierPack({
        role: input.role,
        workerId: input.workerId
      })
    : null;
  const recommendedSurface = deriveRuntimeRolePackSurface({ roleEntry, sessionPack, ownerPack, verifierPack });

  return {
    kind: "runtime_role_pack",
    role: roleEntry?.role ?? describeRole(input.role),
    workerId: input.workerId ?? null,
    mode: input.mode ?? "any",
    recommendedSurface,
    overview: {
      role: roleEntry?.counts ?? null,
      session: sessionPack?.overview ?? null,
      owner: ownerPack?.overview ?? null,
      verifier: verifierPack?.overview ?? null
    },
    next: {
      role: roleEntry?.nextAction ?? null,
      session: sessionPack?.next ?? null,
      owner: ownerPack?.next ?? null,
      verifier: verifierPack?.next ?? null
    },
    surfaces: {
      role: roleEntry,
      sessionPack,
      ownerPack,
      verifierPack
    },
    summary: buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack)
  };
}

export function runtimeExecutionPack() {
  const focus = runtimeFocus();
  const dispatch = runtimeDispatch();
  const roles = runtimeRoles();
  const queuePack = runtimeQueuePack();
  const recommendedSurface = deriveRuntimeExecutionPackSurface({ focus, dispatch, roles, queuePack });

  return {
    kind: "runtime_execution_pack",
    recommendedSurface,
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      dispatch: dispatch?.counts ?? null,
      roles: roles?.counts ?? null,
      queue: queuePack?.overview?.queue ?? null
    },
    next: {
      focus: focus?.focus ?? null,
      dispatch: dispatch?.next ?? null,
      role: roles?.next ?? null,
      queue: queuePack?.next?.queue ?? null
    },
    surfaces: {
      focus,
      dispatch,
      roles,
      queuePack
    },
    summary: buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, roles, queuePack)
  };
}

export function runtimePickupPack(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const session = workerSession({
    role: input.role,
    workerId: input.workerId,
    mode,
    limit: input.limit
  });
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const pickup = previewTaskPickup({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const rolePack = runtimeRolePack({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const recommendedSurface = deriveRuntimePickupPackSurface({
    session,
    pickup,
    next,
    rolePack,
    role: input.role,
    workerId: input.workerId,
    mode
  });

  return {
    kind: "runtime_pickup_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode,
    recommendedSurface,
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null,
      pickup: pickup
        ? {
            outcome: pickup.outcome,
            command: pickup.command,
            candidateId: pickup.candidate?.id ?? null
          }
        : null,
      role: rolePack?.overview?.role ?? null
    },
    next: {
      focus: session?.focus ?? null,
      candidate: next?.candidate ?? null,
      brief: pickup?.brief ?? next?.brief ?? null,
      pickup
    },
    surfaces: {
      session,
      next,
      pickup,
      rolePack
    },
    summary: buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next)
  };
}

export function runtimeAssignmentPack(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = roleAssignments?.assignments?.[0] ?? null;
  const session = workerSession({
    role: input.role,
    workerId: input.workerId,
    mode,
    limit: input.limit
  });
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const pickup = previewTaskAssignment({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const roleEntry = runtimeRoles()?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const recommendedSurface = deriveRuntimeAssignmentPackSurface({
    assignment,
    session,
    next,
    pickup,
    roleEntry,
    role: input.role,
    workerId: input.workerId,
    mode
  });

  return {
    kind: "runtime_assignment_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode,
    recommendedSurface,
    overview: {
      assignments: {
        count: roleAssignments?.count ?? 0,
        ownerGroups: assignments?.counts?.ownerGroups ?? 0
      },
      pickup: pickup
        ? {
            outcome: pickup.outcome,
            command: pickup.command,
            candidateId: pickup.candidate?.id ?? null
          }
        : null,
      role: roleEntry?.counts ?? null,
      session: session?.counts ?? null
    },
    next: {
      assignment,
      pickup,
      candidate: next?.candidate ?? null,
      focus: session?.focus ?? null
    },
    surfaces: {
      roleAssignments,
      session,
      next,
      pickup,
      role: roleEntry,
      roleAssignments,
      assignments: {
        counts: assignments?.counts ?? null,
        next: assignments?.next ?? null
      }
    },
    summary: buildRuntimeAssignmentPackSummary(recommendedSurface, assignment, session, pickup, next, roleAssignments)
  };
}

export function runtimeLeaderPack(input = {}) {
  const workspace = leaderWorkspace(input);
  const queue = leaderQueue(input);
  const dispatch = runtimeDispatch();
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, closeout });

  return {
    kind: "runtime_leader_pack",
    filters: workspace?.filters ?? {
      status: input.status,
      topology: input.topology,
      owner: input.owner
    },
    recommendedSurface,
    overview: {
      workspace: workspace?.counts ?? null,
      queue: queue?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      closeout: closeout?.counts ?? null
    },
    next: {
      workspace: workspace?.focus ?? null,
      queue: queue?.next ?? null,
      dispatch: dispatch?.next ?? null,
      closeout: closeout?.next ?? null
    },
    surfaces: {
      workspace,
      queue,
      dispatch,
      closeout
    },
    summary: buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue)
  };
}

export function runtimeOwnerPack(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "owner"
  };
  const session = workerSession(normalized);
  const handoff = workerHandoff(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: "owner"
  });
  const recommendedSurface = deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role: input.role, workerId: input.workerId });

  return {
    kind: "runtime_owner_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: "owner",
    recommendedSurface,
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null
    },
    next: {
      focus: session?.focus ?? null,
      candidate: next?.candidate ?? null,
      handoff: handoff?.currentTask ?? null,
      closeout: closeout?.report?.task ?? null
    },
    surfaces: {
      session,
      handoff,
      closeout,
      next
    },
    summary: buildRuntimeOwnerPackSummary(recommendedSurface, session)
  };
}

export function runtimeWorkerPack(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const session = workerSession(input);
  const handoff = workerHandoff(input);
  const closeout = workerCloseout(input);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const recommendedSurface = deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next });

  return {
    kind: "runtime_worker_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: session?.mode ?? normalizeNextMode(input.mode),
    recommendedSurface,
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null
    },
    next: {
      focus: session?.focus ?? null,
      candidate: next?.candidate ?? null,
      handoff: handoff?.currentTask ?? null,
      closeout: closeout?.report?.task ?? null
    },
    surfaces: {
      session,
      handoff,
      closeout,
      next
    },
    summary: buildRuntimeWorkerPackSummary(recommendedSurface, session)
  };
}

export function runtimeVerifierPack(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "verifier"
  };
  const review = runtimeReview();
  const bundle = verifierBundle(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: "verifier"
  });
  const recommendedSurface = deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role: input.role });

  return {
    kind: "runtime_verifier_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: "verifier",
    recommendedSurface,
    overview: {
      review: review?.counts ?? null,
      bundle: bundle?.currentTask ? { currentTask: bundle.currentTask.id } : { currentTask: null }
    },
    next: {
      review: review?.next ?? null,
      candidate: next?.candidate ?? null,
      decision: bundle?.currentTask ?? null,
      closeout: closeout?.report?.task ?? null
    },
    surfaces: {
      review,
      bundle,
      closeout,
      next
    },
    summary: buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review)
  };
}

export function leaderWorkspace(input = {}) {
  const filters = {
    status: input.status,
    topology: input.topology,
    owner: input.owner
  };
  const overviews = listSwarmOverviews(filters);
  const swarmEntries = overviews
    .map((overview) => buildLeaderWorkspaceSwarmEntry(overview))
    .sort(compareLeaderWorkspaceEntries);
  const focusEntry = swarmEntries[0] ?? null;

  return {
    kind: "leader_workspace",
    filters,
    counts: {
      totalSwarms: swarmEntries.length,
      planned: swarmEntries.filter((entry) => entry.status === "planned").length,
      active: swarmEntries.filter((entry) => entry.status === "active").length,
      blocked: swarmEntries.filter((entry) => entry.status === "blocked").length,
      completed: swarmEntries.filter((entry) => entry.status === "completed").length,
      cancelled: swarmEntries.filter((entry) => entry.status === "cancelled").length,
      readyToComplete: swarmEntries.filter((entry) => entry.readyToComplete).length,
      dispatchable: swarmEntries.reduce((total, entry) => total + (entry.dispatchableCount ?? 0), 0),
      pendingReview: swarmEntries.reduce((total, entry) => total + (entry.counts?.readyForReview ?? 0), 0)
    },
    swarms: swarmEntries,
    focus: focusEntry
      ? {
          swarmId: focusEntry.id,
          recommendedNextActor: focusEntry.recommendedNextActor,
          recommendedNextAction: focusEntry.recommendedNextAction,
          recommendedCommands: focusEntry.recommendedCommands,
          bundle: swarmBundle(focusEntry.id)
        }
      : null,
    summary: buildLeaderWorkspaceSummary(swarmEntries, focusEntry)
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

export function taskAssignmentPickup(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = input.taskId
    ? (roleAssignments?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : roleAssignments?.assignments?.[0] ?? null;

  if (!assignment?.taskId) {
    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "none",
      assignment: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const task = getTask(assignment.taskId);
  if (!task) {
    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "error",
      assignment,
      task: null,
      brief: null,
      command: null,
      error: `Missing task for assignment ${assignment.taskId}`
    };
  }

  const brief = taskBrief(task.id);
  const candidate = summarizeInboxTask(task, input.role, input.workerId);

  if (candidate.relation === "owner_claimable") {
    const claimed = claimTask({
      id: candidate.id,
      claimedBy: input.workerId
    });
    if (!claimed || claimed.error) {
      return {
        kind: "task_assignment_pickup",
        role: describeRole(input.role),
        workerId: input.workerId,
        mode: normalizeNextMode(input.mode),
        outcome: "error",
        assignment,
        task: claimed ?? task,
        brief,
        command: null,
        error: claimed?.error ?? `Unable to claim assigned task ${candidate.id}`
      };
    }

    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "claimed",
      assignment,
      candidate: summarizeInboxTask(claimed, input.role, input.workerId),
      task: claimed,
      brief: taskBrief(claimed.id),
      command: `node ./src/index.js task:review --id ${claimed.id} --by ${input.workerId}`
    };
  }

  return {
    kind: "task_assignment_pickup",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: normalizeNextMode(input.mode),
    outcome: assignmentPickupOutcome(candidate.relation),
    assignment,
    candidate,
    task,
    brief,
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function previewTaskAssignment(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = input.taskId
    ? (roleAssignments?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : roleAssignments?.assignments?.[0] ?? null;

  if (!assignment?.taskId) {
    return {
      kind: "task_assignment_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "none",
      assignment: null,
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const task = getTask(assignment.taskId);
  if (!task) {
    return {
      kind: "task_assignment_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "error",
      assignment,
      candidate: null,
      task: null,
      brief: null,
      command: null,
      error: `Missing task for assignment ${assignment.taskId}`
    };
  }

  const candidate = summarizeInboxTask(task, input.role, input.workerId);
  const brief = taskBrief(task.id);

  return {
    kind: "task_assignment_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: normalizeNextMode(input.mode),
    outcome: candidate.relation === "owner_claimable" ? "claimable" : assignmentPickupOutcome(candidate.relation),
    assignment,
    candidate,
    task,
    brief,
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function previewTaskPickup(input = {}) {
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
      kind: "task_pickup_preview",
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
  const currentTask = getTask(next.candidate.id);

  if (relation === "owner_claimable") {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      outcome: "claimable",
      candidate: next.candidate,
      task: currentTask,
      brief: next.brief,
      command: `node ./src/index.js task:pickup --role ${input.role} --worker ${input.workerId} --mode ${next.mode}`
    };
  }

  return {
    kind: "task_pickup_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    outcome: pickupOutcome(relation),
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    command: pickupFollowupCommand(next.candidate, input.workerId)
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

export function workerCloseout(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const handoff = workerHandoff(input);
  if (!handoff) {
    return null;
  }

  const report = handoff.currentTask?.id ? taskReport(handoff.currentTask.id) : null;
  return {
    kind: "worker_closeout",
    role: handoff.role,
    workerId: handoff.workerId,
    mode: handoff.mode,
    focus: handoff.focus,
    handoff,
    report,
    command: deriveWorkerCloseoutCommand(handoff, report),
    summary: buildWorkerCloseoutSummary(handoff, report)
  };
}

export function verifierBundle(input = {}) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "verifier"
  };
  const session = workerSession(normalized);
  const handoff = workerHandoff(normalized);
  const reviewSnapshot = session?.reviewQueue?.[0] ?? null;
  const report = reviewSnapshot?.summary?.id ? taskReport(reviewSnapshot.summary.id) : null;

  return {
    kind: "verifier_bundle",
    role: describeRole(input.role),
    workerId: input.workerId,
    handoff,
    currentTask: reviewSnapshot?.summary ?? null,
    report,
    recentHistory: reviewSnapshot?.recentHistory ?? [],
    recentAnnotations: reviewSnapshot?.recentAnnotations ?? [],
    commands: buildVerifierDecisionCommands(reviewSnapshot?.summary, input.role),
    summary: buildVerifierBundleSummary(reviewSnapshot?.summary, input.role, input.workerId)
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

function taskReportNextGate(task) {
  if (task.queueStatus === "done") {
    return {
      action: "archive_or_handoff",
      command: null
    };
  }
  if (task.queueStatus === "ready_for_review") {
    return {
      action: "verifier_decision",
      command: `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`
    };
  }
  if (task.queueStatus === "claimed") {
    return {
      action: "complete_and_handoff",
      command: `node ./src/index.js task:review --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`
    };
  }
  return {
    action: "continue_execution",
    command: null
  };
}

function buildTaskReportEntries(task) {
  const annotations = (task.annotations ?? []).filter((entry) =>
    ["context", "handoff", "review-note", "evidence", "note"].includes(entry.kind)
  );
  const history = (task.history ?? []).slice(-10);
  return {
    annotations,
    history
  };
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

function buildSwarmBundleSummary(overview, laneBundles) {
  if (overview.readyToComplete) {
    return `Swarm ${overview.swarm.id} is ready to complete with ${overview.counts.done}/${overview.counts.totalLanes} lanes done.`;
  }

  const reviewLane = laneBundles.find((lane) => lane.queueStatus === "ready_for_review");
  if (reviewLane) {
    return `Swarm ${overview.swarm.id} has lane ${reviewLane.lane} waiting on verifier ${reviewLane.verifier}.`;
  }

  const claimedLane = laneBundles.find((lane) => lane.queueStatus === "claimed");
  if (claimedLane) {
    return `Swarm ${overview.swarm.id} is in progress on lane ${claimedLane.lane} with worker ${claimedLane.claimedBy ?? "unknown"}.`;
  }

  const nextLane = laneBundles.find((lane) => lane.queueStatus === "queued" || lane.queueStatus === "released");
  if (nextLane) {
    return `Swarm ${overview.swarm.id} can dispatch lane ${nextLane.lane} next.`;
  }

  return `Swarm ${overview.swarm.id} remains active with ${overview.counts.totalLanes} tracked lanes.`;
}

function deriveSwarmCloseoutCommand(overview, brief) {
  if (overview.readyToComplete) {
    return `node ./src/index.js swarm:done --id ${overview.swarm.id}`;
  }

  return brief?.recommendedCommands?.[0] ?? null;
}

function buildSwarmCloseoutSummary(overview, command) {
  if (overview.readyToComplete) {
    return `Swarm ${overview.swarm.id} can be explicitly closed out now that all ${overview.counts.totalLanes} lanes are done.`;
  }

  if (command) {
    return `Swarm ${overview.swarm.id} is not ready for closeout yet; continue with the next orchestration action first.`;
  }

  return `Swarm ${overview.swarm.id} has no closeout action available yet.`;
}

function buildSwarmBlockersSummary(overview, blockedLanes) {
  if (blockedLanes.length === 0) {
    return `Swarm ${overview.swarm.id} has no blocked lanes right now.`;
  }

  if (blockedLanes.length === 1) {
    return `Swarm ${overview.swarm.id} has 1 blocked lane (${blockedLanes[0].lane}) that needs unblock ownership.`;
  }

  return `Swarm ${overview.swarm.id} has ${blockedLanes.length} blocked lanes that need unblock ownership.`;
}

function buildSwarmDispatchBundleSummary(overview, dispatchLane) {
  if (!dispatchLane) {
    return `Swarm ${overview.swarm.id} has no dispatchable lane right now.`;
  }

  return `Swarm ${overview.swarm.id} can dispatch lane ${dispatchLane.lane} next for owner ${dispatchLane.owner.id ?? dispatchLane.owner.name ?? "unknown"}.`;
}

function buildLeaderQueueSummary(items) {
  if (items.length === 0) {
    return "Leader queue has no swarm work items yet.";
  }

  const next = items[0];
  return `Leader queue is prioritized with ${next.swarmId} first for action ${next.recommendedNextAction ?? "observe"}.`;
}

function buildLeaderAssignmentsSummary(assignments, groups) {
  if (assignments.length === 0) {
    return "Leader assignments has no dispatchable work right now.";
  }

  const next = assignments[0];
  return `Leader assignments has ${assignments.length} dispatchable lane${assignments.length === 1 ? "" : "s"} across ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId} is first.`;
}

function summarizeDashboardTask(task) {
  return {
    id: task.id,
    title: task.title,
    swarmId: task.swarmId,
    lane: task.lane,
    owner: task.owner,
    verifier: task.verifier,
    claimedBy: task.claimedBy,
    queueStatus: task.queueStatus,
    updatedAt: task.updatedAt
  };
}

function buildRuntimeDashboardSummary(queue, blockedTasks, pendingReview, activeClaimed) {
  const nextSwarm = queue?.next?.swarmId ?? null;
  if (blockedTasks.length > 0) {
    return `Runtime dashboard shows ${blockedTasks.length} blocked task${blockedTasks.length === 1 ? "" : "s"}; ${nextSwarm ? `${nextSwarm} remains the next leader queue item.` : "leader queue has no next item."}`;
  }
  if (pendingReview.length > 0) {
    return `Runtime dashboard shows ${pendingReview.length} task${pendingReview.length === 1 ? "" : "s"} waiting on verifier review.`;
  }
  if (activeClaimed.length > 0) {
    return `Runtime dashboard shows ${activeClaimed.length} actively claimed task${activeClaimed.length === 1 ? "" : "s"} in progress.`;
  }
  if (nextSwarm) {
    return `Runtime dashboard is ready with ${nextSwarm} at the head of the leader queue.`;
  }
  return "Runtime dashboard has no active coordination work right now.";
}

function compareRuntimeAlerts(left, right) {
  const severityRank = { high: 0, medium: 1, low: 2 };
  const leftRank = severityRank[left.severity] ?? 9;
  const rightRank = severityRank[right.severity] ?? 9;
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (left.taskId ?? left.swarmId ?? "").localeCompare(right.taskId ?? right.swarmId ?? "");
}

function buildRuntimeAlertsSummary(alerts) {
  if (alerts.length === 0) {
    return "Runtime alerts has no active alerts right now.";
  }
  const top = alerts[0];
  return `Runtime alerts has ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}; ${top.summary}`;
}

function buildRuntimeRoleEntry(roleId, limit, dispatchableAssignments = []) {
  const role = describeRole(roleId);
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.owner === roleId || task.verifier === roleId);
  const inbox = taskInbox({ role: roleId, limit });
  const ownerNext = taskNext({ role: roleId, mode: "owner" });
  const verifierNext = taskNext({ role: roleId, mode: "verifier" });

  if (!role.exists && tasks.length === 0 && dispatchableAssignments.length === 0) {
    return null;
  }

  const nextAction = buildRuntimeRoleNextAction(roleId, ownerNext, verifierNext, dispatchableAssignments);

  return {
    role,
    counts: {
      total: tasks.length + dispatchableAssignments.length,
      ownerClaimable: tasks.filter((task) => task.owner === roleId && isClaimableTask(task)).length + dispatchableAssignments.length,
      ownerClaimed: tasks.filter((task) => task.owner === roleId && task.queueStatus === "claimed").length,
      ownerBlocked: tasks.filter((task) => task.owner === roleId && task.queueStatus === "blocked").length,
      pendingReview: tasks.filter((task) => task.verifier === roleId && task.queueStatus === "ready_for_review").length,
      completed: tasks.filter((task) => task.queueStatus === "done").length,
      dispatchableAssignments: dispatchableAssignments.length
    },
    ownerNext,
    verifierNext,
    nextAction,
    tasks: inbox?.tasks ?? [],
    assignments: dispatchableAssignments,
    summary: buildRuntimeRoleEntrySummary(role, tasks, dispatchableAssignments, nextAction)
  };
}

function buildRuntimeRoleNextAction(roleId, ownerNext, verifierNext, dispatchableAssignments = []) {
  if (verifierNext?.candidate) {
    return {
      lane: "verifier",
      task: verifierNext.candidate,
      command: `node ./src/index.js task:next --role ${roleId} --mode verifier`,
      reason: `Verifier lane can decide ${verifierNext.candidate.id} next.`
    };
  }

  if (ownerNext?.candidate) {
    return {
      lane: "owner",
      task: ownerNext.candidate,
      command: `node ./src/index.js task:next --role ${roleId} --mode owner`,
      reason: `Owner lane can move ${ownerNext.candidate.id} next.`
    };
  }

  const assignment = dispatchableAssignments[0] ?? null;
  if (assignment) {
    return {
      lane: "dispatch",
      task: {
        id: assignment.taskId,
        lane: assignment.lane,
        swarmId: assignment.swarmId,
        owner: assignment.owner?.id ?? assignment.owner?.name ?? roleId,
        verifier: assignment.verifier?.id ?? assignment.verifier?.name ?? null,
        queueStatus: assignment.taskQueueStatus,
        recommendedAction: assignment.recommendedNextAction,
        summary: assignment.summary
      },
      command: assignment.recommendedCommands?.[0] ?? `node ./src/index.js leader:assignments`,
      reason: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId} to ${roleId}.`
    };
  }

  return {
    lane: "idle",
    task: null,
    command: null,
    reason: `Role ${roleId} has no immediate owner or verifier work.`
  };
}

function buildRuntimeRoleEntrySummary(role, tasks, dispatchableAssignments, nextAction) {
  const total = tasks.length + dispatchableAssignments.length;
  const pendingReview = tasks.filter((task) => task.verifier === role.id && task.queueStatus === "ready_for_review").length;
  const ownerBlocked = tasks.filter((task) => task.owner === role.id && task.queueStatus === "blocked").length;
  const ownerClaimable = tasks.filter((task) => task.owner === role.id && isClaimableTask(task)).length + dispatchableAssignments.length;
  if (total === 0) {
    return `Role ${role.id ?? role.name ?? "unknown"} has no tracked work right now.`;
  }

  if (pendingReview > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} has verifier pressure; ${nextAction.task.id} is the next review target.`;
  }

  if (ownerBlocked > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} has blocked owner work and should unblock ${nextAction.task.id} first.`;
  }

  if (ownerClaimable > 0 && nextAction.task?.lane && nextAction.lane === "dispatch") {
    return `Role ${role.id ?? role.name ?? "unknown"} has dispatchable lane work; ${nextAction.task.lane} from ${nextAction.task.swarmId} is ready.`;
  }

  if (ownerClaimable > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} can claim ${nextAction.task.id} next.`;
  }

  if (nextAction.task?.id || nextAction.task?.lane) {
    return `Role ${role.id ?? role.name ?? "unknown"} is tracking ${total} work item${total === 1 ? "" : "s"}; ${nextAction.task.id ?? nextAction.task.lane} is next.`;
  }

  return `Role ${role.id ?? role.name ?? "unknown"} is tracking ${total} work item${total === 1 ? "" : "s"}.`;
}

function buildRuntimeRolesSummary(roles, next) {
  if (roles.length === 0) {
    return "Runtime roles has no shipped roles to inspect.";
  }

  if (!next) {
    return `Runtime roles is tracking ${roles.length} role${roles.length === 1 ? "" : "s"}.`;
  }

  if (next.counts.pendingReview > 0) {
    return `Runtime roles should look at ${next.role.id} first because verifier work is waiting.`;
  }
  if (next.counts.ownerBlocked > 0) {
    return `Runtime roles should look at ${next.role.id} first because blocked owner work is waiting.`;
  }
  if (next.counts.ownerClaimable > 0) {
    return `Runtime roles should look at ${next.role.id} first because claimable owner work is waiting.`;
  }
  if (next.counts.ownerClaimed > 0) {
    return `Runtime roles should look at ${next.role.id} first because active owner work is in flight.`;
  }

  return `Runtime roles is tracking ${roles.length} roles; ${next.role.id} is the next role to inspect.`;
}

function buildRuntimeDispatchSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime dispatch has no owner-grouped work ready right now.";
  }

  if (!next) {
    return `Runtime dispatch is tracking ${groups.length} owner group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime dispatch has ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId} is the next handoff.`;
}

function buildRuntimeReviewTaskEntry(task, position) {
  return {
    position,
    taskId: task.id,
    title: task.title,
    objective: task.objective,
    swarmId: task.swarmId,
    lane: task.lane,
    owner: describeRole(task.owner),
    claimedBy: task.claimedBy,
    updatedAt: task.updatedAt,
    recommendedNextActor: {
      type: "verifier_role",
      id: task.verifier,
      claimedBy: null
    },
    recommendedNextAction: "review_and_decide",
    recommendedCommands: [
      `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`,
      `node ./src/index.js task:reject --id ${task.id} --by ${task.verifier ?? "<verifier-role>"} --status claimed --notes "<changes requested>"`
    ],
    taskBrief: taskBrief(task.id),
    summary: `Review ${task.id} for verifier ${task.verifier ?? "unknown"}.`
  };
}

function compareRuntimeReviewGroups(left, right) {
  if (right.count !== left.count) {
    return right.count - left.count;
  }
  return (left.verifier?.id ?? left.verifier?.name ?? "").localeCompare(right.verifier?.id ?? right.verifier?.name ?? "");
}

function buildRuntimeReviewSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime review has no verifier-grouped work ready right now.";
  }

  if (!next) {
    return `Runtime review is tracking ${groups.length} verifier group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime review has ${groups.length} verifier group${groups.length === 1 ? "" : "s"}; ${next.taskId} is the next review decision.`;
}

function buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles) {
  return {
    dashboard: {
      blockedTasks: dashboard?.counts?.blockedTasks ?? 0,
      pendingReview: dashboard?.counts?.pendingReview ?? 0,
      activeClaimed: dashboard?.counts?.activeClaimed ?? 0,
      leaderQueueItems: dashboard?.counts?.leaderQueueItems ?? 0
    },
    alerts: alerts?.counts ?? { total: 0, high: 0, medium: 0 },
    review: review?.counts ?? { verifierGroups: 0, totalPendingReview: 0 },
    dispatch: dispatch?.counts ?? { ownerGroups: 0, totalAssignments: 0 },
    roles: roles?.counts ?? {
      totalRoles: 0,
      withPendingReview: 0,
      withBlockedOwnerWork: 0,
      withClaimableOwnerWork: 0,
      withActiveOwnerWork: 0,
      totalPendingReview: 0,
      totalBlockedOwnerWork: 0,
      totalClaimableOwnerWork: 0
    }
  };
}

function buildRuntimeFocusSummary(type, detail) {
  if (type === "blocked_task") {
    return `Runtime focus is blocked-task first: ${detail}`;
  }
  if (type === "review_task") {
    return `Runtime focus is review-first: ${detail}`;
  }
  if (type === "dispatch_lane") {
    return `Runtime focus is dispatch-first: ${detail}`;
  }
  if (type === "role_pressure") {
    return `Runtime focus is role-pressure-first: ${detail}`;
  }
  if (type === "leader_queue_item") {
    return `Runtime focus is leader-queue-first: ${detail}`;
  }
  return detail;
}

function buildRuntimeActivityEntry(task, event) {
  return {
    at: event.at,
    type: event.type,
    taskId: task.id,
    title: task.title,
    owner: task.owner,
    verifier: task.verifier,
    swarmId: task.swarmId,
    lane: task.lane,
    actor: event.actor,
    fromQueueStatus: event.fromQueueStatus,
    toQueueStatus: event.toQueueStatus,
    outcome: event.outcome,
    notes: event.notes,
    recommendedNextActor: taskBrief(task.id)?.recommendedNextActor ?? null,
    recommendedNextAction: taskBrief(task.id)?.recommendedNextAction ?? null,
    recommendedCommands: taskBrief(task.id)?.recommendedCommands ?? [],
    summary: buildRuntimeActivityEventSummary(task, event)
  };
}

function buildRuntimeActivityEventSummary(task, event) {
  if (event.type === "blocked") {
    return `Task ${task.id} was blocked by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "ready_for_review") {
    return `Task ${task.id} is now waiting on verifier ${task.verifier ?? "unknown"}.`;
  }
  if (event.type === "approved") {
    return `Task ${task.id} was approved by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "changes_requested") {
    return `Task ${task.id} received requested changes from ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "claimed") {
    return `Task ${task.id} was claimed by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "released") {
    return `Task ${task.id} was released back to the queue.`;
  }
  return `Task ${task.id} recorded event ${event.type}.`;
}

function compareRuntimeActivityEntries(left, right) {
  const byTime = (right.at ?? "").localeCompare(left.at ?? "");
  if (byTime !== 0) {
    return byTime;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

function buildRuntimeActivitySummary(entries, next) {
  if (entries.length === 0) {
    return "Runtime activity has no recorded task events yet.";
  }

  if (!next) {
    return `Runtime activity is tracking ${entries.length} recent event${entries.length === 1 ? "" : "s"}.`;
  }

  return `Runtime activity is led by ${next.type} on ${next.taskId}.`;
}

function buildRuntimeHandoffEntry(task) {
  const brief = taskBrief(task.id);
  return {
    taskId: task.id,
    title: task.title,
    queueStatus: task.queueStatus,
    handoffType: runtimeHandoffType(task),
    owner: task.owner,
    verifier: task.verifier,
    claimedBy: task.claimedBy,
    swarmId: task.swarmId,
    lane: task.lane,
    actor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    taskBrief: brief,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeHandoffEntrySummary(task)
  };
}

function runtimeHandoffType(task) {
  if (task.queueStatus === "ready_for_review") {
    return "verifier_decision";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery";
  }
  return "owner_claim";
}

function buildRuntimeHandoffEntrySummary(task) {
  if (task.queueStatus === "ready_for_review") {
    return `Task ${task.id} is ready for verifier ${task.verifier ?? "unknown"} to decide.`;
  }
  if (task.queueStatus === "blocked") {
    return `Task ${task.id} is blocked and needs owner-side recovery before it can move again.`;
  }
  if (task.queueStatus === "released") {
    return `Task ${task.id} was released and is ready for a new owner pickup.`;
  }
  return `Task ${task.id} is queued and ready for owner pickup.`;
}

function runtimeHandoffActorKey(actor) {
  return [
    actor?.type ?? "unknown",
    actor?.id ?? "unknown",
    actor?.claimedBy ?? ""
  ].join(":");
}

function compareRuntimeHandoffEntries(left, right) {
  const leftRank = runtimeHandoffPriority(left);
  const rightRank = runtimeHandoffPriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }

  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

function compareRuntimeHandoffGroups(left, right) {
  const leftRank = runtimeHandoffPriority(left.handoffs?.[0] ?? {});
  const rightRank = runtimeHandoffPriority(right.handoffs?.[0] ?? {});
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  if ((right.count ?? 0) !== (left.count ?? 0)) {
    return (right.count ?? 0) - (left.count ?? 0);
  }
  return (left.actor?.id ?? left.actor?.name ?? "").localeCompare(right.actor?.id ?? right.actor?.name ?? "");
}

function runtimeHandoffPriority(entry) {
  if (entry.handoffType === "verifier_decision") {
    return 0;
  }
  if (entry.handoffType === "blocked_recovery") {
    return 1;
  }
  if (entry.handoffType === "owner_claim") {
    return 2;
  }
  return 3;
}

function buildRuntimeHandoffsSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime handoffs have no queued, blocked, or review-ready transfers right now.";
  }

  if (!next) {
    return `Runtime handoffs are tracking ${groups.length} next-actor group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime handoffs should route ${next.taskId} to ${next.actor?.id ?? "the next actor"} first.`;
}

function buildRuntimeCloseoutTaskEntry(task) {
  const report = taskReport(task.id);
  return {
    kind: "task",
    taskId: task.id,
    title: task.title,
    owner: task.owner,
    verifier: task.verifier,
    swarmId: task.swarmId,
    lane: task.lane,
    reviewOutcome: task.reviewOutcome,
    reviewedBy: task.reviewedBy,
    reviewedAt: task.reviewedAt,
    report,
    command: report?.closure?.nextGate?.command ?? null,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeCloseoutTaskSummary(task)
  };
}

function buildRuntimeCloseoutTaskSummary(task) {
  if (task.reviewOutcome === "approved") {
    return `Task ${task.id} was approved and is ready for final archive or handoff.`;
  }
  return `Task ${task.id} is done and ready for closeout packaging.`;
}

function buildRuntimeCloseoutSwarmEntry(overview) {
  const closeout = swarmCloseout(overview.swarm.id);
  return {
    kind: "swarm",
    swarmId: overview.swarm.id,
    objective: overview.swarm.objective,
    owner: overview.swarm.owner,
    counts: overview.counts,
    derivedStatus: overview.derivedStatus,
    closeout,
    command: closeout?.command ?? null,
    updatedAt: overview.swarm.updatedAt ?? null,
    summary: closeout?.summary ?? `Swarm ${overview.swarm.id} is ready for closeout.`
  };
}

function compareRuntimeCloseoutTasks(left, right) {
  const approvedLeft = left.reviewOutcome === "approved" ? 0 : 1;
  const approvedRight = right.reviewOutcome === "approved" ? 0 : 1;
  if (approvedLeft !== approvedRight) {
    return approvedLeft - approvedRight;
  }
  const byReviewedAt = (right.reviewedAt ?? "").localeCompare(left.reviewedAt ?? "");
  if (byReviewedAt !== 0) {
    return byReviewedAt;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

function compareRuntimeCloseoutSwarms(left, right) {
  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }
  return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
}

function chooseRuntimeCloseoutNext(nextTask, nextSwarm) {
  if (nextTask && nextTask.reviewOutcome === "approved") {
    return nextTask;
  }
  if (nextSwarm) {
    return nextSwarm;
  }
  return nextTask ?? null;
}

function buildRuntimeCloseoutSummary(tasks, swarms, next) {
  if (tasks.length === 0 && swarms.length === 0) {
    return "Runtime closeout has no finished tasks or swarms waiting on final closure.";
  }

  if (!next) {
    return `Runtime closeout is tracking ${tasks.length + swarms.length} finished artifact${tasks.length + swarms.length === 1 ? "" : "s"}.`;
  }

  if (next.kind === "task") {
    return `Runtime closeout should package ${next.taskId} first.`;
  }

  return `Runtime closeout should finish swarm ${next.swarmId} first.`;
}

function isRuntimeRecoveryTask(task) {
  if (task.queueStatus === "blocked" || task.queueStatus === "released") {
    return true;
  }
  return task.reviewOutcome === "changes_requested" && task.queueStatus !== "ready_for_review" && task.queueStatus !== "done";
}

function buildRuntimeRecoveryEntry(task) {
  const brief = taskBrief(task.id);
  return {
    taskId: task.id,
    title: task.title,
    queueStatus: task.queueStatus,
    reviewOutcome: task.reviewOutcome,
    owner: task.owner,
    verifier: task.verifier,
    claimedBy: task.claimedBy,
    swarmId: task.swarmId,
    lane: task.lane,
    recoveryType: runtimeRecoveryType(task),
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    taskBrief: brief,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeRecoveryEntrySummary(task)
  };
}

function runtimeRecoveryType(task) {
  if (task.queueStatus === "blocked") {
    return "blocked_recovery";
  }
  if (task.queueStatus === "released") {
    return "released_repickup";
  }
  return "changes_requested";
}

function buildRuntimeRecoveryEntrySummary(task) {
  if (task.queueStatus === "blocked") {
    return `Task ${task.id} is blocked and needs unblock work before it can continue.`;
  }
  if (task.queueStatus === "released") {
    return `Task ${task.id} was released and needs a fresh owner pickup.`;
  }
  return `Task ${task.id} came back with requested changes and needs another execution pass.`;
}

function compareRuntimeRecoveryEntries(left, right) {
  const leftRank = runtimeRecoveryPriority(left);
  const rightRank = runtimeRecoveryPriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

function compareRuntimeRecoveryGroups(left, right) {
  const leftRank = runtimeRecoveryPriority(left.next ?? {});
  const rightRank = runtimeRecoveryPriority(right.next ?? {});
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  if ((right.count ?? 0) !== (left.count ?? 0)) {
    return (right.count ?? 0) - (left.count ?? 0);
  }
  return (left.recoveryType ?? "").localeCompare(right.recoveryType ?? "");
}

function runtimeRecoveryPriority(entry) {
  if (entry.recoveryType === "blocked_recovery") {
    return 0;
  }
  if (entry.recoveryType === "changes_requested") {
    return 1;
  }
  if (entry.recoveryType === "released_repickup") {
    return 2;
  }
  return 3;
}

function buildRuntimeRecoverySummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime recovery has no blocked, released, or change-requested tasks right now.";
  }

  if (!next) {
    return `Runtime recovery is tracking ${groups.length} recovery group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime recovery should start with ${next.taskId} in ${next.recoveryType}.`;
}

function deriveRuntimeSummaryPackSurface({ focus, recovery, closeout, handoffs, dashboard }) {
  if (focus?.focus?.type === "blocked_task") {
    return "runtime:focus";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  return "runtime:focus";
}

function buildRuntimeSummaryPackSummary(recommendedSurface, focus) {
  const detail = focus?.summary ?? "Runtime summary pack has no current focus detail.";
  return `Runtime summary pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0 || (handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "runtime:alerts";
  }
  if ((dashboard?.counts?.tasks ?? 0) > 0 || (dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  return "runtime:focus";
}

function buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    "Runtime operator pack has no current operator detail.";
  return `Runtime operator pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeDispatchPackSurface({ dispatch, roles, handoffs }) {
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return "runtime:roles";
  }
  return "runtime:dispatch";
}

function buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, handoffs, roles) {
  const detail =
    dispatch?.summary ??
    handoffs?.summary ??
    roles?.summary ??
    "Runtime dispatch pack has no current dispatch detail.";
  return `Runtime dispatch pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus }) {
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0 || (handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "runtime:focus";
  }
  return "runtime:recovery";
}

function buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus) {
  const detail =
    recovery?.summary ??
    focus?.summary ??
    "Runtime recovery pack has no current recovery detail.";
  return `Runtime recovery pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "runtime:summary-pack";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "runtime:leader-pack";
  }
  return "runtime:closeout";
}

function buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack) {
  const detail =
    closeout?.summary ??
    summaryPack?.summary ??
    "Runtime closeout pack has no current closure detail.";
  return `Runtime closeout pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeReviewPackSurface({ review, roles, verifierPack }) {
  if (verifierPack?.recommendedSurface) {
    return "runtime:verifier-pack";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return "runtime:roles";
  }
  return "runtime:review";
}

function buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles) {
  const detail =
    verifierPack?.summary ??
    review?.summary ??
    roles?.summary ??
    "Runtime review pack has no current verifier-control detail.";
  return `Runtime review pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeQueuePackSurface({ queue, dashboard, focus }) {
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader:queue";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  if (focus?.focus?.type === "leader_queue_item") {
    return "runtime:focus";
  }
  return "leader:queue";
}

function buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard) {
  const detail =
    queue?.summary ??
    focus?.summary ??
    dashboard?.summary ??
    "Runtime queue pack has no current queue detail.";
  return `Runtime queue pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeWorkspacePackSurface({ dashboard, dispatch, review, recovery }) {
  if ((dashboard?.counts?.blockedTasks ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  return "runtime:dashboard";
}

function buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, review, recovery) {
  const detail =
    dashboard?.summary ??
    dispatch?.summary ??
    review?.summary ??
    recovery?.summary ??
    "Runtime workspace pack has no current orchestration detail.";
  return `Runtime workspace pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return "runtime:summary-pack";
  }
  if (workspacePack?.recommendedSurface) {
    return "runtime:workspace-pack";
  }
  if (operatorPack?.recommendedSurface) {
    return "runtime:operator-pack";
  }
  if (leaderPack?.recommendedSurface) {
    return "runtime:leader-pack";
  }
  return "runtime:summary-pack";
}

function buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack) {
  const detail =
    summaryPack?.summary ??
    workspacePack?.summary ??
    operatorPack?.summary ??
    leaderPack?.summary ??
    "Runtime control pack has no current control detail.";
  return `Runtime control pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((alerts?.counts?.high ?? 0) > 0 || (alerts?.counts?.medium ?? 0) > 0) {
    return "runtime:alerts";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0 || (roles?.counts?.withBlockedOwnerWork ?? 0) > 0) {
    return "runtime:roles";
  }
  if ((activity?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:activity";
  }
  return "runtime:focus";
}

function buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    roles?.summary ??
    activity?.summary ??
    "Runtime signal pack has no current signal detail.";
  return `Runtime signal pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery }) {
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  return "runtime:handoffs";
}

function buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch) {
  const detail =
    handoffs?.summary ??
    review?.summary ??
    recovery?.summary ??
    dispatch?.summary ??
    "Runtime handoff pack has no current transfer detail.";
  return `Runtime handoff pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((alerts?.counts?.high ?? 0) > 0 || (alerts?.counts?.medium ?? 0) > 0) {
    return "runtime:alerts";
  }
  return "runtime:focus";
}

function buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery) {
  const detail =
    focus?.summary ??
    recovery?.summary ??
    review?.summary ??
    alerts?.summary ??
    "Runtime triage pack has no current triage detail.";
  return `Runtime triage pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeSessionPackSurface({ workerPack, ownerPack, verifierPack, roleEntry, role, workerId }) {
  if (workerPack?.recommendedSurface && workerPack.recommendedSurface !== "worker:session") {
    return workerPack.recommendedSurface;
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return ownerPack.recommendedSurface;
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return verifierPack.recommendedSurface;
  }
  if (verifierPack?.next?.review?.taskId || (roleEntry?.counts?.pendingReview ?? 0) > 0) {
    return `task:next --role ${role} --mode verifier`;
  }
  if (ownerPack?.next?.candidate?.id || workerPack?.next?.candidate?.id || (roleEntry?.counts?.ownerClaimable ?? 0) > 0) {
    return `task:pickup --role ${role} --worker ${workerId}`;
  }
  if (workerPack?.recommendedSurface) {
    return workerPack.recommendedSurface;
  }
  return "worker:session";
}

function buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry) {
  const detail =
    workerPack?.summary ??
    ownerPack?.summary ??
    verifierPack?.summary ??
    roleEntry?.summary ??
    "Runtime session pack has no current session detail.";
  return `Runtime session pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeRolePackSurface({ roleEntry, sessionPack, ownerPack, verifierPack }) {
  if (sessionPack?.recommendedSurface && sessionPack.recommendedSurface !== "worker:session") {
    return sessionPack.recommendedSurface;
  }
  if (roleEntry?.nextAction?.command) {
    return roleEntry.nextAction.command;
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return verifierPack.recommendedSurface;
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return ownerPack.recommendedSurface;
  }
  if (sessionPack?.recommendedSurface) {
    return sessionPack.recommendedSurface;
  }
  return "runtime:roles";
}

function buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack) {
  const detail =
    sessionPack?.summary ??
    verifierPack?.summary ??
    ownerPack?.summary ??
    roleEntry?.summary ??
    "Runtime role pack has no current role detail.";
  return `Runtime role pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeExecutionPackSurface({ focus, dispatch, roles, queuePack }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task" || focus?.focus?.type === "dispatch_lane") {
    return "runtime:focus";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((roles?.counts?.withClaimableOwnerWork ?? 0) > 0 || (roles?.counts?.withActiveOwnerWork ?? 0) > 0) {
    return "runtime:roles";
  }
  if ((queuePack?.overview?.queue?.total ?? 0) > 0) {
    return "leader:queue";
  }
  return "runtime:focus";
}

function buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, roles, queuePack) {
  const detail =
    focus?.summary ??
    dispatch?.summary ??
    roles?.summary ??
    queuePack?.summary ??
    "Runtime execution pack has no current execution detail.";
  return `Runtime execution pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimePickupPackSurface({ session, pickup, next, rolePack, role, workerId, mode }) {
  if (pickup?.outcome === "claimable") {
    return `task:pickup --role ${role} --worker ${workerId} --mode ${mode}`;
  }
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (pickup?.command) {
    return pickup.command.replace("node ./src/index.js ", "");
  }
  if (next?.candidate?.id) {
    return "task:next";
  }
  return rolePack?.recommendedSurface ?? "worker:session";
}

function buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next) {
  const detail =
    pickup?.outcome === "claimable"
      ? `Worker can claim ${pickup.candidate?.id} now.`
      : session?.focus?.reason
        ? session.focus.reason
        : next?.candidate?.id
          ? `Next visible candidate is ${next.candidate.id}.`
          : "worker has no immediate pickup target.";

  return `Runtime pickup pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeAssignmentPackSurface({ assignment, session, next, pickup, roleEntry, role, workerId, mode }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (assignment?.taskId) {
    const suffix = mode ? ` --mode ${mode}` : "";
    return `task:assignment-pickup --role ${role} --worker ${workerId}${suffix}`;
  }
  if (pickup?.outcome === "claimable") {
    return `task:pickup --role ${role} --worker ${workerId} --mode ${mode}`;
  }
  if (pickup?.command) {
    return pickup.command.replace("node ./src/index.js ", "");
  }
  if (next?.candidate?.id) {
    return "task:next";
  }
  if (roleEntry?.nextAction?.command) {
    return roleEntry.nextAction.command.replace("node ./src/index.js ", "");
  }
  return "leader:assignments";
}

function buildRuntimeAssignmentPackSummary(recommendedSurface, assignment, session, pickup, next, roleAssignments) {
  if (assignment?.taskId && next?.candidate?.id !== assignment.taskId) {
    return `Runtime assignment pack recommends ${recommendedSurface} next. Leader has assignment ${assignment.taskId} ready for this worker.`;
  }

  const detail =
    session?.focus?.reason ??
    (pickup?.outcome === "claimable" ? `Worker can claim ${pickup.candidate?.id} now.` : null) ??
    (pickup?.candidate?.id ? `Worker should move ${pickup.candidate.id} next.` : null) ??
    (roleAssignments?.count ? `Role has ${roleAssignments.count} leader assignment${roleAssignments.count === 1 ? "" : "s"} queued.` : null) ??
    "worker has no immediate assignment handoff.";

  return `Runtime assignment pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, closeout }) {
  if ((workspace?.counts?.pendingReview ?? 0) > 0 || (queue?.next?.recommendedNextAction ?? "").startsWith("review_lane:")) {
    return "leader:workspace";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader:queue";
  }
  return "leader:workspace";
}

function buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue) {
  if (!workspace?.focus && !(queue?.counts?.total > 0)) {
    return `Runtime leader pack recommends ${recommendedSurface}; there is no active leader orchestration target right now.`;
  }

  return `Runtime leader pack recommends ${recommendedSurface} next. ${workspace?.summary ?? queue?.summary ?? ""}`.trim();
}

function deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role, workerId }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (handoff?.currentTask?.id) {
    return "worker:closeout";
  }
  if (next?.candidate?.id) {
    return `task:pickup --role ${role} --worker ${workerId} --mode owner`;
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}

function buildRuntimeOwnerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "owner has no current execution detail.";
  return `Runtime owner pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (handoff?.currentTask?.id) {
    return "worker:handoff";
  }
  if (next?.candidate?.id) {
    return "task:pickup";
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}

function buildRuntimeWorkerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "worker has no current focus detail.";
  return `Runtime worker pack recommends ${recommendedSurface} next. ${detail}`;
}

function deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role }) {
  if (bundle?.currentTask?.id || closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  if (review?.next?.taskId) {
    return "runtime:review";
  }
  if (next?.candidate?.id) {
    return `task:next --role ${role} --mode verifier`;
  }
  return "runtime:review";
}

function buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review) {
  const detail = bundle?.summary ?? review?.summary ?? "verifier has no current decision detail.";
  return `Runtime verifier pack recommends ${recommendedSurface} next. ${detail}`;
}

function compareRuntimeRoleEntries(left, right) {
  const leftRank = runtimeRolePriority(left);
  const rightRank = runtimeRolePriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (left.role?.id ?? "").localeCompare(right.role?.id ?? "");
}

function runtimeRolePriority(entry) {
  if (entry.counts.pendingReview > 0) {
    return 0;
  }
  if (entry.counts.ownerBlocked > 0) {
    return 1;
  }
  if (entry.counts.ownerClaimable > 0) {
    return 2;
  }
  if (entry.counts.ownerClaimed > 0) {
    return 3;
  }
  if (entry.counts.total > 0) {
    return 4;
  }
  return 5;
}

function buildLeaderWorkspaceSwarmEntry(overview) {
  const brief = swarmBrief(overview.swarm.id);
  return {
    id: overview.swarm.id,
    objective: overview.swarm.objective,
    topology: overview.swarm.topology,
    status: overview.swarm.status,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    owner: overview.swarm.owner,
    laneSource: overview.swarm.laneSource,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    nextLane: overview.nextLane,
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    leaderHandoff: brief?.leaderHandoff ?? null,
    summary: buildSwarmBundleSummary(overview, overview.lanes),
    updatedAt: overview.swarm.updatedAt ?? null
  };
}

function buildLeaderWorkspaceSummary(swarmEntries, focusEntry) {
  if (swarmEntries.length === 0) {
    return "Leader workspace has no tracked swarms yet.";
  }

  if (!focusEntry) {
    return `Leader workspace is tracking ${swarmEntries.length} swarm${swarmEntries.length === 1 ? "" : "s"}.`;
  }

  if (focusEntry.recommendedNextAction?.startsWith("review_lane:")) {
    return `Leader workspace should review ${focusEntry.id} first because a lane is waiting on verifier action.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return `Leader workspace should dispatch the next runnable lane from ${focusEntry.id}.`;
  }
  if (focusEntry.recommendedNextAction === "queue_swarm_lanes") {
    return `Leader workspace should queue planned lanes for ${focusEntry.id} next.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("continue_lane:")) {
    return `Leader workspace should monitor active execution in ${focusEntry.id} before starting more work.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("unblock_lane:")) {
    return `Leader workspace should resolve a blocked lane in ${focusEntry.id} next.`;
  }

  const activeSwarms = swarmEntries.filter((entry) => !["completed", "cancelled"].includes(entry.status)).length;
  if (activeSwarms === 0) {
    return `Leader workspace shows ${swarmEntries.length} closed swarm${swarmEntries.length === 1 ? "" : "s"} with no active coordination remaining.`;
  }

  return `Leader workspace is tracking ${swarmEntries.length} swarms; ${focusEntry.id} is the current focus.`;
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

function deriveWorkerCloseoutCommand(handoff, report) {
  if (!handoff.currentTask?.id) {
    return null;
  }

  if (handoff.focus?.kind === "active_task") {
    return `node ./src/index.js task:review --id ${handoff.currentTask.id} --by ${handoff.workerId}`;
  }
  if (handoff.focus?.kind === "review_task") {
    return `node ./src/index.js task:approve --id ${handoff.currentTask.id} --by ${handoff.role.id ?? handoff.role.name ?? "<verifier-role>"}`;
  }
  if (handoff.focus?.kind === "blocked_task") {
    return `node ./src/index.js task:release --id ${handoff.currentTask.id} --by ${handoff.workerId}`;
  }
  if (report?.closure?.closureReady) {
    return report.closure.nextGate?.command ?? null;
  }
  return handoff.nextCommand ?? null;
}

function buildWorkerCloseoutSummary(handoff, report) {
  if (!handoff.currentTask?.id) {
    return `Worker ${handoff.workerId} has no current closeout target.`;
  }
  if (report?.closure?.reviewOutcome === "approved") {
    return `Task ${handoff.currentTask.id} is approved and ready for final handoff or archive.`;
  }
  if (handoff.focus?.kind === "review_task") {
    return `Task ${handoff.currentTask.id} is awaiting verifier closeout by ${handoff.role.id ?? handoff.role.name}.`;
  }
  if (handoff.focus?.kind === "active_task") {
    return `Task ${handoff.currentTask.id} is still actively owned by ${handoff.workerId} and should be handed to review next.`;
  }
  if (handoff.focus?.kind === "blocked_task") {
    return `Task ${handoff.currentTask.id} is blocked and should be released or clarified before closeout.`;
  }
  return `Task ${handoff.currentTask.id} has a closeout bundle ready for the next actor.`;
}

function buildVerifierDecisionCommands(taskSummary, role) {
  if (!taskSummary?.id) {
    return {
      approve: null,
      rejectToClaimed: null,
      rejectToReleased: null
    };
  }

  return {
    approve: `node ./src/index.js task:approve --id ${taskSummary.id} --by ${role}`,
    rejectToClaimed: `node ./src/index.js task:reject --id ${taskSummary.id} --by ${role} --status claimed --notes "<changes requested>"`,
    rejectToReleased: `node ./src/index.js task:reject --id ${taskSummary.id} --by ${role} --status released --notes "<changes requested>"`
  };
}

function buildVerifierBundleSummary(taskSummary, role, workerId) {
  if (!taskSummary?.id) {
    return `Verifier ${workerId} has no pending review target.`;
  }

  return `Verifier ${workerId} (${role}) can decide ${taskSummary.id} now with approve or changes-requested actions.`;
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

function assignmentPickupOutcome(relation) {
  if (relation === "owner_claimable") {
    return "claimable";
  }
  return pickupOutcome(relation);
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

function assignmentFollowupCommand(candidate, workerId) {
  if (candidate.relation === "owner_claimable") {
    return `node ./src/index.js task:assignment-pickup --role ${candidate.owner} --worker ${workerId} --task ${candidate.id}`;
  }
  return pickupFollowupCommand(candidate, workerId);
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

function compareLeaderWorkspaceEntries(left, right) {
  const leftRank = leaderWorkspacePriority(left);
  const rightRank = leaderWorkspacePriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
}

function leaderWorkspacePriority(entry) {
  if (entry.recommendedNextAction?.startsWith("review_lane:")) {
    return 0;
  }
  if (entry.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return 1;
  }
  if (entry.recommendedNextAction === "queue_swarm_lanes") {
    return 2;
  }
  if (entry.recommendedNextAction?.startsWith("continue_lane:")) {
    return 3;
  }
  if (entry.recommendedNextAction?.startsWith("unblock_lane:")) {
    return 4;
  }
  if (entry.status === "completed") {
    return 5;
  }
  if (entry.status === "cancelled") {
    return 6;
  }
  return 7;
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
