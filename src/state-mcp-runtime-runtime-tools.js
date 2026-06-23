import {
  RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS,
  handleRuntimeOverviewMcpTool
} from "./state-mcp-runtime-runtime-overview-tools.js";
import {
  RUNTIME_PACK_MCP_TOOL_HANDLERS,
  handleRuntimePackMcpTool
} from "./state-mcp-runtime-runtime-pack-tools.js";

const RUNTIME_MCP_TOOL_HANDLERS = {
  ...RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS,
  ...RUNTIME_PACK_MCP_TOOL_HANDLERS
};

function handleRuntimeMcpTool(id, name, args = {}, metadata) {
  return (
    handleRuntimeOverviewMcpTool(id, name, args, metadata) ??
    handleRuntimePackMcpTool(id, name, args, metadata)
  );
}

export { RUNTIME_MCP_TOOL_HANDLERS, handleRuntimeMcpTool };
