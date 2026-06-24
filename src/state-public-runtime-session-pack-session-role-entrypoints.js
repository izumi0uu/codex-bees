import {
  runtimeOwnerPackSurface,
  runtimeReviewPackSurface,
  runtimeRolePackSurface,
  runtimeSessionPackSurface,
  runtimeVerifierPackSurface,
  runtimeWorkerPackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeSessionPackSessionRoleEntryPoints(api, runtimeOverview) {
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

  const runtimeOwnerPackSources = {
    workerSession: api.workerSession,
    workerHandoff: api.workerHandoff,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeOwnerPack = (input = {}) =>
    runtimeOwnerPackSurface(input, runtimeOwnerPackSources);

  const runtimeWorkerPackSources = {
    workerSession: api.workerSession,
    workerHandoff: api.workerHandoff,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeWorkerPack = (input = {}) =>
    runtimeWorkerPackSurface(input, runtimeWorkerPackSources);

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
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeSessionPack,
    runtimeRolePack
  };
}
