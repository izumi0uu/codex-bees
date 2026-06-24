import { RUNTIME_PACK_ORCHESTRATION_MCP_TOOL_HANDLERS } from "./state-mcp-runtime-runtime-pack-orchestration-tools.js";
import { RUNTIME_PACK_SESSION_MCP_TOOL_HANDLERS } from "./state-mcp-runtime-runtime-pack-session-tools.js";

const RUNTIME_PACK_MCP_TOOL_HANDLERS = {
  ...RUNTIME_PACK_ORCHESTRATION_MCP_TOOL_HANDLERS,
  ...RUNTIME_PACK_SESSION_MCP_TOOL_HANDLERS
};

function handleRuntimePackMcpTool(id, name, args = {}, metadata) {
  const handler = RUNTIME_PACK_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { RUNTIME_PACK_MCP_TOOL_HANDLERS, handleRuntimePackMcpTool };
