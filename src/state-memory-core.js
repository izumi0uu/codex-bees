export function listMemoriesFromSources(
  filters = {},
  {
    loadState,
    filterMemories
  }
) {
  return filterMemories(loadState().memories, filters);
}

export function getMemoryFromSources(
  id,
  {
    loadState,
    normalizeMemory
  }
) {
  const memory = loadState().memories.find((item) => item.id === id);
  return memory ? normalizeMemory(memory) : null;
}

export function storeMemoryFromSources(
  input,
  {
    loadState,
    saveState,
    buildMemory
  }
) {
  const state = loadState();
  const memory = buildMemory(input, state.nextMemoryId);
  state.memories.push(memory);
  state.nextMemoryId += 1;
  saveState(state);
  return memory;
}

export function searchMemoriesFromSources(
  query,
  filters = {},
  {
    listMemories,
    tokenize,
    scoreMemory
  }
) {
  const memories = listMemories(filters);
  if (!query?.trim()) {
    return memories.map((memory) => ({ ...memory, score: 0 }));
  }

  const tokens = tokenize(query);
  return memories
    .map((memory) => ({
      ...memory,
      score: scoreMemory(memory, tokens)
    }))
    .filter((memory) => memory.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.updatedAt.localeCompare(left.updatedAt);
    });
}
