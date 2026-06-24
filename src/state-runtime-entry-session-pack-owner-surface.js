import { runtimeOwnerPackFromSources } from "./state-runtime-packs.js";

export function runtimeOwnerPackSurface(input = {}, sources = {}) {
  return runtimeOwnerPackFromSources(input, sources);
}
