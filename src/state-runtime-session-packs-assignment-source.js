import { describeRole } from './state-task-core.js';
import { normalizeNextMode } from './state-queue-views.js';
import { buildRuntimeAssignmentPackSummary, buildRuntimeAssignmentPackView, deriveRuntimeAssignmentPackReason, deriveRuntimeAssignmentPackSurface } from './state-runtime-views.js';

export function runtimeAssignmentPackFromSources(input = {}, sources = {}) {
  return buildRuntimeAssignmentPackView(
    input,
    {
      ...sources,
      normalizeNextMode,
      describeRole
    },
    {
      deriveRuntimeAssignmentPackSurface,
      deriveRuntimeAssignmentPackReason,
      buildRuntimeAssignmentPackSummary
    }
  );
}
