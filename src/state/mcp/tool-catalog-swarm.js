import { SWARM_LIFECYCLE_MCP_TOOL_CATALOG } from "./tool-catalog-swarm-lifecycle.js";
import { SWARM_QUERY_MCP_TOOL_CATALOG } from "./tool-catalog-swarm-query.js";

export const SWARM_MCP_TOOL_CATALOG = [
  ...SWARM_QUERY_MCP_TOOL_CATALOG,
  ...SWARM_LIFECYCLE_MCP_TOOL_CATALOG
];
