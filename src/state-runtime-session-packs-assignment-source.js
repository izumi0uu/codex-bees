import { describeRole } from './state-task-core.js';
import { normalizeNextMode } from './state-queue-views.js';
import { buildRuntimeAssignmentPackSummary, buildRuntimeAssignmentPackView, deriveRuntimeAssignmentPackReason, deriveRuntimeAssignmentPackSurface } from './state-runtime-views.js';

export function runtimeAssignmentPackFromSources(
  input = {},
  {
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles
  }
) {
  return buildRuntimeAssignmentPackView(
    input,
    {
      normalizeNextMode,
      leaderAssignments,
      workerSession,
      taskNext,
      previewTaskAssignment,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeAssignmentPackSurface,
      deriveRuntimeAssignmentPackReason,
      buildRuntimeAssignmentPackSummary
    }
  );
}
