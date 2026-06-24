import {
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsViewFromSources,
  deriveRuntimeAlertsReason
} from "./state-dashboard-views.js";
import { compareRuntimeAlerts } from "./state-role-views.js";

export function runtimeAlertsFromSources(sources = {}) {
  return buildRuntimeAlertsViewFromSources(
    {
      ...sources,
      compareRuntimeAlerts
    },
    {
      deriveRuntimeAlertsReason,
      buildRuntimeAlertsSummary
    }
  );
}
