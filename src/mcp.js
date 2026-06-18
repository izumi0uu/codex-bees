import { stdin, stdout, stderr } from "node:process";

export const toolCatalog = [
  {
    name: "jira_story_context",
    description: "Summarize the active Jira-first execution contract for Codex work."
  },
  {
    name: "skill_board_rules",
    description: "Return the current project-development-board operating rules."
  },
  {
    name: "runtime_contract",
    description: "Return the Codex-only runtime contract and exclusions."
  }
];

const boardRules = {
  hierarchy: ["长篇故事", "任务", "子任务"],
  fileOwnership: "one active writer per file",
  parallelism: "parallelize only with disjoint ownership",
  validation: ["targeted verification", "fresh evidence", "handoff discipline"]
};

function runtimeContractPayload() {
  return {
    product: "codex-bees",
    mode: "codex-only",
    architecture: ["cli", "mcp", "skills", "agents", "docs"],
    exclusions: [
      "claude plugin marketplace compatibility",
      "multi-host support",
      "hosted control plane"
    ]
  };
}

function toolByName(name) {
  return toolCatalog.find((tool) => tool.name === name);
}

function createSuccess(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n";
}

function createError(id, code, message) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code, message }
  }) + "\n";
}

function handleRequest(message) {
  const { id = null, method, params = {} } = message;

  if (method === "initialize") {
    return createSuccess(id, {
      serverInfo: {
        name: "codex-bees",
        version: "0.1.0"
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
    const name = params.name;

    if (!toolByName(name)) {
      return createError(id, -32602, `Unknown tool: ${name}`);
    }

    if (name === "jira_story_context") {
      return createSuccess(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                executionModel: "jira-first",
                deliveryBoundary: "codex-only full rebuild",
                commitStrategy: "300+ meaningful atomic commits"
              },
              null,
              2
            )
          }
        ]
      });
    }

    if (name === "skill_board_rules") {
      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify(boardRules, null, 2) }]
      });
    }

    if (name === "runtime_contract") {
      return createSuccess(id, {
        content: [
          { type: "text", text: JSON.stringify(runtimeContractPayload(), null, 2) }
        ]
      });
    }
  }

  return createError(id, -32601, `Unsupported method: ${method}`);
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
          stdout.write(
            createError(null, -32700, `Invalid JSON input: ${error.message}`)
          );
        }
      }

      newlineIndex = buffer.indexOf("\n");
    }
  });

  stdin.on("end", () => {
    stderr.write("[codex-bees:mcp] stdio runtime closed\n");
  });
}

if (process.argv.includes("--tools")) {
  stdout.write(JSON.stringify({ tools: toolCatalog }, null, 2) + "\n");
} else if (process.argv.includes("--stdio")) {
  await startMcpServer();
}
