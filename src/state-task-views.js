export function deriveTaskReportReason(task) {
  if (task.queueStatus === "ready_for_review") {
    return "review_decision_pending";
  }
  if (task.queueStatus === "done" || task.reviewOutcome === "approved") {
    return "approved_closure_ready";
  }
  if (task.reviewOutcome === "changes_requested") {
    return "changes_requested_rework";
  }
  if (task.queueStatus === "claimed") {
    return "active_execution_report";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery_report";
  }
  return "queued_execution_report";
}

export function taskReportNextGate(task) {
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

export function buildTaskReportEntries(task) {
  const annotations = (task.annotations ?? []).filter((entry) =>
    ["context", "handoff", "review-note", "evidence", "note"].includes(entry.kind)
  );
  const history = (task.history ?? []).slice(-10);
  return {
    annotations,
    history
  };
}

export function buildTaskReportView(
  id,
  {
    getTask,
    taskBrief,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const brief = taskBrief(id);
  const reportEntries = buildTaskReportEntries(task);
  const recommendedReason = deriveTaskReportReason(task);
  const acceptance = (task.acceptance ?? []).map((item) => ({
    item,
    status: task.reviewOutcome === "approved" || task.queueStatus === "done" ? "verified" : "pending"
  }));
  const verification = task.verification ?? [];
  const reviewEvidence = task.reviewEvidence ?? [];

  return {
    kind: "task_report",
    recommendedReason,
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
    counts: {
      acceptanceItems: acceptance.length,
      verificationSteps: verification.length,
      reviewEvidenceEntries: reviewEvidence.length,
      annotationEntries: reportEntries.annotations.length,
      recentHistoryEntries: reportEntries.history.length
    },
    acceptance,
    verification,
    evidence: {
      reviewEvidence,
      annotations: reportEntries.annotations,
      recentHistory: reportEntries.history
    },
    brief
  };
}

export function buildTaskReportViewFromSources(
  id,
  {
    getTask,
    taskBrief,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  },
  {
    buildTaskReportView
  }
) {
  return buildTaskReportView(id, {
    getTask,
    taskBrief,
    buildTaskReportEntries,
    deriveTaskReportReason,
    deriveReviewState,
    taskReportNextGate
  });
}

export function deriveTaskBriefReason(task, recommended) {
  if (task.queueStatus === "done") {
    return "completed_task_brief";
  }
  if (task.queueStatus === "ready_for_review") {
    return "verifier_decision_brief";
  }
  if (task.queueStatus === "claimed") {
    return "claimed_execution_brief";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery_brief";
  }
  if (task.queueStatus === "released") {
    return "released_repickup_brief";
  }
  if (recommended?.actor?.type === "owner_role") {
    return "claimable_execution_brief";
  }
  return "queued_execution_brief";
}

export function buildTaskBriefView(
  id,
  {
    getTask,
    runtimeRoleCatalog,
    validateTaskValue,
    getRuntimeCatalog,
    recommendTaskAction,
    deriveTaskBriefReason,
    describeRole,
    deriveReviewState
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  const validation = validateTaskValue(task, runtimeRoleCatalog());
  const catalog = getRuntimeCatalog();
  const recommended = recommendTaskAction(task);
  const recommendedReason = deriveTaskBriefReason(task, recommended);
  const scope = task.scope ?? [];
  const acceptance = task.acceptance ?? [];
  const verification = task.verification ?? [];
  const reviewEvidence = task.reviewEvidence ?? [];
  const historyEntries = task.history ?? [];
  const annotationEntries = task.annotations ?? [];

  return {
    kind: "task_execution_brief",
    recommendedReason,
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
    counts: {
      scopeEntries: scope.length,
      acceptanceItems: acceptance.length,
      verificationSteps: verification.length,
      reviewEvidenceEntries: reviewEvidence.length,
      historyEntries: historyEntries.length,
      annotationEntries: annotationEntries.length
    },
    execution: {
      scope,
      acceptance,
      verification
    },
    review: {
      state: deriveReviewState(task),
      reviewedBy: task.reviewedBy,
      reviewedAt: task.reviewedAt,
      outcome: task.reviewOutcome,
      notes: task.reviewNotes,
      evidence: reviewEvidence
    },
    history: {
      count: historyEntries.length,
      entries: historyEntries
    },
    annotations: {
      count: annotationEntries.length,
      entries: annotationEntries.slice(-5)
    },
    validation,
    recommendedNextActor: recommended.actor,
    recommendedNextAction: recommended.action,
    recommendedCommands: recommended.commands
  };
}

export function buildTaskBriefViewFromSources(
  id,
  {
    getTask,
    runtimeRoleCatalog,
    validateTaskValue,
    getRuntimeCatalog,
    recommendTaskAction,
    deriveTaskBriefReason,
    describeRole,
    deriveReviewState
  },
  {
    buildTaskBriefView
  }
) {
  return buildTaskBriefView(
    id,
    {
      getTask,
      runtimeRoleCatalog,
      validateTaskValue,
      getRuntimeCatalog,
      recommendTaskAction,
      deriveTaskBriefReason,
      describeRole,
      deriveReviewState
    }
  );
}

export function buildSwarmBriefView(
  id,
  {
    swarmOverview,
    getRuntimeCatalog,
    validateSwarmValue,
    runtimeRoleCatalog,
    recommendLaneAction,
    recommendSwarmAction,
    describeRole,
    buildSwarmHandoff,
    deriveSwarmBriefReason
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const validation = validateSwarmValue(overview.swarm, runtimeRoleCatalog());
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
  const recommendedReason = deriveSwarmBriefReason(recommended);

  return {
    kind: "swarm_execution_brief",
    recommendedReason,
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

export function buildSwarmBriefViewFromSources(
  id,
  {
    swarmOverview,
    getRuntimeCatalog,
    validateSwarmValue,
    runtimeRoleCatalog,
    recommendLaneAction,
    recommendSwarmAction,
    describeRole,
    buildSwarmHandoff,
    deriveSwarmBriefReason
  },
  {
    buildSwarmBriefView
  }
) {
  return buildSwarmBriefView(
    id,
    {
      swarmOverview,
      getRuntimeCatalog,
      validateSwarmValue,
      runtimeRoleCatalog,
      recommendLaneAction,
      recommendSwarmAction,
      describeRole,
      buildSwarmHandoff,
      deriveSwarmBriefReason
    }
  );
}

export function buildSwarmBundleView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  }
) {
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
  const recommendedReason = deriveSwarmBundleReason({ overview, laneBundles });

  return {
    kind: "swarm_bundle",
    recommendedReason,
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

export function buildSwarmBundleViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  },
  {
    buildSwarmBundleView
  }
) {
  return buildSwarmBundleView(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBundleReason,
      buildSwarmBundleSummary
    }
  );
}

export function buildSwarmCloseoutView(
  id,
  {
    swarmOverview,
    swarmBrief,
    swarmBundle,
    deriveSwarmCloseoutCommand,
    deriveSwarmCloseoutReason,
    buildSwarmCloseoutSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const bundle = swarmBundle(id);
  const command = deriveSwarmCloseoutCommand(overview, brief);
  const recommendedReason = deriveSwarmCloseoutReason({ overview, command });

  return {
    kind: "swarm_closeout",
    recommendedReason,
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

export function buildSwarmCloseoutViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    swarmBundle,
    deriveSwarmCloseoutCommand,
    deriveSwarmCloseoutReason,
    buildSwarmCloseoutSummary
  },
  {
    buildSwarmCloseoutView
  }
) {
  return buildSwarmCloseoutView(
    id,
    {
      swarmOverview,
      swarmBrief,
      swarmBundle,
      deriveSwarmCloseoutCommand,
      deriveSwarmCloseoutReason,
      buildSwarmCloseoutSummary
    }
  );
}

export function buildSwarmBlockersView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBlockersReason,
    buildSwarmBlockersSummary
  }
) {
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
  const recommendedReason = deriveSwarmBlockersReason({ blockedLanes });

  return {
    kind: "swarm_blockers",
    recommendedReason,
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    blockedCount: blockedLanes.length,
    blockers: blockedLanes,
    summary: buildSwarmBlockersSummary(overview, blockedLanes)
  };
}

export function buildSwarmBlockersViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBlockersReason,
    buildSwarmBlockersSummary
  },
  {
    buildSwarmBlockersView
  }
) {
  return buildSwarmBlockersView(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBlockersReason,
      buildSwarmBlockersSummary
    }
  );
}

export function buildSwarmDispatchBundleView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskBrief,
    deriveSwarmDispatchBundleReason,
    buildSwarmDispatchBundleSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const dispatchLane = (brief?.lanes ?? []).find(
    (lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released"
  ) ?? null;
  const recommendedReason = deriveSwarmDispatchBundleReason({ overview, dispatchLane });
  const laneTaskBrief = dispatchLane?.taskId ? taskBrief(dispatchLane.taskId) : null;
  const recommendedCommands = dispatchLane?.recommendedCommands ?? [];

  return {
    kind: "swarm_dispatch_bundle",
    recommendedReason,
    metadata: {
      hasNextLane: Boolean(dispatchLane),
      hasTaskBrief: Boolean(laneTaskBrief),
      nextLaneId: dispatchLane?.lane ?? null
    },
    counts: {
      dispatchableLanes: overview.dispatchableCount,
      nextLaneCommands: recommendedCommands.filter(Boolean).length
    },
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    dispatchableCount: overview.dispatchableCount,
    nextLane: dispatchLane,
    taskBrief: laneTaskBrief,
    command: recommendedCommands[0] ?? null,
    summary: buildSwarmDispatchBundleSummary(overview, dispatchLane)
  };
}

export function buildSwarmDispatchBundleViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskBrief,
    deriveSwarmDispatchBundleReason,
    buildSwarmDispatchBundleSummary
  },
  {
    buildSwarmDispatchBundleView
  }
) {
  return buildSwarmDispatchBundleView(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskBrief,
      deriveSwarmDispatchBundleReason,
      buildSwarmDispatchBundleSummary
    }
  );
}

export function recommendTaskAction(task) {
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

export function recommendLaneAction(laneSummary, task, recommendTaskActionFn = recommendTaskAction) {
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

  return recommendTaskActionFn(task);
}

export function recommendSwarmAction(overview, lanes) {
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

export function buildSwarmHandoff(overview, recommended) {
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

export function deriveSwarmCloseoutCommand(overview, brief) {
  if (overview.readyToComplete) {
    return `node ./src/index.js swarm:done --id ${overview.swarm.id}`;
  }

  return brief?.recommendedCommands?.[0] ?? null;
}

export function buildRuntimeReviewTaskEntry(task, position, describeRole, taskBrief) {
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

export function compareRuntimeReviewGroups(left, right) {
  if (right.count !== left.count) {
    return right.count - left.count;
  }
  return (left.verifier?.id ?? left.verifier?.name ?? "").localeCompare(right.verifier?.id ?? right.verifier?.name ?? "");
}
