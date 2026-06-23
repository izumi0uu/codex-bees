import {
  activateSwarmLifecycleView,
  blockSwarmLifecycleView,
  cancelSwarmLifecycleView,
  completeSwarmLifecycleView
} from "./state-transition-surfaces.js";

export function createStateTransitionSwarmEntryPoints(shared) {
  const { transitionSwarm } = shared;

  function activateSwarm(input) {
    return activateSwarmLifecycleView(input, { transitionSwarm });
  }

  function blockSwarm(input) {
    return blockSwarmLifecycleView(input, { transitionSwarm });
  }

  function completeSwarm(input) {
    return completeSwarmLifecycleView(input, { transitionSwarm });
  }

  function cancelSwarm(input) {
    return cancelSwarmLifecycleView(input, { transitionSwarm });
  }

  return {
    activateSwarm,
    blockSwarm,
    completeSwarm,
    cancelSwarm
  };
}
