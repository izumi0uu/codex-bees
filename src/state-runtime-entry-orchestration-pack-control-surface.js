import { runtimeControlPackFromSources } from './state-runtime-packs.js';

export function runtimeControlPackSurface(input = {}, { runtimeSummaryPack, runtimeWorkspacePack, runtimeOperatorPack, runtimeLeaderPack }) {
  return runtimeControlPackFromSources(input, {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  });
}
