import { runtimeHandoffPackFromSources } from './state-runtime-packs.js';

export function runtimeHandoffPackSurface({ runtimeHandoffs, runtimeDispatch, runtimeReview, runtimeRecovery }) {
  return runtimeHandoffPackFromSources({
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  });
}
