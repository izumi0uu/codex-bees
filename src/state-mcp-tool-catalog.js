import {
  CORE_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-core.js";
import {
  RUNTIME_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-runtime.js";
import {
  SWARM_MEMORY_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-swarm-memory.js";
import {
  TASK_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-task.js";

export const toolCatalog = [
  ...CORE_MCP_TOOL_CATALOG,
  ...RUNTIME_MCP_TOOL_CATALOG,
  ...TASK_MCP_TOOL_CATALOG,
  ...SWARM_MEMORY_MCP_TOOL_CATALOG
];

function toolGroupFromName(name) {
  if (!name) {
    return "unknown";
  }
  const [group] = name.split("_");
  return group || "unknown";
}

export function getToolCatalogView() {
  const groups = toolCatalog.reduce((counts, tool) => {
    const group = toolGroupFromName(tool.name);
    counts[group] = (counts[group] ?? 0) + 1;
    return counts;
  }, {});

  return {
    kind: "tool_catalog_view",
    recommendedReason: toolCatalog.length > 0 ? "tool_catalog_loaded" : "tool_catalog_empty",
    counts: {
      totalTools: toolCatalog.length,
      groups
    },
    tools: toolCatalog
  };
}

function toolByName(name) {
  return toolCatalog.find((tool) => tool.name === name);
}

export function getMcpToolEntry(name) {
  if (!name) {
    return undefined;
  }

  const tool = toolByName(name);
  return tool ? JSON.parse(JSON.stringify(tool)) : undefined;
}

export function getMcpToolView(name) {
  const tool = getMcpToolEntry(name);

  return {
    kind: "mcp_tool_view",
    recommendedReason: tool ? "mcp_tool_loaded" : "mcp_tool_missing",
    name: name ?? null,
    matchedTool: tool?.name ?? null,
    tool: tool ?? null
  };
}

export function listMcpTools() {
  return JSON.parse(JSON.stringify(toolCatalog));
}
