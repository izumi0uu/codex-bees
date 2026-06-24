import {
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries
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
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "verifier"
  };
  const review = runtimeReview();
  const bundle = verifierBundle(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: "verifier"
  });
  const recommendedSurface = deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role: input.role });
  const recommendedReason = deriveRuntimeVerifierPackReason({ review, bundle, closeout, next });
  const nextEntries = {
    review: review?.next ?? null,
    candidate: next?.candidate ?? null,
    decision: bundle?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };

  return {
    kind: "runtime_verifier_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: "verifier",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasReview: nextEntries.review,
      hasCandidate: nextEntries.candidate,
      hasDecision: nextEntries.decision,
      hasCloseout: nextEntries.closeout
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      review: review?.counts ?? null,
      bundle: bundle?.currentTask ? { currentTask: bundle.currentTask.id } : { currentTask: null }
    },
    next: nextEntries,
    surfaces: {
      review,
      bundle,
      closeout,
      next
    },
    summary: buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review)
  };
}

export function buildRuntimeVerifierPackViewFromSources(
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
    buildRuntimeVerifierPackSummary,
    buildRuntimeVerifierPackView
  }
) {
  return buildRuntimeVerifierPackView(
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
  );
}
