import { runtimeExecutionPackFromSources } from "./state-runtime-packs.js";

export function runtimeExecutionPackSurface(input = {}, sources = {}) {
  return runtimeExecutionPackFromSources(input, sources);
}
