import {
  buildRuntimePackTriageEntries,
  buildRuntimePackTriageMetadata,
  buildRuntimePackTriageOverview,
  buildRuntimePackTriageSurfaces,
  buildRuntimePackCounts
} from './state-runtime-pack-detail.js';

export function buildRuntimeTriagePackView(
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeTriagePackSurface,
    deriveRuntimeTriagePackReason,
    buildRuntimeTriagePackSummary
  }
) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery });
  const recommendedReason = deriveRuntimeTriagePackReason({ focus, alerts, review, recovery });
  const nextEntries = buildRuntimePackTriageEntries(focus, alerts, review, recovery);

  return {
    kind: "runtime_triage_pack",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackTriageMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackTriageOverview(focus, alerts, review, recovery),
    next: nextEntries,
    surfaces: buildRuntimePackTriageSurfaces(focus, alerts, review, recovery),
    summary: buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery)
  };
}

