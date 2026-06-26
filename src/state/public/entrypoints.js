import { createStateAuthoritativeFacade } from "../../state-authoritative-facade.js";
import { createStateReadEntryPoints } from "./read-entrypoints.js";
import { createStateRuntimeEntryPoints } from "./runtime-entrypoints.js";
import { createStateWorkerEntryPoints } from "./worker-entrypoints.js";

export function createStatePublicApi(shared) {
  const api = {};
  const authoritative = shared.stateAuthoritativeFacade ?? createStateAuthoritativeFacade(shared);

  Object.assign(api, createStateReadEntryPoints(shared, api));
  Object.assign(api, authoritative);
  Object.assign(api, createStateWorkerEntryPoints(shared, api));
  Object.assign(api, createStateRuntimeEntryPoints(shared, api));

  return api;
}
