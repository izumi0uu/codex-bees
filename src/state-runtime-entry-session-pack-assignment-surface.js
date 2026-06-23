import { runtimeAssignmentPackFromSources } from "./state-runtime-packs.js";

export function runtimeAssignmentPackSurface(input = {}, { leaderAssignments, workerSession, taskNext, previewTaskAssignment, runtimeRoles }) {
  return runtimeAssignmentPackFromSources(input, {
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles
  });
}
