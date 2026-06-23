import {
  buildRuntimeDashboardSummary,
  buildRuntimeDashboardView,
  buildRuntimeDashboardViewFromSources,
  deriveRuntimeDashboardReason
} from "./state-dashboard-views.js";
import { summarizeDashboardTask } from "./state-role-views.js";
import { compareTasksByUpdatedAt } from "./state-queue-views.js";

export function runtimeDashboardFromSources({
  loadState,
  normalizeTask,
  listSwarmOverviews,
  leaderQueue,
  leaderAssignments
}) {
  return buildRuntimeDashboardViewFromSources(
    {
      loadState,
      normalizeTask,
      listSwarmOverviews,
      leaderQueue,
      leaderAssignments,
      compareTasksByUpdatedAt,
      summarizeDashboardTask
    },
    {
      deriveRuntimeDashboardReason,
      buildRuntimeDashboardSummary,
      buildRuntimeDashboardView
    },
    {
      buildRuntimeDashboardView
    }
  );
}
