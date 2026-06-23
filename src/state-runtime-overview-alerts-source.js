import {
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsView,
  buildRuntimeAlertsViewFromSources,
  deriveRuntimeAlertsReason
} from "./state-dashboard-views.js";
import { compareRuntimeAlerts } from "./state-role-views.js";

export function runtimeAlertsFromSources({
  runtimeDashboard,
  listSwarmOverviews
}) {
  return buildRuntimeAlertsViewFromSources(
    {
      runtimeDashboard,
      listSwarmOverviews,
      compareRuntimeAlerts
    },
    {
      deriveRuntimeAlertsReason,
      buildRuntimeAlertsSummary,
      buildRuntimeAlertsView
    },
    {
      buildRuntimeAlertsView
    }
  );
}
