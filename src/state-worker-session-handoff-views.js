export function buildSessionTaskSnapshot(task, role, workerId, summarizeInboxTask, taskBrief) {
  return {
    summary: summarizeInboxTask(task, role, workerId),
    brief: taskBrief(task.id),
    recentHistory: (task.history ?? []).slice(-5),
    recentAnnotations: (task.annotations ?? []).slice(-5)
  };
}

export function recommendWorkerSessionFocus(input) {
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

export function buildWorkerSessionView(
  input,
  {
    loadState,
    normalizeTask,
    normalizeNextMode,
    compareTasksByUpdatedAt,
    taskInbox,
    taskNext,
    recommendWorkerSessionFocus,
    deriveWorkerSessionReason,
    describeRole,
    buildSessionTaskSnapshot,
    summarizeInboxTask,
    taskBrief
  }
) {
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
  const recommendedReason = deriveWorkerSessionReason(focus, next);

  return {
    kind: "worker_session",
    role: describeRole(role),
    workerId,
    mode,
    recommendedReason,
    counts: {
      activeOwned: activeOwned.length,
      blockedOwned: blockedOwned.length,
      handoffsAwaitingReview: handoffsAwaitingReview.length,
      reviewQueue: reviewQueue.length
    },
    activeOwned: activeOwned.map((task) => buildSessionTaskSnapshot(task, role, workerId, summarizeInboxTask, taskBrief)),
    blockedOwned: blockedOwned.map((task) => buildSessionTaskSnapshot(task, role, workerId, summarizeInboxTask, taskBrief)),
    handoffsAwaitingReview: handoffsAwaitingReview.map((task) => buildSessionTaskSnapshot(task, role, workerId, summarizeInboxTask, taskBrief)),
    reviewQueue: reviewQueue.map((task) => buildSessionTaskSnapshot(task, role, workerId, summarizeInboxTask, taskBrief)),
    inbox,
    next,
    focus
  };
}

export function buildWorkerSessionViewFromSources(
  input,
  {
    loadState,
    normalizeTask,
    normalizeNextMode,
    compareTasksByUpdatedAt,
    taskInbox,
    taskNext,
    recommendWorkerSessionFocus,
    deriveWorkerSessionReason,
    describeRole,
    buildSessionTaskSnapshot,
    summarizeInboxTask,
    taskBrief
  },
  {
    buildWorkerSessionView
  }
) {
  return buildWorkerSessionView(
    input,
    {
      loadState,
      normalizeTask,
      normalizeNextMode,
      compareTasksByUpdatedAt,
      taskInbox,
      taskNext,
      recommendWorkerSessionFocus,
      deriveWorkerSessionReason,
      describeRole,
      buildSessionTaskSnapshot,
      summarizeInboxTask,
      taskBrief
    }
  );
}

export function buildWorkerHandoffSummary(session, focusTaskSnapshot) {
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

export function buildWorkerHandoffView(
  input,
  {
    workerSession,
    deriveWorkerHandoffReason,
    buildWorkerHandoffSummary
  }
) {
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
  const recommendedReason = deriveWorkerHandoffReason(session, focusTaskSnapshot);

  return {
    kind: "worker_handoff",
    role: session.role,
    workerId: session.workerId,
    mode: session.mode,
    recommendedReason,
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

export function buildWorkerHandoffViewFromSources(
  input,
  {
    workerSession,
    deriveWorkerHandoffReason,
    buildWorkerHandoffSummary
  },
  {
    buildWorkerHandoffView
  }
) {
  return buildWorkerHandoffView(
    input,
    {
      workerSession,
      deriveWorkerHandoffReason,
      buildWorkerHandoffSummary
    }
  );
}

