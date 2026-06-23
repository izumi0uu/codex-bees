import { runtimeRecoveryPackFromSources } from './state-runtime-packs.js';

export function runtimeRecoveryPackSurface({ runtimeRecovery, runtimeHandoffs, runtimeFocus }) {
  return runtimeRecoveryPackFromSources({
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  });
}
