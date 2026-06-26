import { buildRuntimeWorkspacePackSummary, buildRuntimeWorkspacePackView, deriveRuntimeWorkspacePackReason, deriveRuntimeWorkspacePackSurface } from '../views.js';

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
