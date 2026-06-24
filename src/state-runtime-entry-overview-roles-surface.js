import { runtimeRolesFromSources } from './state-runtime-overviews.js';

export function runtimeRolesSurface(input = {}, sources = {}) {
  return runtimeRolesFromSources(input, sources);
}
