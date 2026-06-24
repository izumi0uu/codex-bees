import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackPresenceMetadata,
  buildRuntimePackSessionOverview,
  countRuntimePackEntries
} from "./state-runtime-pack-detail.js";

export function buildRuntimeOwnerPackView(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole
  },
  {
    deriveRuntimeOwnerPackSurface,
    deriveRuntimeOwnerPackReason,
    buildRuntimeOwnerPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "owner"
  };
  const session = workerSession(normalized);
  const handoff = workerHandoff(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: "owner"
  });
  const recommendedSurface = deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role: input.role, workerId: input.workerId });
  const recommendedReason = deriveRuntimeOwnerPackReason({ session, handoff, closeout, next });
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
    kind: "runtime_owner_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: "owner",
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
    summary: buildRuntimeOwnerPackSummary(recommendedSurface, session)
  };
}

export function buildRuntimeOwnerPackViewFromSources(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole
  },
  {
    deriveRuntimeOwnerPackSurface,
    deriveRuntimeOwnerPackReason,
    buildRuntimeOwnerPackSummary,
    buildRuntimeOwnerPackView
  }
) {
  return buildRuntimeOwnerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeOwnerPackSurface,
      deriveRuntimeOwnerPackReason,
      buildRuntimeOwnerPackSummary
    }
  );
}
