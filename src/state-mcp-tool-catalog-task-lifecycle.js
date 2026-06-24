import { TASK_LIFECYCLE_PERSISTENCE_MCP_TOOL_CATALOG } from "./state-mcp-tool-catalog-task-lifecycle-persistence.js";
import { TASK_LIFECYCLE_PICKUP_MCP_TOOL_CATALOG } from "./state-mcp-tool-catalog-task-lifecycle-pickup.js";
import { TASK_LIFECYCLE_TRANSITION_MCP_TOOL_CATALOG } from "./state-mcp-tool-catalog-task-lifecycle-transition.js";

export const TASK_LIFECYCLE_MCP_TOOL_CATALOG = [
  ...TASK_LIFECYCLE_PERSISTENCE_MCP_TOOL_CATALOG,
  ...TASK_LIFECYCLE_PICKUP_MCP_TOOL_CATALOG,
  ...TASK_LIFECYCLE_TRANSITION_MCP_TOOL_CATALOG
];
