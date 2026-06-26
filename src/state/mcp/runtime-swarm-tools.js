import {
  SWARM_LIFECYCLE_MCP_TOOL_HANDLERS,
  handleSwarmLifecycleMcpTool
} from "./runtime-swarm-lifecycle-tools.js";
import {
  SWARM_QUERY_MCP_TOOL_HANDLERS,
  handleSwarmQueryMcpTool
} from "./runtime-swarm-query-tools.js";

const SWARM_MCP_TOOL_HANDLERS = {
  ...SWARM_QUERY_MCP_TOOL_HANDLERS,
  ...SWARM_LIFECYCLE_MCP_TOOL_HANDLERS
};

function handleSwarmMcpTool(id, name, args = {}, metadata) {
  return (
    handleSwarmQueryMcpTool(id, name, args, metadata) ??
    handleSwarmLifecycleMcpTool(id, name, args, metadata)
  );
}

export { SWARM_MCP_TOOL_HANDLERS, handleSwarmMcpTool };
