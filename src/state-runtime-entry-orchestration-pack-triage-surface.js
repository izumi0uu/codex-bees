import { runtimeTriagePackFromSources } from './state-runtime-packs.js';

export function runtimeTriagePackSurface({ runtimeFocus, runtimeAlerts, runtimeReview, runtimeRecovery }) {
  return runtimeTriagePackFromSources({
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  });
}
