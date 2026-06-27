import { buildSwarmLifecycleResult } from "../core/lifecycle-views.js";

export function activateSwarmLifecycleView(input, { transitionSwarm }) {
  return buildSwarmLifecycleResult(
    transitionSwarm({
      ...input,
      nextStatus: "active"
    }),
    "swarm_activated"
  );
}

export function blockSwarmLifecycleView(input, { transitionSwarm }) {
  return buildSwarmLifecycleResult(
    transitionSwarm({
      ...input,
      nextStatus: "blocked"
    }),
    "swarm_blocked"
  );
}

export function completeSwarmLifecycleView(input, { transitionSwarm }) {
  return buildSwarmLifecycleResult(
    transitionSwarm({
      ...input,
      nextStatus: "completed"
    }),
    "swarm_completed"
  );
}

export function cancelSwarmLifecycleView(input, { transitionSwarm }) {
  return buildSwarmLifecycleResult(
    transitionSwarm({
      ...input,
      nextStatus: "cancelled"
    }),
    "swarm_cancelled"
  );
}
