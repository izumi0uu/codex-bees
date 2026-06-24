import { runtimePickupPackFromSources } from "./state-runtime-packs.js";

export function runtimePickupPackSurface(input = {}, sources = {}) {
  return runtimePickupPackFromSources(input, sources);
}
