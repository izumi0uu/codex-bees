import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

function run(label, args, expectedStatus = 0) {
  const result = spawnSync("node", args, { encoding: "utf8" });
  if (result.status !== expectedStatus) {
    console.error(`[smoke:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result;
}

rmSync(".codex-bees", { recursive: true, force: true });

const checks = [
  ["help", ["./src/index.js", "--help"]],
  ["version", ["./src/index.js", "--version"]],
  ["tools", ["./src/mcp.js", "--tools"]],
  [
    "memory-store",
    [
      "./src/index.js",
      "memory:store",
      "--content",
      "Remember that smoke tests validate lane metadata",
      "--namespace",
      "smoke",
      "--kind",
      "note",
      "--agent",
      "tester",
      "--tags",
      "smoke,metadata"
    ]
  ],
  ["memory-list", ["./src/index.js", "memory:list", "--namespace", "smoke"]],
  [
    "memory-search",
    ["./src/index.js", "memory:search", "--query", "lane metadata", "--namespace", "smoke"]
  ],
  ["plan", ["./src/index.js", "plan", "--task", "Add a doctor smoke check to the CLI"]],
  ["plan-queue", ["./src/index.js", "plan:queue", "--task", "Queue a runtime task"]],
  [
    "task-add",
    [
      "./src/index.js",
      "task:add",
      "--title",
      "smoke task",
      "--status",
      "todo",
      "--owner",
      "executor",
      "--verifier",
      "tester",
      "--objective",
      "prove metadata persistence",
      "--lane",
      "lane-smoke",
      "--scope",
      "src/index.js,src/mcp.js",
      "--acceptance",
      "metadata stored|manual task remains bounded",
      "--verification",
      "task:list shows metadata|task:update preserves metadata"
    ]
  ],
  ["task-claim", ["./src/index.js", "task:claim", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-block", ["./src/index.js", "task:block", "--id", "task-3", "--by", "smoke-worker", "--notes", "waiting on verifier"]],
  ["task-claim-from-blocked", ["./src/index.js", "task:claim", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-review", ["./src/index.js", "task:review", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-done", ["./src/index.js", "task:done", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-list", ["./src/index.js", "task:list"]],
  [
    "task-update",
    [
      "./src/index.js",
      "task:update",
      "--id",
      "task-3",
      "--status",
      "done",
      "--notes",
      "verified by smoke",
      "--acceptance",
      "metadata stored|manual task remains bounded|update path works",
      "--verification",
      "task:list shows metadata|task:update preserves metadata|smoke command passes"
    ]
  ],
  ["task-release-invalid", ["./src/index.js", "task:release", "--id", "task-3", "--by", "smoke-worker"], 1]
];

for (const [label, args, expectedStatus = 0] of checks) {
  run(label, args, expectedStatus);
}

const listedMemories = JSON.parse(
  run("memory-list-verify", ["./src/index.js", "memory:list", "--namespace", "smoke"]).stdout
).memories;
const smokeMemory = listedMemories.find((memory) => memory.namespace === "smoke");
if (!smokeMemory || smokeMemory.agent !== "tester") {
  console.error("[smoke:memory-list] expected persisted memory with agent");
  process.exit(1);
}

const searchedMemories = JSON.parse(
  run("memory-search-verify", [
    "./src/index.js",
    "memory:search",
    "--query",
    "metadata",
    "--namespace",
    "smoke"
  ]).stdout
).results;
if (!Array.isArray(searchedMemories) || searchedMemories.length === 0) {
  console.error("[smoke:memory-search] expected at least one memory search result");
  process.exit(1);
}

const listedTasks = JSON.parse(run("task-list-verify", ["./src/index.js", "task:list"]).stdout).tasks;
const smokeTask = listedTasks.find((task) => task.id === "task-3");
if (!smokeTask || smokeTask.verifier !== "tester" || smokeTask.lane !== "lane-smoke") {
  console.error("[smoke:task-metadata] expected verifier and lane metadata");
  process.exit(1);
}
if (!Array.isArray(smokeTask.scope) || smokeTask.scope.length !== 2) {
  console.error("[smoke:task-metadata] expected scope metadata");
  process.exit(1);
}
if (!Array.isArray(smokeTask.acceptance) || smokeTask.acceptance.length !== 3) {
  console.error("[smoke:task-metadata] expected updated acceptance metadata");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });

const firstAdd = run("durability-add-1", [
  "./src/index.js",
  "task:add",
  "--title",
  "durability one"
]);
const createdOne = JSON.parse(firstAdd.stdout).created;
if (createdOne.id !== "task-1") {
  console.error("[smoke:durability-add-1] expected task-1");
  process.exit(1);
}

const statePath = ".codex-bees/state.json";
writeFileSync(statePath, "{not valid json\n", "utf8");
const recoveredList = run("durability-recover", ["./src/index.js", "task:list"]);
const recovered = JSON.parse(recoveredList.stdout);
if (!Array.isArray(recovered.tasks) || recovered.tasks.length !== 0) {
  console.error("[smoke:durability-recover] expected recovered empty task list");
  process.exit(1);
}

const corruptExists = existsSync(".codex-bees") &&
  readFileSync(statePath, "utf8").includes("\"version\": 2");
if (!corruptExists) {
  console.error("[smoke:durability-recover] expected rebuilt state file with version");
  process.exit(1);
}

const secondAdd = run("durability-add-2", [
  "./src/index.js",
  "task:add",
  "--title",
  "durability two"
]);
const createdTwo = JSON.parse(secondAdd.stdout).created;
if (createdTwo.id !== "task-1") {
  console.error("[smoke:durability-add-2] expected clean recovery to restart at task-1");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const queuedPlan = run("queue-plan-cli", [
  "./src/index.js",
  "plan:queue",
  "--task",
  "Queue a planner change"
]);
const queuedPlanPayload = JSON.parse(queuedPlan.stdout);
if (!Array.isArray(queuedPlanPayload.created) || queuedPlanPayload.created.length !== 2) {
  console.error("[smoke:queue-plan-cli] expected two queued tasks");
  process.exit(1);
}
if (!queuedPlanPayload.created[0].lane || !Array.isArray(queuedPlanPayload.created[0].scope)) {
  console.error("[smoke:queue-plan-cli] expected lane metadata on queued tasks");
  process.exit(1);
}

const queuePlanMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "queue_plan",
      arguments: { task: "Queue an MCP planner change" }
    }
  })
].join("\n") + "\n";

const queuePlanMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: queuePlanMcpInput,
  encoding: "utf8"
});
const queuePlanLines = queuePlanMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const queuePlanResult = queuePlanLines.length >= 2 ? JSON.parse(queuePlanLines[1]) : null;
const queuePlanText = queuePlanResult?.result?.content?.[0]?.text;
const queuePlanPayloadMcp = queuePlanText ? JSON.parse(queuePlanText) : null;
if (queuePlanMcp.status !== 0 || queuePlanPayloadMcp?.kind !== "queued_plan") {
  console.error("[smoke:queue-plan-mcp] expected queued_plan response");
  console.error(queuePlanMcp.stderr || queuePlanMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const taskAddMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_add",
      arguments: {
        title: "mcp metadata task",
        owner: "executor",
        verifier: "tester",
        objective: "verify MCP metadata persistence",
        lane: "lane-mcp",
        scope: ["src/mcp.js"],
        acceptance: ["metadata stored"],
        verification: ["task_list returns metadata"]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "task_list",
      arguments: {}
    }
  })
].join("\n") + "\n";

const taskAddMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskAddMcpInput,
  encoding: "utf8"
});
const taskAddMcpLines = taskAddMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskListResult = taskAddMcpLines.length >= 3 ? JSON.parse(taskAddMcpLines[2]) : null;
const taskListText = taskListResult?.result?.content?.[0]?.text;
const taskListPayload = taskListText ? JSON.parse(taskListText) : null;
const mcpTask = taskListPayload?.tasks?.find((task) => task.title === "mcp metadata task");
if (taskAddMcp.status !== 0 || !mcpTask || mcpTask.verifier !== "tester") {
  console.error("[smoke:task-add-mcp] expected persisted MCP metadata");
  console.error(taskAddMcp.stderr || taskAddMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const memoryMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "memory_store",
      arguments: {
        content: "Remember MCP memory smoke coverage",
        namespace: "mcp-smoke",
        kind: "note",
        tags: ["smoke", "memory"]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "memory_search",
      arguments: {
        query: "smoke coverage",
        namespace: "mcp-smoke",
        limit: 5
      }
    }
  })
].join("\n") + "\n";

const memoryMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: memoryMcpInput,
  encoding: "utf8"
});
const memoryMcpLines = memoryMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const memorySearchResult = memoryMcpLines.length >= 3 ? JSON.parse(memoryMcpLines[2]) : null;
const memorySearchText = memorySearchResult?.result?.content?.[0]?.text;
const memorySearchPayload = memorySearchText ? JSON.parse(memorySearchText) : null;
if (
  memoryMcp.status !== 0 ||
  !Array.isArray(memorySearchPayload?.results) ||
  memorySearchPayload.results.length === 0
) {
  console.error("[smoke:memory-mcp] expected searchable MCP memory");
  console.error(memoryMcp.stderr || memoryMcp.stdout);
  process.exit(1);
}

console.log("smoke: ok");
