import { runtimeDispatchFromSources } from './state-runtime-overviews.js';

export function runtimeDispatchSurface({ leaderAssignments }) {
  return runtimeDispatchFromSources({
    leaderAssignments
  });
}
