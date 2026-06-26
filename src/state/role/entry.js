import { annotateTasksWithDependencyState } from "../task/core.js";
import { buildRuntimeRoleNextAction } from "./next-action.js";

export function buildRuntimeRoleEntrySummary(role, tasks, dispatchableAssignments, nextAction, isClaimableTask) {
  const total = tasks.length + dispatchableAssignments.length;
  const pendingReview = tasks.filter((task) => task.verifier === role.id && task.queueStatus === "ready_for_review").length;
  const ownerBlocked = tasks.filter((task) => task.owner === role.id && task.queueStatus === "blocked").length;
  const ownerClaimable = tasks.filter((task) => task.owner === role.id && isClaimableTask(task)).length + dispatchableAssignments.length;
  const ownerWaitingOnDependencies = tasks.filter(
    (task) =>
      task.owner === role.id &&
      (task.queueStatus === "queued" || task.queueStatus === "released") &&
      task.dependencyReady === false
  ).length;
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

  if (ownerWaitingOnDependencies > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} has dependency-gated owner work; ${nextAction.task.id} is waiting on prerequisite completion.`;
  }

  if (nextAction.task?.id || nextAction.task?.lane) {
    return `Role ${role.id ?? role.name ?? "unknown"} is tracking ${total} work item${total === 1 ? "" : "s"}; ${nextAction.task.id ?? nextAction.task.lane} is next.`;
  }

  return `Role ${role.id ?? role.name ?? "unknown"} is tracking ${total} work item${total === 1 ? "" : "s"}.`;
}

export function buildRuntimeRoleEntry(roleId, limit, dispatchableAssignments, deps) {
  const {
    describeRole,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext,
    isClaimableTask
  } = deps;

  const role = describeRole(roleId);
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask))
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
      ownerWaitingOnDependencies: tasks.filter(
        (task) =>
          task.owner === roleId &&
          (task.queueStatus === "queued" || task.queueStatus === "released") &&
          task.dependencyReady === false
      ).length,
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
    summary: buildRuntimeRoleEntrySummary(role, tasks, dispatchableAssignments, nextAction, isClaimableTask)
  };
}
