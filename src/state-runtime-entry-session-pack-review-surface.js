import { runtimeReviewPackFromSources } from "./state-runtime-packs.js";

export function runtimeReviewPackSurface(input = {}, { runtimeReview, runtimeRoles, runtimeVerifierPack }) {
  return runtimeReviewPackFromSources(input, {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  });
}
