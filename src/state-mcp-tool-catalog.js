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
import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";

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

  return createCollectionView("tool_catalog_view", "tools", toolCatalog, {
    loadedReason: "tool_catalog_loaded",
    emptyReason: "tool_catalog_empty",
    counts: {
      totalTools: toolCatalog.length,
      groups
    }
  });
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
  return createResolvedItemView("mcp_tool_view", {
    requestLabel: "name",
    requestValue: name,
    matchedLabel: "matchedTool",
    matchedValue: tool?.name,
    valueLabel: "tool",
    value: tool,
    loadedReason: "mcp_tool_loaded",
    missingReason: "mcp_tool_missing"
  });
}

export function listMcpTools() {
  return JSON.parse(JSON.stringify(toolCatalog));
}
