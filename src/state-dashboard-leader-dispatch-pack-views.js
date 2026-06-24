import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";
import { buildDispatchTargetsForGroups } from "./state-dashboard-leader-dispatch-launch-core.js";

export function buildLeaderAssignmentDispatchPackView(
  input,
  {
    leaderAssignments,
  },
  {
    deriveLeaderAssignmentDispatchPackReason
  }
) {
  const assignments = leaderAssignments(input);
  const allocation = buildDispatchTargetsForGroups(input, assignments?.groups ?? []);
  const groups = allocation.groups.map((group) => {
    const nextTarget = group.targets[0] ?? null;
    const nextAssignment = nextTarget?.assignment ?? group.assignments[0] ?? null;
    const purposeGuidance = nextAssignment?.purposeGuidance ?? buildPurposeGuidanceForTaskLike(nextAssignment);

    return {
      owner: group.owner,
      count: group.count,
      next: nextAssignment,
      purposeGuidance,
      wave: nextAssignment?.wave ?? null,
      waveStatus: nextAssignment?.waveStatus ?? null,
      waveParallelizable: nextAssignment?.waveParallelizable ?? null,
      swarmId: nextAssignment?.swarmId ?? null,
      swarmExecutionShape: nextAssignment?.swarmExecutionShape ?? null,
      swarmWaveCount: nextAssignment?.swarmWaveCount ?? null,
      swarmMaxWorkers: nextAssignment?.swarmMaxWorkers ?? null,
      workerId: nextTarget?.workerId ?? null,
      workerPool: group.workerPool,
      workerCount: group.workerPool.length,
      readyTargets: group.targets.length,
      deferredAssignments: Math.max(0, group.count - group.targets.length),
      launchReady: group.targets.length > 0,
      previewCommand: nextTarget?.previewCommand ?? null,
      pickupCommand: nextTarget?.pickupCommand ?? null,
      command: nextTarget?.command ?? null,
      targets: group.targets,
      summary:
        group.targets.length > 1
          ? `${group.ownerId} has ${group.targets.length} worker-targeted dispatches ready.`
          : group.targets.length === 1
            ? `${group.ownerId} has 1 worker-targeted dispatch ready.`
            : `${group.ownerId} has dispatchable work waiting for an open startup slot.`
    };
  });
  const next = groups.find((group) => group.launchReady) ?? groups[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchPackReason({
    assignments,
    groups,
    next,
    workerTargets: allocation.targets.length
  });

  return {
    kind: "leader_assignment_dispatch_pack",
    recommendedReason,
    counts: {
      ownerGroups: groups.length,
      totalAssignments: assignments?.counts?.totalAssignments ?? 0,
      workerTargets: allocation.targets.length
    },
    next,
    targets: allocation.targets,
    groups,
    summary: next
      ? `Leader assignment dispatch pack has ${allocation.targets.length} worker-targeted dispatch${allocation.targets.length === 1 ? "" : "es"} across ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.owner?.id ?? next.owner?.name ?? "unknown"} is first for ${next.purposeGuidance?.label ?? "implementation"} work.`
      : "Leader assignment dispatch pack has no worker-targeted assignment dispatches right now."
  };
}

export function buildLeaderAssignmentDispatchPackViewFromSources(input, sources, helpers) {
  return buildLeaderAssignmentDispatchPackView(input, sources, helpers);
}

export function deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next, workerTargets }) {
  if ((workerTargets ?? 0) > (groups?.length ?? 0)) {
    return "parallel_worker_targets_ready";
  }
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_ready";
  }
  if ((assignments?.counts?.totalAssignments ?? 0) > 1) {
    return "multiple_assignments_ready";
  }
  if (next?.next?.taskId || next?.launchReady) {
    return "next_assignment_ready";
  }
  if ((assignments?.counts?.ownerGroups ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_assignment_dispatch_ready";
}
