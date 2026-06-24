export function buildRuntimeReviewSummary(groups, next) {
  if (groups.length === 0) {
    return 'Runtime review has no verifier-grouped work ready right now.';
  }

  if (!next) {
    return `Runtime review is tracking ${groups.length} verifier group${groups.length === 1 ? '' : 's'}.`;
  }

  return `Runtime review has ${groups.length} verifier group${groups.length === 1 ? '' : 's'}; ${next.taskId} is the next review decision.`;
}

export function buildRuntimeReviewView(
  {
    loadState,
    normalizeTask,
    compareTasksByUpdatedAt,
    describeRole,
    taskBrief,
    buildRuntimeReviewTaskEntry,
    compareRuntimeReviewGroups
  },
  {
    deriveRuntimeReviewReason,
    buildRuntimeReviewSummary
  }
) {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === 'ready_for_review')
    .sort(compareTasksByUpdatedAt);
  const groupsByVerifier = new Map();

  for (const task of tasks) {
    const verifierId = task.verifier ?? 'unknown';
    const current = groupsByVerifier.get(verifierId) ?? {
      verifier: describeRole(verifierId),
      count: 0,
      tasks: []
    };
    current.tasks.push(buildRuntimeReviewTaskEntry(task, current.count + 1, describeRole, taskBrief));
    current.count += 1;
    groupsByVerifier.set(verifierId, current);
  }

  const groups = [...groupsByVerifier.values()].sort(compareRuntimeReviewGroups);
  const next = groups[0]?.tasks?.[0] ?? null;
  const recommendedReason = deriveRuntimeReviewReason({ groups, next, totalPendingReview: tasks.length });

  return {
    kind: 'runtime_review',
    recommendedReason,
    counts: {
      verifierGroups: groups.length,
      totalPendingReview: tasks.length
    },
    groups,
    next,
    summary: buildRuntimeReviewSummary(groups, next)
  };
}

export function buildRuntimeReviewViewFromSources(sources, helpers) {
  return buildRuntimeReviewView(sources, helpers);
}

export function deriveRuntimeReviewReason({ groups, next, totalPendingReview }) {
  if (next?.taskId) {
    return 'review_decision_ready';
  }
  if (groups.length > 0) {
    return 'review_groups_visible';
  }
  if (totalPendingReview > 0) {
    return 'pending_review_visible';
  }
  return 'no_review_pending';
}
