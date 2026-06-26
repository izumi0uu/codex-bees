function filterMemories(memories, filters = {}) {
  return memories.filter((memory) => {
    if (filters.namespace && memory.namespace !== filters.namespace) {
      return false;
    }
    if (filters.kind && memory.kind !== filters.kind) {
      return false;
    }
    if (filters.agent && memory.agent !== filters.agent) {
      return false;
    }
    if (Array.isArray(filters.tags) && filters.tags.length > 0) {
      const tagSet = new Set(memory.tags);
      for (const tag of filters.tags) {
        if (!tagSet.has(tag)) {
          return false;
        }
      }
    }
    return true;
  });
}

function tokenize(value) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_-]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function scoreMemory(memory, tokens) {
  const haystack = [
    memory.title ?? "",
    memory.content ?? "",
    memory.namespace ?? "",
    memory.kind ?? "",
    memory.agent ?? "",
    ...(memory.tags ?? [])
  ]
    .join(" \n")
    .toLowerCase();

  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

export function listMemoriesFromSources(
  filters = {},
  { loadState }
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
  { listMemories }
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
