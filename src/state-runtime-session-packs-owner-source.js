import { describeRole } from './state-task-core.js';
import { buildRuntimeOwnerPackSummary, buildRuntimeOwnerPackView, deriveRuntimeOwnerPackReason, deriveRuntimeOwnerPackSurface } from './state-runtime-views.js';

export function runtimeOwnerPackFromSources(
  input = {},
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  }
) {
  return buildRuntimeOwnerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeOwnerPackSurface,
      deriveRuntimeOwnerPackReason,
      buildRuntimeOwnerPackSummary
    }
  );
}
