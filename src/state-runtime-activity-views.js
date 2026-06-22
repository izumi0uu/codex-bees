export function buildRuntimeActivityEventSummary(task, event) {
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
export function buildRuntimeActivityEntry(task, event, taskBrief) {
  const brief = taskBrief(task.id);
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
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    summary: buildRuntimeActivityEventSummary(task, event)
  };
}
export function compareRuntimeActivityEntries(left, right) {
  const byTime = (right.at ?? "").localeCompare(left.at ?? "");
  if (byTime !== 0) {
    return byTime;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}
export function buildRuntimeActivityView(
  input,
  {
    loadState,
    normalizeTask,
    taskBrief,
    buildRuntimeActivityEntry,
    compareRuntimeActivityEntries,
    deriveRuntimeActivityReason,
    buildRuntimeActivitySummary
  }
) {
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const tasks = loadState().tasks.map(normalizeTask);
  const entries = tasks
    .flatMap((task) => (task.history ?? []).map((event) => buildRuntimeActivityEntry(task, event, taskBrief)))
    .sort(compareRuntimeActivityEntries)
    .slice(0, limit);
  const next = entries[0] ?? null;
  const recommendedReason = deriveRuntimeActivityReason({ entries, next });

  return {
    kind: "runtime_activity",
    recommendedReason,
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
export function buildRuntimeActivityViewFromState(
  input,
  {
    loadState,
    normalizeTask,
    taskBrief,
    buildRuntimeActivityEntry,
    compareRuntimeActivityEntries
  },
  {
    deriveRuntimeActivityReason,
    buildRuntimeActivitySummary,
    buildRuntimeActivityView
  }
) {
  return buildRuntimeActivityView(
    input,
    {
      loadState,
      normalizeTask,
      taskBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries,
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary
    }
  );
}
