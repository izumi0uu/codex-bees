import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackQueueEntries,
  buildRuntimePackQueueMetadata,
  buildRuntimePackQueueOverview,
  buildRuntimePackQueueSurfaces,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from '../../../state/runtime/pack-detail/index.js';

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
  const nextEntries = buildRuntimePackQueueEntries(queue, focus, assignmentDispatchBundle, assignmentLaunchPlan);
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
    availableDetails: RUNTIME_PACK_DETAILS,
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackQueueMetadata(queue, focus, assignmentDispatchBundle, assignmentLaunchPlan),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackQueueOverview(queue, dashboard, assignmentDispatchBundle, assignmentLaunchPlan),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan)
  };

  return attachRuntimePackSurfaces(
    pack,
    detailLevel,
    buildRuntimePackQueueSurfaces(queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan)
  );
}

