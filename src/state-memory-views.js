export function buildMemoryDetailView(
  id,
  {
    getMemory
  }
) {
  const memory = getMemory(id);
  if (!memory) {
    return null;
  }

  return {
    kind: "memory_detail",
    recommendedReason: "memory_detail_loaded",
    metadata: {
      hasTitle: Boolean(memory.title),
      hasNotes: Boolean(memory.notes),
      tagCount: (memory.tags ?? []).length
    },
    memory
  };
}

export function buildMemoryDetailViewFromSources(
  id,
  {
    getMemory
  },
  {
    buildMemoryDetailView
  }
) {
  return buildMemoryDetailView(id, {
    getMemory
  });
}

export function buildMemoryListView(
  filters = {},
  {
    listMemories
  }
) {
  const memories = listMemories(filters);
  const recommendedReason = memories.length > 0 ? "memory_list_has_results" : "memory_list_empty";
  return {
    kind: "memory_view",
    recommendedReason,
    counts: {
      totalMemories: memories.length
    },
    memories
  };
}

export function buildMemoryListViewFromSources(
  filters = {},
  {
    listMemories
  },
  {
    buildMemoryListView
  }
) {
  return buildMemoryListView(filters, {
    listMemories
  });
}
