export function runtimeHandoffType(task) {
  if (task.queueStatus === "ready_for_review") {
    return "verifier_decision";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery";
  }
  return "owner_claim";
}
export function buildRuntimeHandoffEntrySummary(task) {
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
export function buildRuntimeHandoffEntry(task, taskBrief) {
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
    lanePurpose: task.lanePurpose ?? null,
    actor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    taskBrief: brief,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeHandoffEntrySummary(task)
  };
}
export function runtimeHandoffActorKey(actor) {
  return [
    actor?.type ?? "unknown",
    actor?.id ?? "unknown",
    actor?.claimedBy ?? ""
  ].join(":");
}
export function runtimeHandoffPriority(entry) {
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
export function compareRuntimeHandoffEntries(left, right) {
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
export function compareRuntimeHandoffGroups(left, right) {
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
export function buildRuntimeHandoffsView(
  {
    loadState,
    normalizeTask,
    taskBrief
  },
  {
    buildRuntimeHandoffEntry,
    compareRuntimeHandoffEntries,
    runtimeHandoffActorKey,
    compareRuntimeHandoffGroups,
    deriveRuntimeHandoffsReason,
    buildRuntimeHandoffsSummary
  }
) {
  const handoffs = loadState().tasks
    .map(normalizeTask)
    .filter((task) => ["ready_for_review", "blocked", "queued", "released"].includes(task.queueStatus))
    .map((task) => buildRuntimeHandoffEntry(task, taskBrief))
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
  const recommendedReason = deriveRuntimeHandoffsReason({ groups, next });

  return {
    kind: "runtime_handoffs",
    recommendedReason,
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
export function buildRuntimeHandoffsViewFromState(
  {
    loadState,
    normalizeTask,
    taskBrief
  },
  {
    buildRuntimeHandoffEntry,
    compareRuntimeHandoffEntries,
    runtimeHandoffActorKey,
    compareRuntimeHandoffGroups,
    deriveRuntimeHandoffsReason,
    buildRuntimeHandoffsSummary,
    buildRuntimeHandoffsView
  }
) {
  return buildRuntimeHandoffsView(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      buildRuntimeHandoffEntry,
      compareRuntimeHandoffEntries,
      runtimeHandoffActorKey,
      compareRuntimeHandoffGroups,
      deriveRuntimeHandoffsReason,
      buildRuntimeHandoffsSummary
    }
  );
}
