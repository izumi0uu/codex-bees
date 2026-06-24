import { getRuntimeCatalog } from "./catalog.js";
import {
  buildRuntimeRolesSummary,
  buildRuntimeRolesViewFromSources,
  deriveRuntimeRolesReason
} from "./state-dashboard-views.js";
import { buildRuntimeRoleEntry } from "./state-role-views.js";
import { isClaimableTask } from "./state-queue-views.js";
import { describeRole } from "./state-task-core.js";
import { compareRuntimeRoleEntries } from "./state-runtime-views.js";

export function runtimeRolesFromSources(input = {}, sources = {}) {
  return buildRuntimeRolesViewFromSources(
    input,
    {
      ...sources,
      getRuntimeCatalog,
      buildRuntimeRoleEntry,
      describeRole,
      isClaimableTask,
      compareRuntimeRoleEntries
    },
    {
      deriveRuntimeRolesReason,
      buildRuntimeRolesSummary
    }
  );
}
