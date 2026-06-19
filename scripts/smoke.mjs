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
  ["plan-swarm", ["./src/index.js", "plan:swarm", "--task", "Coordinate a runtime task"]],
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

const checkedTask = JSON.parse(run("task-check-verify", ["./src/index.js", "task:check", "--id", "task-3"]).stdout).validation;
if (!checkedTask.ready) {
  console.error("[smoke:task-check] expected bounded smoke task to validate cleanly");
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
  readFileSync(statePath, "utf8").includes("\"version\": 3");
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
const incompleteTaskValidation = JSON.parse(
  run("task-check-incomplete", ["./src/index.js", "task:check", "--id", "task-1"]).stdout
).validation;
if (incompleteTaskValidation.ready || incompleteTaskValidation.issues.length === 0) {
  console.error("[smoke:task-check] expected incomplete task validation issues");
  process.exit(1);
}
run("task-claim-incomplete", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "blocked-worker"], 1);

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
const plannedSwarm = JSON.parse(
  run("plan-swarm-verify", [
    "./src/index.js",
    "plan:swarm",
    "--task",
    "Coordinate a planner-driven swarm"
  ]).stdout
);
if (plannedSwarm.kind !== "planned_swarm" || plannedSwarm.swarm?.laneSource !== "planner") {
  console.error("[smoke:plan-swarm] expected planner swarm payload");
  process.exit(1);
}
const queuedPlanSwarm = JSON.parse(
  run("plan-swarm-queue", [
    "./src/index.js",
    "plan:swarm:queue",
    "--task",
    "Queue a planner-driven swarm"
  ]).stdout
);
if (queuedPlanSwarm.kind !== "queued_plan_swarm" || queuedPlanSwarm.created.length !== 2) {
  console.error("[smoke:plan-swarm-queue] expected queued planner swarm tasks");
  process.exit(1);
}
const queuedPlanSwarmTasks = JSON.parse(
  run("plan-swarm-queue-task-list", ["./src/index.js", "task:list"]).stdout
).tasks;
if (!queuedPlanSwarmTasks.every((task) => task.swarmId === "swarm-1")) {
  console.error("[smoke:plan-swarm-queue] expected swarm-linked tasks from planner");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const swarmLaneJson = JSON.stringify([
  {
    lane: "lane-alpha",
    summary: "Map runtime boundary",
    owner: "explore",
    verifier: "reviewer",
    scope: ["src/index.js"],
    acceptance: ["scope captured"],
    verification: ["swarm:get returns lane"]
  },
  {
    lane: "lane-beta",
    summary: "Implement bounded change",
    owner: "executor",
    verifier: "tester",
    scope: ["src/state.js", "src/mcp.js"],
    acceptance: ["tasks queued from swarm"],
    verification: ["task:list includes swarmId"]
  }
]);
run("swarm-init", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Coordinate swarm smoke coverage",
  "--owner",
  "leader",
  "--topology",
  "bounded-local",
  "--max-workers",
  "2",
  "--lane-source",
  "smoke",
  "--lanes",
  swarmLaneJson
]);
run("swarm-list", ["./src/index.js", "swarm:list"]);
const swarmValidation = JSON.parse(
  run("swarm-check", ["./src/index.js", "swarm:check", "--id", "swarm-1"]).stdout
).validation;
if (!swarmValidation.ready) {
  console.error("[smoke:swarm-check] expected bounded swarm to validate cleanly");
  process.exit(1);
}
const swarmGet = JSON.parse(
  run("swarm-get", ["./src/index.js", "swarm:get", "--id", "swarm-1"]).stdout
).swarm;
if (!Array.isArray(swarmGet.lanes) || swarmGet.lanes.length !== 2 || swarmGet.maxWorkers !== 2) {
  console.error("[smoke:swarm-get] expected persisted lanes and maxWorkers");
  process.exit(1);
}
run("swarm-start", ["./src/index.js", "swarm:start", "--id", "swarm-1", "--owner", "leader"]);
const swarmQueue = JSON.parse(
  run("swarm-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]).stdout
);
if (!Array.isArray(swarmQueue.created) || swarmQueue.created.length !== 2) {
  console.error("[smoke:swarm-queue] expected two queued swarm tasks");
  process.exit(1);
}
const swarmOverviewBeforeDispatch = JSON.parse(
  run("swarm-overview-before-dispatch", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
if (swarmOverviewBeforeDispatch.counts.queued !== 2 || swarmOverviewBeforeDispatch.nextLane?.lane !== "lane-alpha") {
  console.error("[smoke:swarm-overview] expected queued lanes and next lane before dispatch");
  process.exit(1);
}
const dispatchedLane = JSON.parse(
  run("swarm-dispatch", [
    "./src/index.js",
    "swarm:dispatch",
    "--id",
    "swarm-1",
    "--by",
    "worker-alpha",
    "--owner",
    "explore"
  ]).stdout
).dispatched;
if (dispatchedLane.task.claimedBy !== "worker-alpha" || dispatchedLane.lane.lane !== "lane-alpha") {
  console.error("[smoke:swarm-dispatch] expected first lane claimed by worker-alpha");
  process.exit(1);
}
const swarmOverviewAfterDispatch = JSON.parse(
  run("swarm-overview-after-dispatch", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
if (swarmOverviewAfterDispatch.counts.claimed !== 1 || swarmOverviewAfterDispatch.counts.queued !== 1) {
  console.error("[smoke:swarm-overview] expected claimed and queued counts after dispatch");
  process.exit(1);
}
const swarmTasks = JSON.parse(run("swarm-queue-task-list", ["./src/index.js", "task:list"]).stdout).tasks;
if (!swarmTasks.every((task) => task.swarmId === "swarm-1")) {
  console.error("[smoke:swarm-queue] expected swarm task linkage");
  process.exit(1);
}
run("swarm-task-1-done", ["./src/index.js", "task:done", "--id", "task-1", "--by", "worker-alpha"]);
const dispatchedLaneTwo = JSON.parse(
  run("swarm-dispatch-second", [
    "./src/index.js",
    "swarm:dispatch",
    "--id",
    "swarm-1",
    "--by",
    "worker-beta",
    "--owner",
    "executor"
  ]).stdout
).dispatched;
if (dispatchedLaneTwo.task.id !== "task-2") {
  console.error("[smoke:swarm-dispatch] expected second lane dispatch to task-2");
  process.exit(1);
}
run("swarm-task-2-done", ["./src/index.js", "task:done", "--id", "task-2", "--by", "worker-beta"]);
const swarmOverviewReadyToComplete = JSON.parse(
  run("swarm-overview-ready-to-complete", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
if (!swarmOverviewReadyToComplete.readyToComplete || swarmOverviewReadyToComplete.derivedStatus !== "completed" || swarmOverviewReadyToComplete.statusAligned !== true) {
  console.error("[smoke:swarm-overview] expected completion readiness and aligned completed status");
  process.exit(1);
}
const syncedSwarm = JSON.parse(
  run("swarm-sync", ["./src/index.js", "swarm:sync", "--id", "swarm-1"]).stdout
).synced;
if (syncedSwarm.swarm.status !== "completed" || syncedSwarm.changed !== false) {
  console.error("[smoke:swarm-sync] expected idempotent completed swarm sync");
  process.exit(1);
}
const syncedSwarmGet = JSON.parse(
  run("swarm-get-after-sync", ["./src/index.js", "swarm:get", "--id", "swarm-1"]).stdout
).swarm;
if (syncedSwarmGet.status !== "completed") {
  console.error("[smoke:swarm-sync] expected stored completed swarm status");
  process.exit(1);
}
const detailedSwarmList = JSON.parse(
  run("swarm-list-detailed", ["./src/index.js", "swarm:list", "--detailed"]).stdout
).swarms;
if (!Array.isArray(detailedSwarmList) || detailedSwarmList[0]?.derivedStatus !== "completed") {
  console.error("[smoke:swarm-list] expected detailed swarm list with derived status");
  process.exit(1);
}
run("swarm-dispatch-none", ["./src/index.js", "swarm:dispatch", "--id", "swarm-1", "--by", "worker-gamma"], 1);
run("swarm-queue-invalid", ["./src/index.js", "swarm:queue", "--id", "swarm-1"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
const invalidSwarmJson = JSON.stringify([
  { lane: "lane-bad-1", summary: "Bad lane one", owner: "explore", scope: ["src/index.js"], acceptance: ["a"], verification: ["v"] },
  { lane: "lane-bad-2", summary: "Bad lane two", owner: "executor", verifier: "tester", scope: ["src/index.js"], acceptance: ["b"], verification: ["v"] }
]);
run("swarm-init-invalid", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Invalid swarm smoke",
  "--lanes",
  invalidSwarmJson
]);
const invalidSwarmValidation = JSON.parse(
  run("swarm-check-invalid", ["./src/index.js", "swarm:check", "--id", "swarm-1"]).stdout
).validation;
if (invalidSwarmValidation.ready || invalidSwarmValidation.overlaps.length === 0) {
  console.error("[smoke:swarm-check] expected invalid swarm overlap or metadata issues");
  process.exit(1);
}
run("swarm-queue-invalid-validation", ["./src/index.js", "swarm:queue", "--id", "swarm-1"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
const swarmMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_init",
      arguments: {
        objective: "MCP swarm smoke",
        owner: "leader",
        maxWorkers: 2,
        lanes: [
          {
            lane: "lane-mcp",
            summary: "MCP lane",
            owner: "executor",
            verifier: "tester",
            scope: ["src/mcp.js"],
            acceptance: ["lane persisted"],
            verification: ["swarm_get returns lane"]
          }
        ]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "swarm_check",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "swarm_queue_tasks",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "swarm_dispatch",
      arguments: { id: "swarm-1", claimedBy: "mcp-worker", owner: "executor" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "task_done",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "swarm_sync",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "swarm_overview",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "task_list",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "swarm_list",
      arguments: { detailed: true }
    }
  })
].join("\n") + "\n";

const swarmMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmMcpInput,
  encoding: "utf8"
});
const swarmMcpLines = swarmMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmCheckResult = swarmMcpLines.length >= 3 ? JSON.parse(swarmMcpLines[2]) : null;
const swarmCheckText = swarmCheckResult?.result?.content?.[0]?.text;
const swarmCheckPayload = swarmCheckText ? JSON.parse(swarmCheckText) : null;
const swarmOverviewResult = swarmMcpLines.length >= 8 ? JSON.parse(swarmMcpLines[7]) : null;
const swarmOverviewText = swarmOverviewResult?.result?.content?.[0]?.text;
const swarmOverviewPayload = swarmOverviewText ? JSON.parse(swarmOverviewText) : null;
const swarmTaskListResult = swarmMcpLines.length >= 9 ? JSON.parse(swarmMcpLines[8]) : null;
const swarmTaskListText = swarmTaskListResult?.result?.content?.[0]?.text;
const swarmTaskListPayload = swarmTaskListText ? JSON.parse(swarmTaskListText) : null;
const swarmListDetailedResult = swarmMcpLines.length >= 10 ? JSON.parse(swarmMcpLines[9]) : null;
const swarmListDetailedText = swarmListDetailedResult?.result?.content?.[0]?.text;
const swarmListDetailedPayload = swarmListDetailedText ? JSON.parse(swarmListDetailedText) : null;
const mcpSwarmTask = swarmTaskListPayload?.tasks?.find((task) => task.swarmId === "swarm-1" && task.claimedBy === "mcp-worker");
if (
  swarmMcp.status !== 0 ||
  swarmCheckPayload?.validation?.ready !== true ||
  !mcpSwarmTask ||
  swarmOverviewPayload?.overview?.derivedStatus !== "completed" ||
  swarmOverviewPayload?.overview?.readyToComplete !== true ||
  swarmListDetailedPayload?.swarms?.[0]?.derivedStatus !== "completed"
) {
  console.error("[smoke:swarm-mcp] expected synced completion-aware MCP swarm overview");
  console.error(swarmMcp.stderr || swarmMcp.stdout);
  process.exit(1);
}


rmSync(".codex-bees", { recursive: true, force: true });
const queuePlanSwarmMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "queue_plan_swarm",
      arguments: { task: "Queue a planner MCP swarm" }
    }
  })
].join("\n") + "\n";

const queuePlanSwarmMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: queuePlanSwarmMcpInput,
  encoding: "utf8"
});
const queuePlanSwarmLines = queuePlanSwarmMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const queuePlanSwarmResult = queuePlanSwarmLines.length >= 2 ? JSON.parse(queuePlanSwarmLines[1]) : null;
const queuePlanSwarmText = queuePlanSwarmResult?.result?.content?.[0]?.text;
const queuePlanSwarmPayload = queuePlanSwarmText ? JSON.parse(queuePlanSwarmText) : null;
if (queuePlanSwarmMcp.status !== 0 || queuePlanSwarmPayload?.kind !== "queued_plan_swarm") {
  console.error("[smoke:queue-plan-swarm-mcp] expected queued_plan_swarm response");
  console.error(queuePlanSwarmMcp.stderr || queuePlanSwarmMcp.stdout);
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
      name: "task_check",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
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
const taskCheckResult = taskAddMcpLines.length >= 3 ? JSON.parse(taskAddMcpLines[2]) : null;
const taskCheckText = taskCheckResult?.result?.content?.[0]?.text;
const taskCheckPayload = taskCheckText ? JSON.parse(taskCheckText) : null;
const taskListResult = taskAddMcpLines.length >= 4 ? JSON.parse(taskAddMcpLines[3]) : null;
const taskListText = taskListResult?.result?.content?.[0]?.text;
const taskListPayload = taskListText ? JSON.parse(taskListText) : null;
const mcpTask = taskListPayload?.tasks?.find((task) => task.title === "mcp metadata task");
if (taskAddMcp.status !== 0 || !mcpTask || mcpTask.verifier !== "tester" || taskCheckPayload?.validation?.ready !== true) {
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
