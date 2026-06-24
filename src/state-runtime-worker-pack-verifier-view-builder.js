import {
  buildRuntimePackVerifierFlowEntries,
  buildRuntimePackVerifierFlowMetadata,
  buildRuntimePackVerifierOverview,
  buildRuntimePackVerifierSurfaces,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackCounts
} from "./state-runtime-pack-detail.js";

export function buildRuntimeVerifierPackView(
  input,
  {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext,
    describeRole
  },
  {
    deriveRuntimeVerifierPackSurface,
    deriveRuntimeVerifierPackReason,
    buildRuntimeVerifierPackSummary
  }
) {
  const selection = requireRuntimePackRoleWorkerSelection(input);
  if (!selection) {
    return null;
  }
  const { role, workerId } = selection;

  const normalized = {
    ...input,
    role,
    workerId,
    mode: "verifier"
  };
  const review = runtimeReview();
  const bundle = verifierBundle(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role,
    workerId,
    mode: "verifier"
  });
  const recommendedSurface = deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role });
  const recommendedReason = deriveRuntimeVerifierPackReason({ review, bundle, closeout, next });
  const nextEntries = buildRuntimePackVerifierFlowEntries(review, bundle, closeout, next);

  return {
    kind: "runtime_verifier_pack",
    role: describeRole(role),
    workerId,
    mode: "verifier",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackVerifierFlowMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackVerifierOverview(review, bundle),
    next: nextEntries,
    surfaces: buildRuntimePackVerifierSurfaces(review, bundle, closeout, next),
    summary: buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review)
  };
}

