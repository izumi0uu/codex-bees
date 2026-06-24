import { createStateAuthoritativeFacade } from "./state-authoritative-facade.js";
import { createStateReadEntryPoints } from "./state-public-read-entrypoints.js";
import { createStateRuntimeEntryPoints } from "./state-public-runtime-entrypoints.js";
import { createStateWorkerEntryPoints } from "./state-public-worker-entrypoints.js";

export function createStatePublicApi(shared) {
  const api = {};
  const authoritative = shared.stateAuthoritativeFacade ?? createStateAuthoritativeFacade(shared);

  Object.assign(api, createStateReadEntryPoints(shared, api));
  Object.assign(api, authoritative);
  Object.assign(api, createStateWorkerEntryPoints(shared, api));
  Object.assign(api, createStateRuntimeEntryPoints(shared, api));

  return api;
}
