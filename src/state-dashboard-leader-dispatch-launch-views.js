import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";
import {
  buildDispatchTargetsForGroups,
  buildLaunchWindows,
  buildStartupWindowKey
} from "./state-dashboard-leader-dispatch-launch-core.js";

export function buildLeaderAssignmentDispatchPackView(
  input,
  {
    leaderAssignments,
    leaderAssignmentDispatch
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

export function buildLeaderAssignmentDispatchPackViewFromSources(
  input,
  {
    leaderAssignments,
    leaderAssignmentDispatch
  },
  {
    deriveLeaderAssignmentDispatchPackReason,
    buildLeaderAssignmentDispatchPackView
  }
) {
  return buildLeaderAssignmentDispatchPackView(
    input,
    {
      leaderAssignments,
      leaderAssignmentDispatch
    },
    {
      deriveLeaderAssignmentDispatchPackReason
    }
  );
}

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

export function buildLeaderAssignmentDispatchBundleViewFromSources(
  input,
  {
    leaderAssignmentDispatchPack
  },
  {
    deriveLeaderAssignmentDispatchBundleReason,
    buildLeaderAssignmentDispatchBundleView
  }
) {
  return buildLeaderAssignmentDispatchBundleView(
    input,
    {
      leaderAssignmentDispatchPack
    },
    {
      deriveLeaderAssignmentDispatchBundleReason
    }
  );
}

export function buildLeaderAssignmentLaunchPlanView(
  input,
  {
    leaderAssignmentDispatchBundle
  },
  {
    deriveLeaderAssignmentLaunchPlanReason
  }
) {
  const bundle = leaderAssignmentDispatchBundle(input);
  const steps = (bundle?.launches ?? []).map((launch, index) => ({
    position: index + 1,
    role: launch.role,
    workerId: launch.workerId,
    taskId: launch.taskId,
    lane: launch.lane,
    swarmId: launch.swarmId,
    purpose: launch.purpose ?? null,
    purposeGuidance: launch.purposeGuidance ?? buildPurposeGuidanceForTaskLike(launch.assignment ?? launch),
    wave: launch.wave ?? null,
    waveStatus: launch.waveStatus ?? null,
    waveParallelizable: launch.waveParallelizable ?? null,
    swarmExecutionShape: launch.swarmExecutionShape ?? null,
    swarmWaveCount: launch.swarmWaveCount ?? null,
    swarmMaxWorkers: launch.swarmMaxWorkers ?? null,
    startupWindowKey: launch.startupWindowKey ?? null,
    launchCommand: launch.launchCommand,
    sessionCommand: launch.sessionCommand,
    previewCommand: launch.previewCommand,
    pickupCommand: launch.pickupCommand,
    handoff: {
      assignmentPackCommand: launch.assignmentPackCommand,
      pickupCommand: launch.pickupCommand
    },
    summary: `Start ${launch.workerId ?? "<worker-id>"} on ${launch.role?.id ?? launch.role?.name ?? "unknown"} for ${launch.taskId ?? "no-task"} as ${launch.purposeGuidance?.label ?? "implementation"} work.`
  }));
  const windows = buildLaunchWindows(steps);
  const next = steps[0] ?? null;
  const nextWindow = windows[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentLaunchPlanReason({ bundle, steps, next });

  return {
    kind: "leader_assignment_launch_plan",
    recommendedReason,
    counts: {
      steps: steps.length,
      startupWindows: windows.length,
      launches: bundle?.counts?.launches ?? 0,
      ownerGroups: bundle?.counts?.ownerGroups ?? 0,
      totalAssignments: bundle?.counts?.totalAssignments ?? 0
    },
    next,
    nextWindow,
    steps,
    windows,
    bundle,
    summary: next
      ? `Leader assignment launch plan has ${steps.length} startup step${steps.length === 1 ? "" : "s"} across ${windows.length} startup window${windows.length === 1 ? "" : "s"}; ${next.workerId ?? "<worker-id>"} is first for ${next.purposeGuidance?.label ?? "implementation"} work.`
      : "Leader assignment launch plan has no startup steps right now."
  };
}

export function buildLeaderAssignmentLaunchPlanViewFromSources(
  input,
  {
    leaderAssignmentDispatchBundle
  },
  {
    deriveLeaderAssignmentLaunchPlanReason,
    buildLeaderAssignmentLaunchPlanView
  }
) {
  return buildLeaderAssignmentLaunchPlanView(
    input,
    {
      leaderAssignmentDispatchBundle
    },
    {
      deriveLeaderAssignmentLaunchPlanReason
    }
  );
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

export function deriveLeaderAssignmentLaunchPlanReason({ bundle, steps, next }) {
  if ((steps?.length ?? 0) > 1) {
    return "parallel_startup_steps_ready";
  }
  if ((bundle?.counts?.launches ?? 0) > 1) {
    return "parallel_launch_bundle_visible";
  }
  if (next?.workerId) {
    return "next_startup_step_ready";
  }
  if ((bundle?.counts?.totalAssignments ?? 0) > 0) {
    return "assignment_launch_context_visible";
  }
  return "no_startup_steps_ready";
}
