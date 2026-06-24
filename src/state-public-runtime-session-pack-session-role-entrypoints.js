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
    return runtimeVerifierPackSurface(input, runtimeVerifierPackSources);
  }

  function runtimeReviewPack(input = {}) {
    return runtimeReviewPackSurface(input, runtimeReviewPackSources);
  }

  function runtimeOwnerPack(input = {}) {
    return runtimeOwnerPackSurface(input, runtimeOwnerPackSources);
  }

  function runtimeWorkerPack(input = {}) {
    return runtimeWorkerPackSurface(input, runtimeWorkerPackSources);
  }

  function runtimeSessionPack(input = {}) {
    return runtimeSessionPackSurface(input, runtimeSessionPackSources);
  }

  function runtimeRolePack(input = {}) {
    return runtimeRolePackSurface(input, runtimeRolePackSources);
  }

  const runtimeVerifierPackSources = {
    runtimeReview,
    verifierBundle: api.verifierBundle,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeReviewPackSources = {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  };
  const runtimeOwnerPackSources = {
    workerSession: api.workerSession,
    workerHandoff: api.workerHandoff,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeWorkerPackSources = {
    workerSession: api.workerSession,
    workerHandoff: api.workerHandoff,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeSessionPackSources = {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  };
  const runtimeRolePackSources = {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  };

  return {
    runtimeReviewPack,
    runtimeVerifierPack,
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeSessionPack,
    runtimeRolePack
  };
}
