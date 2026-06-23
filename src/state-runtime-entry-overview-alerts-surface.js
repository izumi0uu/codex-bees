import { runtimeAlertsFromSources } from './state-runtime-overviews.js';

export function runtimeAlertsSurface({ runtimeDashboard, listSwarmOverviews }) {
  return runtimeAlertsFromSources({
    runtimeDashboard,
    listSwarmOverviews
  });
}
