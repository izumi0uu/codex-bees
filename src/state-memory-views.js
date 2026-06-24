import { createCollectionView, createLoadedValueView } from "./state-view-helpers.js";

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

  return createLoadedValueView("memory_detail", "memory", memory, {
    recommendedReason: "memory_detail_loaded",
    extra: {
      metadata: {
        hasTitle: Boolean(memory.title),
        hasNotes: Boolean(memory.notes),
        tagCount: (memory.tags ?? []).length
      }
    }
  });
}

export function buildMemoryDetailViewFromSources(id, sources) {
  return buildMemoryDetailView(id, sources);
}

export function buildMemoryListView(
  filters = {},
  {
    listMemories
  }
) {
  const memories = listMemories(filters);
  return createCollectionView("memory_view", "memories", memories, {
    loadedReason: "memory_list_has_results",
    emptyReason: "memory_list_empty",
    counts: {
      totalMemories: memories.length
    }
  });
}

export function buildMemoryListViewFromSources(filters = {}, sources) {
  return buildMemoryListView(filters, sources);
}

export function buildMemorySearchView(
  query,
  filters = {},
  limit = 10,
  {
    searchMemories
  }
) {
  const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
  const results = searchMemories(query, filters).slice(0, normalizedLimit);
  return createCollectionView("memory_search_view", "results", results, {
    loadedReason: "memory_search_has_results",
    emptyReason: "memory_search_empty",
    counts: {
      totalResults: results.length
    },
    extra: {
      query
    }
  });
}

export function buildMemorySearchViewFromSources(query, filters = {}, limit = 10, sources) {
  return buildMemorySearchView(query, filters, limit, sources);
}
