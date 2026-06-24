import { validateSwarmValue } from "./state-rules-swarm-validation-core.js";

export function deriveSwarmValidationReason(validation) {
  if (!validation) {
    return "validation_unavailable";
  }
  if (validation.ready) {
    return "swarm_ready_to_queue";
  }
  if ((validation.overlaps?.length ?? 0) > 0) {
    return "swarm_scope_overlap_detected";
  }
  if ((validation.lanes ?? []).some((lane) => lane.ready === false)) {
    return "lane_validation_issues_present";
  }
  if ((validation.issues?.length ?? 0) > 0) {
    return "swarm_validation_issues_present";
  }
  return "swarm_validation_visible";
}

export function buildSwarmValidationView(swarm, roleCatalog) {
  const validation = validateSwarmValue(swarm, roleCatalog);
  return {
    kind: "swarm_validation",
    recommendedReason: deriveSwarmValidationReason(validation),
    ...validation
  };
}

export function buildSwarmValidationViewFromSources(
  swarm,
  {
    runtimeRoleCatalog
  }
) {
  return buildSwarmValidationView(swarm, runtimeRoleCatalog());
}
