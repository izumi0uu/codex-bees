import { buildRuntimeWorkspacePackSummary, buildRuntimeWorkspacePackView, deriveRuntimeWorkspacePackReason, deriveRuntimeWorkspacePackSurface } from './state-runtime-views.js';

export function runtimeWorkspacePackFromSources(input = {}, sources = {}) {
  return buildRuntimeWorkspacePackView(
    input,
    sources,
    {
      deriveRuntimeWorkspacePackSurface,
      deriveRuntimeWorkspacePackReason,
      buildRuntimeWorkspacePackSummary
    }
  );
}
