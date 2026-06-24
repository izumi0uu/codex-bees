import {
  runtimeReviewPackSurface,
  runtimeRolePackSurface,
  runtimeSessionPackSurface,
  runtimeVerifierPackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeSessionPackSessionRoleReviewRoleEntryPoints(
  api,
  runtimeOverview,
  runtimeOwnerPack,
  runtimeWorkerPack
) {
  const { runtimeRoles, runtimeReview } = runtimeOverview;

  const runtimeVerifierPackSources = {
    runtimeReview,
    verifierBundle: api.verifierBundle,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeVerifierPack = (input = {}) =>
    runtimeVerifierPackSurface(input, runtimeVerifierPackSources);

  const runtimeReviewPackSources = {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  };
  const runtimeReviewPack = (input = {}) =>
    runtimeReviewPackSurface(input, runtimeReviewPackSources);

  const runtimeSessionPackSources = {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  };
  const runtimeSessionPack = (input = {}) =>
    runtimeSessionPackSurface(input, runtimeSessionPackSources);

  const runtimeRolePackSources = {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  };
  const runtimeRolePack = (input = {}) =>
    runtimeRolePackSurface(input, runtimeRolePackSources);

  return {
    runtimeReviewPack,
    runtimeVerifierPack,
    runtimeSessionPack,
    runtimeRolePack
  };
}
