import { runtimeSignalPackFromSources } from './state-runtime-packs.js';

export function runtimeSignalPackSurface(input = {}, { runtimeFocus, runtimeAlerts, runtimeActivity, runtimeRoles }) {
  return runtimeSignalPackFromSources(input, {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  });
}
