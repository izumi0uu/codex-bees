import {
  activateSwarmLifecycleView,
  blockSwarmLifecycleView,
  cancelSwarmLifecycleView,
  completeSwarmLifecycleView
} from "../../swarm/transition-surfaces.js";

export function createStateTransitionSwarmEntryPoints(shared) {
  const { transitionSwarm } = shared;

  function activateSwarm(input) {
    return activateSwarmLifecycleView(input, activateSwarmSources);
  }

  function blockSwarm(input) {
    return blockSwarmLifecycleView(input, blockSwarmSources);
  }

  function completeSwarm(input) {
    return completeSwarmLifecycleView(input, completeSwarmSources);
  }

  function cancelSwarm(input) {
    return cancelSwarmLifecycleView(input, cancelSwarmSources);
  }

  const activateSwarmSources = { transitionSwarm };
  const blockSwarmSources = { transitionSwarm };
  const completeSwarmSources = { transitionSwarm };
  const cancelSwarmSources = { transitionSwarm };

  return {
    activateSwarm,
    blockSwarm,
    completeSwarm,
    cancelSwarm
  };
}
