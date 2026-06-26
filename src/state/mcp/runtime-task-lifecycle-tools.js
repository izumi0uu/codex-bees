import {
  TASK_MAINTENANCE_MCP_TOOL_HANDLERS,
  handleTaskMaintenanceMcpTool
} from "./runtime-task-maintenance-tools.js";
import {
  TASK_TRANSITION_MCP_TOOL_HANDLERS,
  handleTaskTransitionMcpTool
} from "./runtime-task-transition-tools.js";

const TASK_LIFECYCLE_MCP_TOOL_HANDLERS = {
  ...TASK_MAINTENANCE_MCP_TOOL_HANDLERS,
  ...TASK_TRANSITION_MCP_TOOL_HANDLERS
};

function handleTaskLifecycleMcpTool(id, name, args = {}, metadata) {
  return (
    handleTaskMaintenanceMcpTool(id, name, args, metadata) ??
    handleTaskTransitionMcpTool(id, name, args, metadata)
  );
}

export { TASK_LIFECYCLE_MCP_TOOL_HANDLERS, handleTaskLifecycleMcpTool };
