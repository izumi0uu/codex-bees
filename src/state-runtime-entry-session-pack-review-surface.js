import { runtimeReviewPackFromSources } from "./state-runtime-packs.js";

export function runtimeReviewPackSurface(input = {}, sources = {}) {
  return runtimeReviewPackFromSources(input, sources);
}
