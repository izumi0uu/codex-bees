import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackWorkerFlowEntries,
  buildRuntimePackWorkerFlowMetadata,
  buildRuntimePackWorkerFlowSurfaces,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackSessionOverview,
  buildRuntimePackCounts
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
  const selection = requireRuntimePackRoleWorkerSelection(input);
  if (!selection) {
    return null;
  }
  const { role, workerId } = selection;

  const session = workerSession({ ...input, role, workerId });
  const handoff = workerHandoff({ ...input, role, workerId });
  const closeout = workerCloseout({ ...input, role, workerId });
  const next = taskNext({
    role,
    workerId,
    mode: input.mode ?? "any"
  });
  const recommendedSurface = deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next });
  const recommendedReason = deriveRuntimeWorkerPackReason({ session, handoff, closeout, next });
  const purposeGuidance = buildRuntimePackFallbackPurposeGuidance(
    next?.candidate ?? null,
    session,
    handoff
  );
  const nextEntries = buildRuntimePackWorkerFlowEntries(session, handoff, closeout, next);

  return {
    kind: "runtime_worker_pack",
    role: session?.role ?? describeRole(role),
    workerId,
    mode: session?.mode ?? normalizeNextMode(input.mode),
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackWorkerFlowMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackSessionOverview(session),
    next: nextEntries,
    surfaces: buildRuntimePackWorkerFlowSurfaces(session, handoff, closeout, next),
    summary: buildRuntimeWorkerPackSummary(recommendedSurface, session)
  };
}

