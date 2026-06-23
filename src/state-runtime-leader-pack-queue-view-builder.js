import {
  buildRuntimePackCommand,
  buildRuntimePackExpansionEntry,
  buildRuntimePackPresenceMetadata,
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
    full: buildRuntimePackExpansionEntry('runtime:queue-pack', buildRuntimePackCommand('runtime:queue-pack', input, { detail: 'full' })),
    queue: buildRuntimePackExpansionEntry(
      'leader:queue',
      buildRuntimePackCommand('leader:queue', input, { workerId: undefined, workerIds: undefined, detail: undefined })
    ),
    dashboard: buildRuntimePackExpansionEntry('runtime:dashboard', 'node ./src/index.js runtime:dashboard'),
    focus: buildRuntimePackExpansionEntry('runtime:focus', 'node ./src/index.js runtime:focus'),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      'leader:assignment-dispatch-bundle',
      buildRuntimePackCommand('leader:assignment-dispatch-bundle', input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      'leader:assignment-launch-plan',
      buildRuntimePackCommand('leader:assignment-launch-plan', input)
    )
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
    expansion: detailLevel === 'compact' ? expansion : null,
    summary: buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan)
  };

  if (detailLevel === 'full') {
    pack.surfaces = {
      queue,
      dashboard,
      focus,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    };
  }

  return pack;
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
