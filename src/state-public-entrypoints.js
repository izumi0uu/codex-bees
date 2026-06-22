import { createStateReadEntryPoints } from "./state-public-read-entrypoints.js";
import { createStateRuntimeEntryPoints } from "./state-public-runtime-entrypoints.js";
import { createStateTransitionEntryPoints } from "./state-public-transition-entrypoints.js";
import { createStateWorkerEntryPoints } from "./state-public-worker-entrypoints.js";
import { createStateWriteEntryPoints } from "./state-public-write-entrypoints.js";

export function createStatePublicApi(shared) {
  const api = {};

  Object.assign(api, createStateReadEntryPoints(shared, api));
  Object.assign(api, createStateWriteEntryPoints(shared, api));
  Object.assign(api, createStateTransitionEntryPoints(shared, api));
  Object.assign(api, createStateWorkerEntryPoints(shared, api));
  Object.assign(api, createStateRuntimeEntryPoints(shared, api));

  return api;
}
