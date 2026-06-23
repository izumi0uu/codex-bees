import { runtimeVerifierPackFromSources } from "./state-runtime-packs.js";

export function runtimeVerifierPackSurface(input = {}, { runtimeReview, verifierBundle, workerCloseout, taskNext }) {
  return runtimeVerifierPackFromSources(input, {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  });
}
