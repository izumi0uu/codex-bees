import {
  TASK_LIFECYCLE_MCP_TOOL_HANDLERS,
  handleTaskLifecycleMcpTool
} from "./state-mcp-runtime-task-lifecycle-tools.js";
import {
  TASK_QUERY_MCP_TOOL_HANDLERS,
  handleTaskQueryMcpTool
} from "./state-mcp-runtime-task-query-tools.js";
import {
  TASK_WORKER_LEADER_MCP_TOOL_HANDLERS,
  handleTaskWorkerLeaderMcpTool
} from "./state-mcp-runtime-task-worker-leader-tools.js";

const TASK_MCP_TOOL_HANDLERS = {
  ...TASK_QUERY_MCP_TOOL_HANDLERS,
  ...TASK_LIFECYCLE_MCP_TOOL_HANDLERS,
  ...TASK_WORKER_LEADER_MCP_TOOL_HANDLERS
};

function handleTaskMcpTool(id, name, args = {}, metadata) {
  return (
    handleTaskQueryMcpTool(id, name, args, metadata) ??
    handleTaskLifecycleMcpTool(id, name, args, metadata) ??
    handleTaskWorkerLeaderMcpTool(id, name, args, metadata)
  );
}

export { TASK_MCP_TOOL_HANDLERS, handleTaskMcpTool };
