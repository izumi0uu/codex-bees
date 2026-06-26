export const MEMORY_MCP_TOOL_CATALOG = [
  {
    name: "memory_store",
    description: "Store a persistent local memory for later recall.",
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
        namespace: { type: "string" },
        kind: { type: "string" },
        title: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "memory_get",
    description: "Load one persistent local memory by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "memory_list",
    description: "List persistent local memories with optional filters.",
    inputSchema: {
      type: "object",
      properties: {
        namespace: { type: "string" },
        kind: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "memory_search",
    description: "Search persistent local memories by query and optional filters.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
        namespace: { type: "string" },
        kind: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        limit: { type: "number" }
      }
    }
  }
];
