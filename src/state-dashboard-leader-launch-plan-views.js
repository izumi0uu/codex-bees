import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";
import { buildLaunchWindows } from "./state-dashboard-leader-dispatch-launch-core.js";

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
