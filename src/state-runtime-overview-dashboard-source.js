import {
  buildRuntimeDashboardSummary,
  buildRuntimeDashboardViewFromSources,
  deriveRuntimeDashboardReason
} from "./state-dashboard-views.js";
import { summarizeDashboardTask } from "./state-role-views.js";
import { compareTasksByUpdatedAt } from "./state-queue-views.js";

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
