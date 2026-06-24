import { runtimeWorkerPackFromSources } from "./state-runtime-packs.js";

export function runtimeWorkerPackSurface(input = {}, sources = {}) {
  return runtimeWorkerPackFromSources(input, sources);
}
