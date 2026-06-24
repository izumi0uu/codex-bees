import { TASK_LEADER_MCP_TOOL_HANDLERS } from "./state-mcp-runtime-task-worker-leader-tools-leader.js";
import { TASK_WORKER_MCP_TOOL_HANDLERS } from "./state-mcp-runtime-task-worker-leader-tools-worker.js";

const TASK_WORKER_LEADER_MCP_TOOL_HANDLERS = {
  ...TASK_WORKER_MCP_TOOL_HANDLERS,
  ...TASK_LEADER_MCP_TOOL_HANDLERS
};

function handleTaskWorkerLeaderMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_WORKER_LEADER_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_WORKER_LEADER_MCP_TOOL_HANDLERS, handleTaskWorkerLeaderMcpTool };
