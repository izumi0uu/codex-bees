import {
  MEMORY_MCP_TOOL_HANDLERS,
  handleMemoryMcpTool
} from "./state-mcp-runtime-memory-tools.js";
import {
  PLAN_MCP_TOOL_HANDLERS,
  handlePlanMcpTool
} from "./state-mcp-runtime-plan-tools.js";
import {
  SWARM_MCP_TOOL_HANDLERS,
  handleSwarmMcpTool
} from "./state-mcp-runtime-swarm-tools.js";

const SWARM_MEMORY_MCP_TOOL_HANDLERS = {
  ...PLAN_MCP_TOOL_HANDLERS,
  ...SWARM_MCP_TOOL_HANDLERS,
  ...MEMORY_MCP_TOOL_HANDLERS
};

function handleSwarmMemoryMcpTool(id, name, args = {}, metadata) {
  return (
    handlePlanMcpTool(id, name, args, metadata) ??
    handleSwarmMcpTool(id, name, args, metadata) ??
    handleMemoryMcpTool(id, name, args, metadata)
  );
}

export { SWARM_MEMORY_MCP_TOOL_HANDLERS, handleSwarmMemoryMcpTool };
