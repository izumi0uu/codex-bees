import { describeRole } from './state-task-core.js';
import { normalizeNextMode } from './state-queue-views.js';
import { buildRuntimePickupPackSummary, buildRuntimePickupPackView, deriveRuntimePickupPackReason, deriveRuntimePickupPackSurface } from './state-runtime-views.js';

export function runtimePickupPackFromSources(
  input = {},
  {
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack
  }
) {
  return buildRuntimePickupPackView(
    input,
    {
      normalizeNextMode,
      workerSession,
      taskNext,
      previewTaskPickup,
      runtimeRolePack,
      describeRole
    },
    {
      deriveRuntimePickupPackSurface,
      deriveRuntimePickupPackReason,
      buildRuntimePickupPackSummary
    }
  );
}
