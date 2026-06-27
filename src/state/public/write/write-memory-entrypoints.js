import {
  storeMemoryMutationOperation,
  storeMemoryOperation
} from "../../write/index.js";

export function createStateWriteMemoryEntryPoints(shared) {
  const {
    loadState,
    saveState
  } = shared;

  function storeMemory(input) {
    return storeMemoryOperation(input, storeMemorySources);
  }

  function storeMemoryMutation(input) {
    return storeMemoryMutationOperation(input, storeMemoryMutationSources);
  }

  const storeMemorySources = { loadState, saveState };
  const storeMemoryMutationSources = { storeMemory };

  return {
    storeMemory,
    storeMemoryMutation
  };
}
