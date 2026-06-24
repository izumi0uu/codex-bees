import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackPresenceMetadata,
  requireRuntimePackRoleWorkerSelection,
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
  const selection = requireRuntimePackRoleWorkerSelection(input);
  if (!selection) {
    return null;
  }
  const { role, workerId } = selection;

  const normalized = {
    ...input,
    role,
    workerId,
    mode: "owner"
  };
  const session = workerSession(normalized);
  const handoff = workerHandoff(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role,
    workerId,
    mode: "owner"
  });
  const recommendedSurface = deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role, workerId });
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
    role: session?.role ?? describeRole(role),
    workerId,
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
