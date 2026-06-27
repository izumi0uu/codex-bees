import { createStateRuntimeSessionPackSessionRoleOwnerWorkerEntryPoints } from "./runtime-session-pack-session-role-owner-worker-entrypoints.js";
import { createStateRuntimeSessionPackSessionRoleReviewRoleEntryPoints } from "./runtime-session-pack-session-role-review-role-entrypoints.js";

export function createStateRuntimeSessionPackSessionRoleEntryPoints(api, runtimeOverview) {
  const ownerWorker = createStateRuntimeSessionPackSessionRoleOwnerWorkerEntryPoints(api);
  const reviewRole = createStateRuntimeSessionPackSessionRoleReviewRoleEntryPoints(
    api,
    runtimeOverview,
    ownerWorker.runtimeOwnerPack,
    ownerWorker.runtimeWorkerPack
  );

  return {
    runtimeReviewPack: reviewRole.runtimeReviewPack,
    runtimeVerifierPack: reviewRole.runtimeVerifierPack,
    runtimeOwnerPack: ownerWorker.runtimeOwnerPack,
    runtimeWorkerPack: ownerWorker.runtimeWorkerPack,
    runtimeSessionPack: reviewRole.runtimeSessionPack,
    runtimeRolePack: reviewRole.runtimeRolePack
  };
}
