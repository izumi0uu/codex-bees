import {
  MEMORY_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-memory.js";
import {
  PLAN_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-plan.js";
import {
  SWARM_MCP_TOOL_CATALOG
} from "./state-mcp-tool-catalog-swarm.js";

export const SWARM_MEMORY_MCP_TOOL_CATALOG = [
  ...SWARM_MCP_TOOL_CATALOG,
  ...PLAN_MCP_TOOL_CATALOG,
  ...MEMORY_MCP_TOOL_CATALOG
];
