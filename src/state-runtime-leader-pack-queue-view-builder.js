import {
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  buildRuntimePackPresenceMetadata,
  attachRuntimePackSurfaces,
  countRuntimePackEntries,
  normalizeRuntimePackDetail
} from './state-runtime-pack-detail.js';

export function buildRuntimeQueuePackView(
  input,
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeQueuePackSurface,
    deriveRuntimeQueuePackReason,
    buildRuntimeQueuePackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const queue = leaderQueue();
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const recommendedSurface = deriveRuntimeQueuePackSurface({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan });
  const recommendedReason = deriveRuntimeQueuePackReason({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan });
  const nextEntries = {
    queue: queue?.next ?? null,
    focus: focus?.focus ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry('runtime:queue-pack', input, { detail: 'full' }),
    queue: buildRuntimePackCommandExpansionEntry('leader:queue', input, { workerId: undefined, workerIds: undefined, detail: undefined }),
    dashboard: buildRuntimePackCliExpansionEntry('runtime:dashboard'),
    focus: buildRuntimePackCliExpansionEntry('runtime:focus'),
    assignmentDispatchBundle: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-bundle', input),
    assignmentLaunchPlan: buildRuntimePackCommandExpansionEntry('leader:assignment-launch-plan', input)
  };

  const pack = {
    kind: 'runtime_queue_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasQueue: queue?.next,
      hasFocus: focus?.focus,
      hasAssignmentLaunch: assignmentDispatchBundle?.next,
      hasAssignmentLaunchPlan: assignmentLaunchPlan?.next
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      queue: queue?.counts ?? null,
      dashboard: dashboard?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null
    },
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan)
  };

  return attachRuntimePackSurfaces(pack, detailLevel, {
    queue,
    dashboard,
    focus,
    assignmentDispatchBundle,
    assignmentLaunchPlan
  });
}

export function buildRuntimeQueuePackViewFromSources(
  input,
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeQueuePackSurface,
    deriveRuntimeQueuePackReason,
    buildRuntimeQueuePackSummary,
    buildRuntimeQueuePackView
  }
) {
  return buildRuntimeQueuePackView(
    input,
    {
      leaderQueue,
      runtimeDashboard,
      runtimeFocus,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeQueuePackSurface,
      deriveRuntimeQueuePackReason,
      buildRuntimeQueuePackSummary
    }
  );
}
