import { runtimeSessionPackFromSources } from "./state-runtime-packs.js";

export function runtimeSessionPackSurface(input = {}, sources = {}) {
  return runtimeSessionPackFromSources(input, sources);
}
