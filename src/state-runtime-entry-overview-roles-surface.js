import { runtimeRolesFromSources } from './state-runtime-overviews.js';

export function runtimeRolesSurface(input = {}, { leaderAssignments, loadState, normalizeTask, taskInbox, taskNext }) {
  return runtimeRolesFromSources(input, {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext
  });
}
