import { buildSwarmOverviewStatusFields } from "./overview-status-helpers.js";

export function buildRuntimeCloseoutSwarmEntry(overview, swarmCloseout) {
  const closeout = swarmCloseout(overview.swarm.id);
  return {
    kind: "swarm",
    swarmId: overview.swarm.id,
    objective: overview.swarm.objective,
    owner: overview.swarm.owner,
    counts: overview.counts,
    ...buildSwarmOverviewStatusFields(overview),
    closeout,
    command: closeout?.command ?? null,
    updatedAt: overview.swarm.updatedAt ?? null,
    summary: closeout?.summary ?? `Swarm ${overview.swarm.id} is ready for closeout.`
  };
}

export function buildRuntimeCloseoutSummary(tasks, swarms, next) {
  if (tasks.length === 0 && swarms.length === 0) {
    return "Runtime closeout has no finished tasks or swarms waiting on final archive.";
  }

  if (!next) {
    return `Runtime closeout is tracking ${tasks.length + swarms.length} finished artifact${tasks.length + swarms.length === 1 ? "" : "s"} ready for archive.`;
  }

  if (next.kind === "task") {
    return `Runtime closeout should archive task ${next.taskId} first.`;
  }

  if (next.command?.includes("swarm:archive")) {
    return `Runtime closeout should archive swarm ${next.swarmId} first.`;
  }

  return `Runtime closeout should finish swarm ${next.swarmId} first.`;
}

export function deriveLeaderWorkspaceReason({ swarmEntries, focusEntry }) {
  if (focusEntry?.recommendedNextAction?.startsWith("review_lane:")) {
    return "review_focus_priority";
  }
  if (focusEntry?.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return "dispatch_focus_priority";
  }
  if (focusEntry?.recommendedNextAction === "queue_swarm_lanes") {
    return "queue_focus_priority";
  }
  if (focusEntry?.recommendedNextAction === "complete" || focusEntry?.readyToComplete) {
    return "closeout_focus_priority";
  }
  if (focusEntry?.recommendedNextAction?.startsWith("continue_lane:")) {
    return "active_execution_focus";
  }
  if (focusEntry?.recommendedNextAction?.startsWith("unblock_lane:")) {
    return "blocked_focus_priority";
  }
  if (focusEntry?.id) {
    return "tracked_swarm_focus";
  }
  if ((swarmEntries?.length ?? 0) > 0) {
    return "tracked_swarms_visible";
  }
  return "no_swarms_tracked";
}

export function deriveRuntimeCloseoutReason({ tasks, swarms, next }) {
  if (next?.kind === "task" && next?.reviewOutcome === "approved") {
    return "approved_task_ready";
  }
  if (next?.kind === "task") {
    return "task_closeout_ready";
  }
  if (next?.kind === "swarm") {
    return "swarm_closeout_ready";
  }
  if (((tasks?.length ?? 0) + (swarms?.length ?? 0)) > 0) {
    return "closeout_items_visible";
  }
  return "no_closeout_ready";
}
