import { runtimeVerifierPackFromSources } from "./state-runtime-packs.js";

export function runtimeVerifierPackSurface(input = {}, sources = {}) {
  return runtimeVerifierPackFromSources(input, sources);
}
