import { createStateTransitionEntryPoints } from "./state/public/transition-entrypoints.js";
import { createStateWriteEntryPoints } from "./state/public/write-entrypoints.js";

export function createStateAuthoritativeFacade(shared) {
  return {
    ...createStateWriteEntryPoints(shared),
    ...createStateTransitionEntryPoints(shared)
  };
}
