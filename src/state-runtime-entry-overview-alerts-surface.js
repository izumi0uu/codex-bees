import { runtimeAlertsFromSources } from './state-runtime-overviews.js';

export function runtimeAlertsSurface(sources = {}) {
  return runtimeAlertsFromSources(sources);
}
