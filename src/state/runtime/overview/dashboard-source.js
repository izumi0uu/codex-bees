import {
  buildRuntimeDashboardSummary,
  buildRuntimeDashboardViewFromSources,
  deriveRuntimeDashboardReason
} from "../../dashboard/views.js";
import { summarizeDashboardTask } from "../../role/index.js";
import { compareTasksByUpdatedAt } from "../../queue/views.js";

export function runtimeDashboardFromSources(sources = {}) {
  return buildRuntimeDashboardViewFromSources(
    {
      ...sources,
      compareTasksByUpdatedAt,
      summarizeDashboardTask
    },
    {
      deriveRuntimeDashboardReason,
      buildRuntimeDashboardSummary
    }
  );
}
