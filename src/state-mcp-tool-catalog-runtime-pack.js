import { RUNTIME_PACK_ORCHESTRATION_MCP_TOOL_CATALOG } from "./state-mcp-tool-catalog-runtime-pack-orchestration.js";
import { RUNTIME_PACK_SESSION_MCP_TOOL_CATALOG } from "./state-mcp-tool-catalog-runtime-pack-session.js";

export const RUNTIME_PACK_MCP_TOOL_CATALOG = [
  ...RUNTIME_PACK_SESSION_MCP_TOOL_CATALOG,
  ...RUNTIME_PACK_ORCHESTRATION_MCP_TOOL_CATALOG
];
