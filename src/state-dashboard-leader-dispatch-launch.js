import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

function buildLaunchWindows(launches) {
  const windows = [];
  const windowsByKey = new Map();

  for (const launch of launches) {
    const key = launch.startupWindowKey ?? `${launch.swarmId ?? "unknown"}:${launch.wave ?? launch.position}`;
    if (!windowsByKey.has(key)) {
      windowsByKey.set(key, {
        key,
        position: windows.length + 1,
        swarmId: launch.swarmId ?? null,
        objective: launch.objective ?? null,
        wave: launch.wave ?? null,
        executionShape: launch.swarmExecutionShape ?? null,
        parallelizable: launch.waveParallelizable ?? false,
        waveStatus: launch.waveStatus ?? null,
        maxWorkers: launch.swarmMaxWorkers ?? null,
        stepCount: 0,
        workers: [],
        launches: []
      });
      windows.push(windowsByKey.get(key));
    }

    const current = windowsByKey.get(key);
    current.stepCount += 1;
    current.workers.push(launch.workerId);
    current.launches.push(launch);
  }

  return windows.map((window) => ({
    ...window,
    summary:
      window.wave != null
        ? `Wave ${window.wave} for ${window.swarmId ?? "unknown-swarm"} has ${window.stepCount} startup step${window.stepCount === 1 ? "" : "s"} ready.`
        : `Launch window ${window.position} has ${window.stepCount} startup step${window.stepCount === 1 ? "" : "s"} ready.`
  }));
}

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
  const groups = (assignments?.groups ?? []).map((group) => {
    const ownerId = group.owner?.id ?? group.owner?.name ?? "unknown";
    const workerId = input.workerIds?.[ownerId] ?? input.workerId ?? `<${ownerId}-worker>`;
    const dispatch = leaderAssignmentDispatch({
      ...input,
      role: ownerId,
      workerId
    });

    return {
      owner: group.owner,
      count: group.count,
      next: dispatch.assignment,
      purposeGuidance: dispatch.assignment?.purposeGuidance ?? buildPurposeGuidanceForTaskLike(dispatch.assignment),
      wave: dispatch.assignment?.wave ?? null,
      waveStatus: dispatch.assignment?.waveStatus ?? null,
      waveParallelizable: dispatch.assignment?.waveParallelizable ?? null,
      swarmId: dispatch.assignment?.swarmId ?? null,
      swarmExecutionShape: dispatch.assignment?.swarmExecutionShape ?? null,
      swarmWaveCount: dispatch.assignment?.swarmWaveCount ?? null,
      swarmMaxWorkers: dispatch.assignment?.swarmMaxWorkers ?? null,
      workerId,
      previewCommand: dispatch.previewCommand,
      pickupCommand: dispatch.pickupCommand,
      command: dispatch.command,
      summary: dispatch.summary
    };
  });
  const next = groups[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next });

  return {
    kind: "leader_assignment_dispatch_pack",
    recommendedReason,
    counts: {
      ownerGroups: groups.length,
      totalAssignments: assignments?.counts?.totalAssignments ?? 0
    },
    next,
    groups,
    summary: next
      ? `Leader assignment dispatch pack has ${groups.length} owner group${groups.length === 1 ? "" : "s"} ready; ${next.owner?.id ?? next.owner?.name ?? "unknown"} is first for ${next.purposeGuidance?.label ?? "implementation"} work.`
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
  const launches = (dispatchPack?.groups ?? []).map((group, index) => ({
    roleId: group.owner?.id ?? group.owner?.name ?? "unknown",
    position: index + 1,
    role: group.owner,
    workerId: group.workerId,
    taskId: group.next?.taskId ?? null,
    swarmId: group.next?.swarmId ?? null,
    objective: group.next?.objective ?? null,
    lane: group.next?.lane ?? null,
    purpose: group.next?.purpose ?? null,
    purposeGuidance: group.next?.purposeGuidance ?? buildPurposeGuidanceForTaskLike(group.next),
    wave: group.next?.wave ?? null,
    waveStatus: group.next?.waveStatus ?? null,
    waveParallelizable: group.next?.waveParallelizable ?? null,
    swarmExecutionShape: group.next?.swarmExecutionShape ?? null,
    swarmWaveCount: group.next?.swarmWaveCount ?? null,
    swarmMaxWorkers: group.next?.swarmMaxWorkers ?? null,
    startupWindowKey:
      group.next?.swarmId && group.next?.wave != null
        ? `${group.next.swarmId}:wave-${group.next.wave}`
        : `${group.owner?.id ?? group.owner?.name ?? "unknown"}:${index + 1}`,
    assignment: group.next ?? null,
    sessionCommand: `node ./src/index.js worker:session --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    assignmentPackCommand: `node ./src/index.js runtime:assignment-pack --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    launchCommand: `node ./src/index.js runtime:assignment-pack --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    previewCommand: group.previewCommand,
    pickupCommand: group.pickupCommand,
    command: group.command,
    summary: group.summary
  }));
  const next = launches[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next });

  return {
    kind: "leader_assignment_dispatch_bundle",
    recommendedReason,
    counts: {
      launches: launches.length,
      ownerGroups: dispatchPack?.counts?.ownerGroups ?? 0,
      totalAssignments: dispatchPack?.counts?.totalAssignments ?? 0
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
