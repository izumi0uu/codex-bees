import { buildRuntimeExecutionPackSummary, buildRuntimeExecutionPackView, deriveRuntimeExecutionPackReason, deriveRuntimeExecutionPackSurface } from './state-runtime-views.js';

export function runtimeExecutionPackFromSources(
  input = {},
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  }
) {
  return buildRuntimeExecutionPackView(
    input,
    {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    },
    {
      deriveRuntimeExecutionPackSurface,
      deriveRuntimeExecutionPackReason,
      buildRuntimeExecutionPackSummary
    }
  );
}
