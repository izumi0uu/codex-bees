import { createStateAuthoritativeFacade } from "./authoritative-facade.js";
import { createStateReadEntryPoints } from "./read/read-entrypoints.js";
import { createStateRuntimeEntryPoints } from "./runtime/runtime-entrypoints.js";
import { createStateWorkerEntryPoints } from "./worker/worker-entrypoints.js";

export function createStatePublicApi(shared) {
  const api = {};
  const authoritative = shared.stateAuthoritativeFacade ?? createStateAuthoritativeFacade(shared);

  Object.assign(api, createStateReadEntryPoints(shared, api));
  Object.assign(api, authoritative);
  Object.assign(api, createStateWorkerEntryPoints(shared, api));
  Object.assign(api, createStateRuntimeEntryPoints(shared, api));

  return api;
}
