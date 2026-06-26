import {
  MEMORY_MCP_TOOL_CATALOG
} from "./tool-catalog-memory.js";
import {
  PLAN_MCP_TOOL_CATALOG
} from "./tool-catalog-plan.js";
import {
  SWARM_MCP_TOOL_CATALOG
} from "./tool-catalog-swarm.js";

export const SWARM_MEMORY_MCP_TOOL_CATALOG = [
  ...SWARM_MCP_TOOL_CATALOG,
  ...PLAN_MCP_TOOL_CATALOG,
  ...MEMORY_MCP_TOOL_CATALOG
];
