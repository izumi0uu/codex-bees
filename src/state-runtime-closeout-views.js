import { buildRuntimeTaskIdentityFields } from "./state-runtime-task-entry-helpers.js";

export function buildRuntimeCloseoutTaskSummary(task) {
  if (task.reviewOutcome === "approved") {
    return `Task ${task.id} was approved and is ready for final archive.`;
  }
  return `Task ${task.id} is done and ready for archive.`;
}
export function buildRuntimeCloseoutTaskEntry(task, taskReport) {
  const report = taskReport(task.id);
  return {
    kind: "task",
    ...buildRuntimeTaskIdentityFields(task),
    reviewOutcome: task.reviewOutcome,
    reviewedBy: task.reviewedBy,
    reviewedAt: task.reviewedAt,
    report,
    command: report?.closure?.nextGate?.command ?? null,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeCloseoutTaskSummary(task)
  };
}
export function compareRuntimeCloseoutTasks(left, right) {
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
export function compareRuntimeCloseoutSwarms(left, right) {
  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }
  return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
}
export function chooseRuntimeCloseoutNext(nextTask, nextSwarm) {
  if (nextTask && nextTask.reviewOutcome === "approved") {
    return nextTask;
  }
  if (nextSwarm) {
    return nextSwarm;
  }
  return nextTask ?? null;
}
export function buildRuntimeCloseoutView(
  {
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  },
  {
    buildRuntimeCloseoutTaskEntry,
    compareRuntimeCloseoutTasks,
    buildRuntimeCloseoutSwarmEntry,
    compareRuntimeCloseoutSwarms,
    chooseRuntimeCloseoutNext,
    deriveRuntimeCloseoutReason,
    buildRuntimeCloseoutSummary
  }
) {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === "done" && !task.swarmId)
    .map((task) => buildRuntimeCloseoutTaskEntry(task, taskReport))
    .sort(compareRuntimeCloseoutTasks);
  const swarms = listSwarmOverviews()
    .filter((overview) => overview.readyToComplete || ["completed", "cancelled"].includes(overview?.swarm?.status))
    .map((overview) => buildRuntimeCloseoutSwarmEntry(overview, swarmCloseout))
    .sort(compareRuntimeCloseoutSwarms);
  const nextTask = tasks[0] ?? null;
  const nextSwarm = swarms[0] ?? null;
  const next = chooseRuntimeCloseoutNext(nextTask, nextSwarm);
  const recommendedReason = deriveRuntimeCloseoutReason({ tasks, swarms, next });

  return {
    kind: "runtime_closeout",
    recommendedReason,
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
export function buildRuntimeCloseoutViewFromState(
  {
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  },
  {
    buildRuntimeCloseoutTaskEntry,
    compareRuntimeCloseoutTasks,
    buildRuntimeCloseoutSwarmEntry,
    compareRuntimeCloseoutSwarms,
    chooseRuntimeCloseoutNext,
    deriveRuntimeCloseoutReason,
    buildRuntimeCloseoutSummary,
    buildRuntimeCloseoutView
  }
) {
  return buildRuntimeCloseoutView(
    {
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
    },
    {
      buildRuntimeCloseoutTaskEntry,
      compareRuntimeCloseoutTasks,
      buildRuntimeCloseoutSwarmEntry,
      compareRuntimeCloseoutSwarms,
      chooseRuntimeCloseoutNext,
      deriveRuntimeCloseoutReason,
      buildRuntimeCloseoutSummary
    }
  );
}
