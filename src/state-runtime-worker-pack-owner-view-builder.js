import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackWorkerFlowEntries,
  buildRuntimePackWorkerFlowMetadata,
  buildRuntimePackWorkerFlowSurfaces,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackSessionOverview,
  buildRuntimePackCounts
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
  const nextEntries = buildRuntimePackWorkerFlowEntries(session, handoff, closeout, next);

  return {
    kind: "runtime_owner_pack",
    role: session?.role ?? describeRole(role),
    workerId,
    mode: "owner",
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackWorkerFlowMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackSessionOverview(session),
    next: nextEntries,
    surfaces: buildRuntimePackWorkerFlowSurfaces(session, handoff, closeout, next),
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
    buildRuntimeOwnerPackSummary
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
