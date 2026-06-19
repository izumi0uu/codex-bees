import { stdin, stdout, stderr } from "node:process";
import { planTask, queueTasksFromPlan } from "./planner.js";
import {
  addTask,
  addTasks,
  blockTask,
  claimTask,
  completeTask,
  listMemories,
  listTasks,
  markTaskReadyForReview,
  releaseTask,
  searchMemories,
  storeMemory,
  updateTask
} from "./state.js";

export const toolCatalog = [
  {
    name: "coordination_overview",
    description: "Describe the current local coordination model for Codex Bees.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "worker_guidelines",
    description: "Return the current worker ownership and handoff guidelines.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_contract",
    description: "Return the Codex-only runtime contract and exclusions.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "task_list",
    description: "List local coordination tasks from the persistent state store.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "task_add",
    description: "Create a local coordination task in the persistent state store.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        verifier: { type: "string" },
        objective: { type: "string" },
        lane: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        acceptance: { type: "array", items: { type: "string" } },
        verification: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_update",
    description: "Update a local coordination task in the persistent state store.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        verifier: { type: "string" },
        objective: { type: "string" },
        lane: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        acceptance: { type: "array", items: { type: "string" } },
        verification: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_claim",
    description: "Claim a queued local coordination task for one active owner.",
    inputSchema: {
      type: "object",
      required: ["id", "claimedBy"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" }
      }
    }
  },
  {
    name: "task_block",
    description: "Mark a local coordination task as blocked.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_ready_for_review",
    description: "Mark a local coordination task as ready for review.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_done",
    description: "Mark a local coordination task as complete.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_release",
    description: "Release a claimed local coordination task back to the queue.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" }
      }
    }
  },
  {
    name: "plan_task",
    description: "Generate a bounded read-only execution plan for a task brief.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string" }
      }
    }
  },
  {
    name: "queue_plan",
    description: "Generate a bounded execution plan and queue its lanes as local tasks.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string" }
      }
    }
  },
  {
    name: "memory_store",
    description: "Store a persistent local memory for later recall.",
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
        namespace: { type: "string" },
        kind: { type: "string" },
        title: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "memory_list",
    description: "List persistent local memories with optional filters.",
    inputSchema: {
      type: "object",
      properties: {
        namespace: { type: "string" },
        kind: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "memory_search",
    description: "Search persistent local memories by query and optional filters.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
        namespace: { type: "string" },
        kind: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        limit: { type: "number" }
      }
    }
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
        verifier: params.arguments.verifier,
        objective: params.arguments.objective,
        lane: params.arguments.lane,
        scope: params.arguments.scope,
        acceptance: params.arguments.acceptance,
        verification: params.arguments.verification,
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
        verifier: params.arguments.verifier,
        objective: params.arguments.objective,
        lane: params.arguments.lane,
        scope: params.arguments.scope,
        acceptance: params.arguments.acceptance,
        verification: params.arguments.verification,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ updated: task }, null, 2) }]
      });
    }

    if (name === "task_claim") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_claim requires arguments.id");
      }
      if (!params.arguments?.claimedBy) {
        return createError(id, -32602, "task_claim requires arguments.claimedBy");
      }

      const task = claimTask({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ claimed: task }, null, 2) }]
      });
    }

    if (name === "task_block") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_block requires arguments.id");
      }

      const task = blockTask({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ blocked: task }, null, 2) }]
      });
    }

    if (name === "task_ready_for_review") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_ready_for_review requires arguments.id");
      }

      const task = markTaskReadyForReview({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ readyForReview: task }, null, 2) }]
      });
    }

    if (name === "task_done") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_done requires arguments.id");
      }

      const task = completeTask({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ completed: task }, null, 2) }]
      });
    }

    if (name === "task_release") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_release requires arguments.id");
      }

      const task = releaseTask({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ released: task }, null, 2) }]
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

    if (name === "queue_plan") {
      if (!params.arguments?.task) {
        return createError(id, -32602, "queue_plan requires arguments.task");
      }

      return createSuccess(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(queueTasksFromPlan(params.arguments.task, addTasks), null, 2)
          }
        ]
      });
    }

    if (name === "memory_store") {
      if (!params.arguments?.content) {
        return createError(id, -32602, "memory_store requires arguments.content");
      }

      const memory = storeMemory({
        content: params.arguments.content,
        namespace: params.arguments.namespace,
        kind: params.arguments.kind,
        title: params.arguments.title,
        agent: params.arguments.agent,
        tags: params.arguments.tags,
        notes: params.arguments.notes
      });

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ stored: memory }, null, 2) }]
      });
    }

    if (name === "memory_list") {
      const memories = listMemories({
        namespace: params.arguments?.namespace,
        kind: params.arguments?.kind,
        agent: params.arguments?.agent,
        tags: params.arguments?.tags
      });

      return createSuccess(id, {
        content: [{ type: "text", text: JSON.stringify({ memories }, null, 2) }]
      });
    }

    if (name === "memory_search") {
      if (!params.arguments?.query) {
        return createError(id, -32602, "memory_search requires arguments.query");
      }

      const limit =
        Number.isFinite(Number(params.arguments.limit)) && Number(params.arguments.limit) > 0
          ? Number(params.arguments.limit)
          : 10;
      const results = searchMemories(params.arguments.query, {
        namespace: params.arguments.namespace,
        kind: params.arguments.kind,
        agent: params.arguments.agent,
        tags: params.arguments.tags
      }).slice(0, limit);

      return createSuccess(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify({ query: params.arguments.query, results }, null, 2)
          }
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
