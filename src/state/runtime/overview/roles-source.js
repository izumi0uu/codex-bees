import { getRuntimeCatalog } from "../../../catalog.js";
import {
  buildRuntimeRolesSummary,
  buildRuntimeRolesViewFromSources,
  deriveRuntimeRolesReason
} from "../../dashboard/views.js";
import { buildRuntimeRoleEntry } from "../../role/index.js";
import { isClaimableTask } from "../../queue/views.js";
import { describeRole } from "../../task/core.js";
import { compareRuntimeRoleEntries } from "../views.js";

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
