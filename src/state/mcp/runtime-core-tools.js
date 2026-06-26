import { COMMAND_CATALOG_CORE_MCP_TOOL_HANDLERS } from "./runtime-core-tool-command-catalog.js";
import { RUNTIME_INFO_CORE_MCP_TOOL_HANDLERS } from "./runtime-core-tool-runtime-info.js";
import { RUNTIME_CATALOG_CORE_MCP_TOOL_HANDLERS } from "./runtime-core-tool-runtime-catalog.js";

const CORE_MCP_TOOL_HANDLERS = {
  ...RUNTIME_INFO_CORE_MCP_TOOL_HANDLERS,
  ...COMMAND_CATALOG_CORE_MCP_TOOL_HANDLERS,
  ...RUNTIME_CATALOG_CORE_MCP_TOOL_HANDLERS
};

function handleCoreMcpTool(id, name, args = {}, metadata) {
  const handler = CORE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { CORE_MCP_TOOL_HANDLERS, handleCoreMcpTool };
