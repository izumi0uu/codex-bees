import { stdin, stdout, stderr } from "node:process";
import { getPackageMetadata } from "./metadata.js";
import { toolCatalog } from "./state-mcp-tool-catalog.js";
import { CORE_MCP_TOOL_HANDLERS, handleCoreMcpTool } from "./state-mcp-runtime-core-tools.js";
import { createError, createSuccess } from "./state-mcp-runtime-response.js";
import { RUNTIME_MCP_TOOL_HANDLERS, handleRuntimeMcpTool } from "./state-mcp-runtime-runtime-tools.js";
import { SWARM_MEMORY_MCP_TOOL_HANDLERS, handleSwarmMemoryMcpTool } from "./state-mcp-runtime-swarm-memory-tools.js";
import { TASK_MCP_TOOL_HANDLERS, handleTaskMcpTool } from "./state-mcp-runtime-task-tools.js";

const MCP_TOOL_FAMILIES = [
  handleCoreMcpTool,
  handleRuntimeMcpTool,
  handleTaskMcpTool,
  handleSwarmMemoryMcpTool
];
const MCP_TOOL_HANDLER_REGISTRIES = [
  CORE_MCP_TOOL_HANDLERS,
  RUNTIME_MCP_TOOL_HANDLERS,
  TASK_MCP_TOOL_HANDLERS,
  SWARM_MEMORY_MCP_TOOL_HANDLERS
];

const HANDLED_TOOL_NAMES = new Set([
  ...MCP_TOOL_HANDLER_REGISTRIES.flatMap((registry) => Object.keys(registry))
]);

const missingHandlers = toolCatalog
  .map((tool) => tool.name)
  .filter((name) => !HANDLED_TOOL_NAMES.has(name));
const extraHandlers = Array.from(HANDLED_TOOL_NAMES).filter(
  (name) => !toolCatalog.some((tool) => tool.name === name)
);

if (missingHandlers.length > 0 || extraHandlers.length > 0) {
  throw new Error(`MCP tool handler coverage mismatch: missing=${missingHandlers.join(",") || "none"} extra=${extraHandlers.join(",") || "none"}`);
}

function handleToolCall(id, name, args, metadata) {
  for (const family of MCP_TOOL_FAMILIES) {
    const response = family(id, name, args, metadata);
    if (response) {
      return response;
    }
  }

  return createError(id, -32602, `Unknown tool: ${name}`);
}

function handleRequest(message) {
  const { id = null, method, params = {} } = message ?? {};
  const metadata = getPackageMetadata();

  if (method === "initialize") {
    return createSuccess(id, {
      serverInfo: {
        name: metadata.product,
        version: metadata.version
      },
      capabilities: {
        tools: { listChanged: false }
      }
    });
  }

  if (method === "tools/list") {
    return createSuccess(id, { tools: toolCatalog });
  }

  if (method === "tools/call") {
    return handleToolCall(id, params.name, params.arguments ?? {}, metadata);
  }

  return createError(id, -32601, `Unsupported method: ${method}`);
}

export function handleMcpRequest(message) {
  return JSON.parse(handleRequest(message));
}

export function callMcpTool(name, args = {}) {
  const response = handleMcpRequest({
    jsonrpc: "2.0",
    id: null,
    method: "tools/call",
    params: {
      name,
      arguments: args
    }
  });

  if (response.error) {
    const error = new Error(response.error.message);
    error.code = response.error.code;
    throw error;
  }

  return response.result;
}

export function serializeMcpMessage(message) {
  return JSON.stringify(message) + "\n";
}

export async function startMcpServer() {
  stderr.write("[codex-bees:mcp] stdio runtime ready\n");

  let buffer = "";

  stdin.setEncoding("utf8");

  stdin.on("data", (chunk) => {
    buffer += chunk;

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line.length > 0) {
        try {
          const message = JSON.parse(line);
          stdout.write(handleRequest(message));
        } catch (error) {
          stdout.write(createError(null, -32700, `Invalid JSON input: ${error.message}`));
        }
      }

      newlineIndex = buffer.indexOf("\n");
    }
  });

  stdin.on("end", () => {
    stderr.write("[codex-bees:mcp] stdio runtime closed\n");
  });
}
