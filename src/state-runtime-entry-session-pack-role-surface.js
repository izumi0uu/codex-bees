import { runtimeRolePackFromSources } from "./state-runtime-packs.js";

export function runtimeRolePackSurface(input = {}, sources = {}) {
  return runtimeRolePackFromSources(input, sources);
}
