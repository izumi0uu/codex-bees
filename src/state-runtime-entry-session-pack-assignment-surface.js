import { runtimeAssignmentPackFromSources } from "./state-runtime-packs.js";

export function runtimeAssignmentPackSurface(input = {}, sources = {}) {
  return runtimeAssignmentPackFromSources(input, sources);
}
