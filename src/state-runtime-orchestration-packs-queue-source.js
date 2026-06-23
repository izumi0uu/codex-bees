import { buildRuntimeQueuePackSummary, buildRuntimeQueuePackView, deriveRuntimeQueuePackReason, deriveRuntimeQueuePackSurface } from './state-runtime-views.js';

export function runtimeQueuePackFromSources(
  input = {},
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
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
