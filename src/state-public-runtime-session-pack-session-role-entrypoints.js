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

  function runtimeVerifierPack(input = {}) {
    return runtimeVerifierPackSurface(input, {
      runtimeReview,
      verifierBundle: api.verifierBundle,
      workerCloseout: api.workerCloseout,
      taskNext: api.taskNext
    });
  }

  function runtimeReviewPack(input = {}) {
    return runtimeReviewPackSurface(input, {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack
    });
  }

  function runtimeOwnerPack(input = {}) {
    return runtimeOwnerPackSurface(input, {
      workerSession: api.workerSession,
      workerHandoff: api.workerHandoff,
      workerCloseout: api.workerCloseout,
      taskNext: api.taskNext
    });
  }

  function runtimeWorkerPack(input = {}) {
    return runtimeWorkerPackSurface(input, {
      workerSession: api.workerSession,
      workerHandoff: api.workerHandoff,
      workerCloseout: api.workerCloseout,
      taskNext: api.taskNext
    });
  }

  function runtimeSessionPack(input = {}) {
    return runtimeSessionPackSurface(input, {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles
    });
  }

  function runtimeRolePack(input = {}) {
    return runtimeRolePackSurface(input, {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack
    });
  }

  return {
    runtimeReviewPack,
    runtimeVerifierPack,
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeSessionPack,
    runtimeRolePack
  };
}
