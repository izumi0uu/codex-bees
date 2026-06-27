import { buildPurposeGuidanceForTaskLike } from "../task/lane-purpose.js";
import { buildStartupWindowKey } from "./leader-dispatch-launch-core.js";

export function buildLeaderAssignmentDispatchBundleView(
  input,
  {
    leaderAssignmentDispatchPack
  },
  {
    deriveLeaderAssignmentDispatchBundleReason
  }
) {
  const dispatchPack = leaderAssignmentDispatchPack(input);
  const launchTargets =
    Array.isArray(dispatchPack?.targets) && dispatchPack.targets.length > 0
      ? dispatchPack.targets
      : (dispatchPack?.groups ?? []).flatMap((group) => group.targets ?? []);
  const launches = launchTargets.map((target, index) => ({
    roleId: target.owner?.id ?? target.owner?.name ?? "unknown",
    position: index + 1,
    role: target.owner,
    workerId: target.workerId,
    taskId: target.taskId ?? null,
    swarmId: target.swarmId ?? null,
    objective: target.objective ?? null,
    lane: target.lane ?? null,
    purpose: target.purpose ?? null,
    purposeGuidance: target.purposeGuidance ?? buildPurposeGuidanceForTaskLike(target.assignment ?? target),
    wave: target.wave ?? null,
    waveStatus: target.waveStatus ?? null,
    waveParallelizable: target.waveParallelizable ?? null,
    swarmExecutionShape: target.swarmExecutionShape ?? null,
    swarmWaveCount: target.swarmWaveCount ?? null,
    swarmMaxWorkers: target.swarmMaxWorkers ?? null,
    startupWindowKey: target.startupWindowKey ?? buildStartupWindowKey(target.assignment ?? target, `${target.ownerId}:${index + 1}`),
    assignment: target.assignment ?? null,
    sessionCommand: `node ./src/index.js worker:session --role ${target.owner?.id ?? target.owner?.name ?? "unknown"} --worker ${target.workerId} --mode owner`,
    assignmentPackCommand: `node ./src/index.js runtime:assignment-pack --role ${target.owner?.id ?? target.owner?.name ?? "unknown"} --worker ${target.workerId} --mode owner`,
    launchCommand: `node ./src/index.js runtime:assignment-pack --role ${target.owner?.id ?? target.owner?.name ?? "unknown"} --worker ${target.workerId} --mode owner`,
    previewCommand: target.previewCommand,
    pickupCommand: target.pickupCommand,
    command: target.command,
    summary: target.summary
  }));
  const next = launches[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next });

  return {
    kind: "leader_assignment_dispatch_bundle",
    recommendedReason,
    counts: {
      launches: launches.length,
      ownerGroups: dispatchPack?.counts?.ownerGroups ?? 0,
      totalAssignments: dispatchPack?.counts?.totalAssignments ?? 0,
      workerTargets: dispatchPack?.counts?.workerTargets ?? launches.length
    },
    next,
    launches,
    summary: next
      ? `Leader assignment dispatch bundle has ${launches.length} worker launch${launches.length === 1 ? "" : "es"} ready; ${next.role?.id ?? next.role?.name ?? "unknown"} via ${next.workerId ?? "<worker-id>"} is first for ${next.purposeGuidance?.label ?? "implementation"} work.`
      : "Leader assignment dispatch bundle has no worker launches right now."
  };
}

export function buildLeaderAssignmentDispatchBundleViewFromSources(input, sources, helpers) {
  return buildLeaderAssignmentDispatchBundleView(input, sources, helpers);
}

export function deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next }) {
  if ((launches?.length ?? 0) > 1) {
    return "parallel_worker_launches_ready";
  }
  if ((dispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if (next?.taskId) {
    return "next_worker_launch_ready";
  }
  if ((dispatchPack?.counts?.totalAssignments ?? 0) > 0) {
    return "assignment_dispatch_visible";
  }
  return "no_worker_launch_ready";
}
