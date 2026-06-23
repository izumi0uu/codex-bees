import { runtimeCloseoutPackFromSources } from './state-runtime-packs.js';

export function runtimeCloseoutPackSurface(input = {}, { runtimeCloseout, runtimeSummaryPack, runtimeLeaderPack }) {
  return runtimeCloseoutPackFromSources(input, {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  });
}
