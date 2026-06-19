export function getCoordinationOverview() {
  return {
    executionModel: "local bounded multi-agent coordination",
    deliveryBoundary: "codex-only runtime",
    changeModel: "small reversible steps"
  };
}

export function getCoordinationOverviewView() {
  const overview = getCoordinationOverview();
  return {
    kind: "coordination_overview_view",
    recommendedReason: "coordination_model_loaded",
    counts: {
      facets: Object.keys(overview).length
    },
    overview
  };
}

export function getWorkerGuidelines() {
  return {
    fileOwnership: "one active writer per file",
    parallelism: "parallelize only with disjoint ownership",
    validation: ["targeted verification", "fresh evidence", "handoff discipline"]
  };
}

export function getWorkerGuidelinesView() {
  const guidelines = getWorkerGuidelines();
  return {
    kind: "worker_guidelines_view",
    recommendedReason: "worker_guidelines_loaded",
    counts: {
      ruleSections: 2,
      validationSteps: guidelines.validation.length
    },
    guidelines
  };
}
