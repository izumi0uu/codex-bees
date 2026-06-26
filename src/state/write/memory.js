import { buildMemory } from "../../state-builders.js";
import { buildMemoryMutationResult } from "../../state-lifecycle-views.js";
import { storeMemoryFromSources } from "../memory/core.js";

export function storeMemoryOperation(input, { loadState, saveState }) {
  return storeMemoryFromSources(input, {
    loadState,
    saveState,
    buildMemory
  });
}

export function storeMemoryMutationOperation(input, { storeMemory }) {
  return buildMemoryMutationResult(storeMemory(input), "memory_stored");
}
