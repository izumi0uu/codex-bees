import { createLoadedValueView } from "../state/core/view-helpers.js";

export function getCoordinationOverview() {
  return {
    executionModel: "local bounded multi-agent coordination",
    deliveryBoundary: "codex-only runtime",
    changeModel: "small reversible steps"
  };
}

export function getCoordinationOverviewView() {
  const overview = getCoordinationOverview();
  return createLoadedValueView("coordination_overview_view", "overview", overview, {
    recommendedReason: "coordination_model_loaded",
    counts: {
      facets: Object.keys(overview).length
    }
  });
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
  return createLoadedValueView("worker_guidelines_view", "guidelines", guidelines, {
    recommendedReason: "worker_guidelines_loaded",
    counts: {
      ruleSections: 2,
      validationSteps: guidelines.validation.length
    }
  });
}
