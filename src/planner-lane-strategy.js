import { inferPlannerIntent, touchesPublicRuntime } from "./planner-scope.js";

export function derivePlannerTaskClass(intent) {
  if (intent.docsOnly) {
    return "docs-only";
  }
  if (intent.docs) {
    return "docs-runtime";
  }
  if (intent.coordination) {
    return "coordination-kernel";
  }
  if (intent.catalog) {
    return "catalog-contract";
  }
  if (intent.runtime) {
    return "runtime-surface";
  }
  if (intent.build) {
    return "build-verification";
  }
  return "general";
}

export function derivePlannerStrategy(task, implementationScope, intent = inferPlannerIntent(task, implementationScope), plannerProfile = null) {
  const publicSurface = intent.publicRuntime || intent.catalog || touchesPublicRuntime(implementationScope);
  const needsDiscovery = !intent.docsOnly && (
    intent.coordination ||
    (intent.catalog && implementationScope.length > 1) ||
    (intent.build && implementationScope.length > 2) ||
    implementationScope.length > 3
  );
  const needsVerification = !intent.docsOnly && intent.verificationHeavy;
  const coordinationDocumentationSidecar =
    plannerProfile?.planningHints?.documentationMode === "discovery-sidecar" && intent.coordination;
  const needsDocumentation = !intent.docsOnly && (
    intent.docs ||
    intent.publicRuntime ||
    intent.catalog ||
    coordinationDocumentationSidecar
  );

  let laneStrategy = "implement-verify";
  if (intent.docsOnly) {
    laneStrategy = "documentation";
  } else if (needsDiscovery && needsDocumentation) {
    laneStrategy = "discover-implement-verify-docs";
  } else if (needsDiscovery) {
    laneStrategy = "discover-implement-verify";
  } else if (needsDocumentation) {
    laneStrategy = "implement-verify-docs";
  }

  return {
    taskClass: derivePlannerTaskClass(intent),
    laneStrategy,
    publicSurface,
    needsDiscovery,
    needsVerification,
    needsDocumentation
  };
}
