import { buildPurposeGuidanceForTaskLike } from "../../state-lane-purpose.js";

export function buildSessionTaskSnapshot(task, role, workerId, summarizeInboxTask, taskBrief) {
  const summary = summarizeInboxTask(task, role, workerId);
  const brief = taskBrief(task.id);
  return {
    summary,
    brief,
    purposeGuidance: buildPurposeGuidanceForTaskLike(summary ?? brief?.coordination ?? task),
    recentHistory: (task.history ?? []).slice(-5),
    recentAnnotations: (task.annotations ?? []).slice(-5)
  };
}

function buildFocusPayload(kind, taskLike, command, reason) {
  const purposeGuidance = buildPurposeGuidanceForTaskLike(taskLike);
  return {
    kind,
    taskId: taskLike?.id ?? null,
    command,
    reason,
    purpose: purposeGuidance.purpose,
    purposeGuidance
  };
}

export function recommendWorkerSessionFocus(input) {
  const activeTask = input.activeOwned[0];
  if (activeTask) {
    return buildFocusPayload(
      "active_task",
      activeTask,
      `node ./src/index.js task:review --id ${activeTask.id} --by ${input.workerId}`,
      "worker already owns active execution"
    );
  }

  const reviewTask = input.reviewQueue[0];
  if (reviewTask) {
    return buildFocusPayload(
      "review_task",
      reviewTask,
      `node ./src/index.js task:approve --id ${reviewTask.id} --by ${input.role}`,
      "verifier has pending review work"
    );
  }

  const blockedTask = input.blockedOwned[0];
  if (blockedTask) {
    return buildFocusPayload(
      "blocked_task",
      blockedTask,
      `node ./src/index.js task:release --id ${blockedTask.id} --by ${input.workerId}`,
      "worker has blocked owned work"
    );
  }

  const handoffTask = input.handoffsAwaitingReview[0];
  if (handoffTask) {
    return buildFocusPayload(
      "awaiting_review",
      handoffTask,
      null,
      "worker has already handed this task to its verifier"
    );
  }

  if (input.next?.candidate) {
    return buildFocusPayload(
      "pickup_next",
      input.next.candidate,
      `node ./src/index.js task:pickup --role ${input.role} --worker ${input.workerId} --mode ${input.mode}`,
      "worker has no active task and can pick up the next candidate"
    );
  }

  return {
    kind: "idle",
    taskId: null,
    command: null,
    reason: "no current or queued work for this worker session",
    purpose: null,
    purposeGuidance: buildPurposeGuidanceForTaskLike(null)
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
  const focusTaskSnapshot =
    activeOwned.length > 0
      ? buildSessionTaskSnapshot(activeOwned[0], role, workerId, summarizeInboxTask, taskBrief)
      : reviewQueue.length > 0
        ? buildSessionTaskSnapshot(reviewQueue[0], role, workerId, summarizeInboxTask, taskBrief)
        : blockedOwned.length > 0
          ? buildSessionTaskSnapshot(blockedOwned[0], role, workerId, summarizeInboxTask, taskBrief)
          : handoffsAwaitingReview.length > 0
            ? buildSessionTaskSnapshot(handoffsAwaitingReview[0], role, workerId, summarizeInboxTask, taskBrief)
            : null;

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
    focus,
    focusTask: focusTaskSnapshot?.summary ?? next?.candidate ?? null,
    purposeGuidance: focusTaskSnapshot?.purposeGuidance ?? focus?.purposeGuidance ?? buildPurposeGuidanceForTaskLike(next?.candidate ?? null)
  };
}

export function buildWorkerSessionViewFromSources(input, sources) {
  return buildWorkerSessionView(input, sources);
}
