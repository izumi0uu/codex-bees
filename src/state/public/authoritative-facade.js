import { createStateTransitionEntryPoints } from "./transition/transition-entrypoints.js";
import { createStateWriteEntryPoints } from "./write/write-entrypoints.js";

export function createStateAuthoritativeFacade(shared) {
  return {
    ...createStateWriteEntryPoints(shared),
    ...createStateTransitionEntryPoints(shared)
  };
}
