export function buildTaskNextView(
  input,
  {
    normalizeNextMode,
    loadState,
    normalizeTask,
    sortNextCandidates,
    describeRole,
    summarizeInboxTask,
    taskBrief
  },
  {
    deriveTaskNextReason
  }
) {
  if (!input.role) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const tasks = loadState().tasks.map(normalizeTask);
  const candidates = sortNextCandidates(tasks, input.role, input.workerId, mode);
  const selected = candidates[0] ?? null;
  const candidate = selected ? summarizeInboxTask(selected, input.role, input.workerId) : null;

  return {
    kind: "next_task_candidate",
    role: describeRole(input.role),
    workerId: input.workerId ?? null,
    mode,
    recommendedReason: deriveTaskNextReason(candidate?.relation ?? null),
    candidate,
    brief: selected ? taskBrief(selected.id) : null
  };
}
export function buildTaskNextViewFromSources(
  input,
  {
    normalizeNextMode,
    loadState,
    normalizeTask,
    sortNextCandidates,
    describeRole,
    summarizeInboxTask,
    taskBrief
  },
  {
    deriveTaskNextReason,
    buildTaskNextView
  }
) {
  return buildTaskNextView(
    input,
    {
      normalizeNextMode,
      loadState,
      normalizeTask,
      sortNextCandidates,
      describeRole,
      summarizeInboxTask,
      taskBrief
    },
    {
      deriveTaskNextReason
    }
  );
}
export function buildTaskInboxView(
  input,
  {
    getRuntimeCatalog,
    loadState,
    normalizeTask,
    sortInboxTasks,
    summarizeInboxTask,
    taskNext,
    isClaimableTask,
    describeRole
  },
  {
    deriveTaskInboxReason
  }
) {
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

  const counts = {
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
  };

  const recommendedReason = deriveTaskInboxReason({ tasks: visibleTasks, next, counts });

  return {
    kind: "role_inbox",
    role: describeRole(input.role, catalog),
    workerId: input.workerId ?? null,
    recommendedReason,
    counts,
    tasks: visibleTasks,
    next
  };
}
export function buildTaskInboxViewFromSources(
  input,
  {
    getRuntimeCatalog,
    loadState,
    normalizeTask,
    sortInboxTasks,
    summarizeInboxTask,
    taskNext,
    isClaimableTask,
    describeRole
  },
  {
    deriveTaskInboxReason,
    buildTaskInboxView
  }
) {
  return buildTaskInboxView(
    input,
    {
      getRuntimeCatalog,
      loadState,
      normalizeTask,
      sortInboxTasks,
      summarizeInboxTask,
      taskNext,
      isClaimableTask,
      describeRole
    },
    {
      deriveTaskInboxReason
    }
  );
}
