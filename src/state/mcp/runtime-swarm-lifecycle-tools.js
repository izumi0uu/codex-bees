import { SWARM_LIFECYCLE_CONTRACT_MCP_TOOL_HANDLERS } from "./runtime-swarm-lifecycle-contract-tools.js";
import { SWARM_LIFECYCLE_EXECUTION_MCP_TOOL_HANDLERS } from "./runtime-swarm-lifecycle-execution-tools.js";

const SWARM_LIFECYCLE_MCP_TOOL_HANDLERS = {
  ...SWARM_LIFECYCLE_CONTRACT_MCP_TOOL_HANDLERS,
  ...SWARM_LIFECYCLE_EXECUTION_MCP_TOOL_HANDLERS
};

function handleSwarmLifecycleMcpTool(id, name, args = {}, metadata) {
  const handler = SWARM_LIFECYCLE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { SWARM_LIFECYCLE_MCP_TOOL_HANDLERS, handleSwarmLifecycleMcpTool };
