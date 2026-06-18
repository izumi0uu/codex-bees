import { stdin, stdout, stderr } from "node:process";
import { planTask } from "./planner.js";
import { addTask, listTasks, updateTask } from "./state.js";

export const toolCatalog = [
  {
    name: "coordination_overview",
    description: "Describe the current local coordination model for Codex Bees."
  },
  {
    name: "worker_guidelines",
    description: "Return the current worker ownership and handoff guidelines."
  },
  {
    name: "runtime_contract",
    description: "Return the Codex-only runtime contract and exclusions."
  },
  {
    name: "task_list",
    description: "List local coordination tasks from the persistent state store."
  },
  {
    name: "task_add",
    description: "Create a local coordination task in the persistent state store."
  },
  {
    name: "task_update",
    description: "Update a local coordination task in the persistent state store."
  },
  {
    name: "plan_task",
    description: "Generate a bounded read-only execution plan for a task brief."
  }
];

const workerGuidelines = {
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
      "third-party marketplace distribution",
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

    if (name === "coordination_overview") {
      return createSuccess(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                executionModel: "local bounded multi-agent coordination",
                deliveryBoundary: "codex-only runtime",
                changeModel: "small reversible steps"
              },
              null,
              2
            )
          }
        ]
      });
    }

    if (name === "worker_guidelines") {
      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify(workerGuidelines, null, 2) }]
      });
    }

    if (name === "runtime_contract") {
      return createSuccess(id, {
        content: [
          { type: "text", text: JSON.stringify(runtimeContractPayload(), null, 2) }
        ]
      });
    }

    if (name === "task_list") {
      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ tasks: listTasks() }, null, 2) }]
      });
    }

    if (name === "task_add") {
      if (!params.arguments?.title) {
        return createError(id, -32602, "task_add requires arguments.title");
      }

      const task = addTask({
        title: params.arguments.title,
        status: params.arguments.status,
        owner: params.arguments.owner,
        notes: params.arguments.notes
      });

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ created: task }, null, 2) }]
      });
    }

    if (name === "task_update") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_update requires arguments.id");
      }

      const task = updateTask({
        id: params.arguments.id,
        title: params.arguments.title,
        status: params.arguments.status,
        owner: params.arguments.owner,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ updated: task }, null, 2) }]
      });
    }

    if (name === "plan_task") {
      if (!params.arguments?.task) {
        return createError(id, -32602, "plan_task requires arguments.task");
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify(planTask(params.arguments.task), null, 2) }]
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
