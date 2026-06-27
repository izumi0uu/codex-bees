import {
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsViewFromSources,
  deriveRuntimeAlertsReason
} from "../../dashboard/views.js";
import { compareRuntimeAlerts } from "../../role/index.js";

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
