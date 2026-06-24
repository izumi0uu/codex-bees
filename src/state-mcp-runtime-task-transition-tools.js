import { TASK_TRANSITION_LIFECYCLE_MCP_TOOL_HANDLERS } from "./state-mcp-runtime-task-transition-tool-lifecycle.js";
import { TASK_TRANSITION_PICKUP_MCP_TOOL_HANDLERS } from "./state-mcp-runtime-task-transition-tool-pickup.js";

const TASK_TRANSITION_MCP_TOOL_HANDLERS = {
  ...TASK_TRANSITION_PICKUP_MCP_TOOL_HANDLERS,
  ...TASK_TRANSITION_LIFECYCLE_MCP_TOOL_HANDLERS
};

function handleTaskTransitionMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_TRANSITION_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_TRANSITION_MCP_TOOL_HANDLERS, handleTaskTransitionMcpTool };
