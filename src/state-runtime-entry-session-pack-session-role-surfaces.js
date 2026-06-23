import {
  runtimeOwnerPackFromSources,
  runtimeReviewPackFromSources,
  runtimeRolePackFromSources,
  runtimeSessionPackFromSources,
  runtimeVerifierPackFromSources,
  runtimeWorkerPackFromSources
} from "./state-runtime-packs.js";

export function runtimeReviewPackSurface(input = {}, { runtimeReview, runtimeRoles, runtimeVerifierPack }) {
  return runtimeReviewPackFromSources(input, {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  });
}

export function runtimeSessionPackSurface(input = {}, { runtimeWorkerPack, runtimeOwnerPack, runtimeVerifierPack, runtimeRoles }) {
  return runtimeSessionPackFromSources(input, {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  });
}

export function runtimeRolePackSurface(input = {}, { runtimeRoles, runtimeSessionPack, runtimeOwnerPack, runtimeVerifierPack }) {
  return runtimeRolePackFromSources(input, {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  });
}

export function runtimeOwnerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeOwnerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeWorkerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeWorkerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeVerifierPackSurface(input = {}, { runtimeReview, verifierBundle, workerCloseout, taskNext }) {
  return runtimeVerifierPackFromSources(input, {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  });
}
