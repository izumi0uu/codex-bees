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
