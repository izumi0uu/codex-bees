import { runtimeDashboardFromSources } from './state-runtime-overviews.js';

export function runtimeDashboardSurface(sources = {}) {
  return runtimeDashboardFromSources(sources);
}
