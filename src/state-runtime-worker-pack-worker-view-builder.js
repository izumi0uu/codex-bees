import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackPresenceMetadata,
  buildRuntimePackSessionOverview,
  countRuntimePackEntries
} from "./state-runtime-pack-detail.js";

export function buildRuntimeWorkerPackView(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole,
    normalizeNextMode
  },
  {
    deriveRuntimeWorkerPackSurface,
    deriveRuntimeWorkerPackReason,
    buildRuntimeWorkerPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const session = workerSession(input);
  const handoff = workerHandoff(input);
  const closeout = workerCloseout(input);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const recommendedSurface = deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next });
  const recommendedReason = deriveRuntimeWorkerPackReason({ session, handoff, closeout, next });
  const purposeGuidance = buildRuntimePackFallbackPurposeGuidance(
    next?.candidate ?? null,
    session,
    handoff
  );
  const nextEntries = {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    handoff: handoff?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };

  return {
    kind: "runtime_worker_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: session?.mode ?? normalizeNextMode(input.mode),
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackPresenceMetadata({
      hasFocus: nextEntries.focus,
      hasCandidate: nextEntries.candidate,
      hasHandoff: nextEntries.handoff,
      hasCloseout: nextEntries.closeout
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: buildRuntimePackSessionOverview(session),
    next: nextEntries,
    surfaces: {
      session,
      handoff,
      closeout,
      next
    },
    summary: buildRuntimeWorkerPackSummary(recommendedSurface, session)
  };
}

export function buildRuntimeWorkerPackViewFromSources(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole,
    normalizeNextMode
  },
  {
    deriveRuntimeWorkerPackSurface,
    deriveRuntimeWorkerPackReason,
    buildRuntimeWorkerPackSummary,
    buildRuntimeWorkerPackView
  }
) {
  return buildRuntimeWorkerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole,
      normalizeNextMode
    },
    {
      deriveRuntimeWorkerPackSurface,
      deriveRuntimeWorkerPackReason,
      buildRuntimeWorkerPackSummary
    }
  );
}
