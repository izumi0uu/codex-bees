import { describeRole } from '../../task/core.js';
import { normalizeNextMode } from '../../queue/views.js';
import { buildRuntimeAssignmentPackSummary, buildRuntimeAssignmentPackView, deriveRuntimeAssignmentPackReason, deriveRuntimeAssignmentPackSurface } from '../views.js';

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
