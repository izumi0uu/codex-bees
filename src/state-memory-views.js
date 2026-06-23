import { createLoadedValueView } from "./state-view-helpers.js";

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
  const recommendedReason = results.length > 0 ? "memory_search_has_results" : "memory_search_empty";
  return {
    kind: "memory_search_view",
    recommendedReason,
    counts: {
      totalResults: results.length
    },
    query,
    results
  };
}

export function buildMemorySearchViewFromSources(
  query,
  filters = {},
  limit = 10,
  {
    searchMemories
  },
  {
    buildMemorySearchView
  }
) {
  return buildMemorySearchView(query, filters, limit, {
    searchMemories
  });
}
