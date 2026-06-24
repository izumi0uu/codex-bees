import { runtimeWorkspacePackFromSources } from './state-runtime-packs.js';

export function runtimeWorkspacePackSurface(input = {}, sources = {}) {
  return runtimeWorkspacePackFromSources(input, sources);
}
