import { getRuntimeCatalog } from "./catalog.js";
import {
  buildRuntimeRolesSummary,
  buildRuntimeRolesView,
  buildRuntimeRolesViewFromSources,
  deriveRuntimeRolesReason
} from "./state-dashboard-views.js";
import { buildRuntimeRoleEntry } from "./state-role-views.js";
import { isClaimableTask } from "./state-queue-views.js";
import { describeRole } from "./state-task-core.js";
import { compareRuntimeRoleEntries } from "./state-runtime-views.js";

export function runtimeRolesFromSources(
  input = {},
  {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext
  }
) {
  return buildRuntimeRolesViewFromSources(
    input,
    {
      getRuntimeCatalog,
      leaderAssignments,
      buildRuntimeRoleEntry,
      describeRole,
      loadState,
      normalizeTask,
      taskInbox,
      taskNext,
      isClaimableTask,
      compareRuntimeRoleEntries
    },
    {
      deriveRuntimeRolesReason,
      buildRuntimeRolesSummary,
      buildRuntimeRolesView
    }
  );
}
