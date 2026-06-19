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
  ["catalog", ["./src/index.js", "catalog"]],
  ["status", ["./src/index.js", "status"]],
  ["capabilities", ["./src/index.js", "capabilities"]],
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
  ["task-done-unauthorized", ["./src/index.js", "task:done", "--id", "task-3", "--by", "smoke-worker"], 1],
  [
    "task-approve",
    [
      "./src/index.js",
      "task:approve",
      "--id",
      "task-3",
      "--by",
      "tester",
      "--notes",
      "smoke verifier approved",
      "--evidence",
      "npm run smoke|task metadata reviewed"
    ]
  ],
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

const runtimeCatalog = JSON.parse(run("catalog-verify", ["./src/index.js", "catalog"]).stdout).catalog;
if (
  !Array.isArray(runtimeCatalog.agents) ||
  !runtimeCatalog.agents.some((agent) => agent.id === "executor") ||
  !Array.isArray(runtimeCatalog.skills) ||
  !runtimeCatalog.skills.some((skill) => skill.id === "project-development")
) {
  console.error("[smoke:catalog] expected shipped agent and skill catalog");
  process.exit(1);
}
const runtimeStatus = JSON.parse(run("status-verify", ["./src/index.js", "status"]).stdout).status;
if (
  runtimeStatus.product !== "codex-bees" ||
  runtimeStatus.counts?.agents !== 4 ||
  runtimeStatus.counts?.skills !== 2 ||
  runtimeStatus.counts?.capabilities < 6
) {
  console.error("[smoke:status] expected runtime summary counts");
  process.exit(1);
}
const runtimeCapabilities = JSON.parse(run("capabilities-verify", ["./src/index.js", "capabilities"]).stdout).capabilities;
if (
  !Array.isArray(runtimeCapabilities) ||
  !runtimeCapabilities.some((capability) => capability.id === "swarm_coordination") ||
  !runtimeCapabilities.some((capability) => capability.id === "runtime_catalog")
) {
  console.error("[smoke:capabilities] expected runtime capability inventory");
  process.exit(1);
}
const runtimeActivityInitial = JSON.parse(
  run("runtime-activity-initial", ["./src/index.js", "runtime:activity"]).stdout
).activity;
if (
  runtimeActivityInitial.kind !== "runtime_activity" ||
  !Array.isArray(runtimeActivityInitial.entries)
) {
  console.error("[smoke:runtime-activity] expected top-level runtime activity");
  process.exit(1);
}
const runtimeCloseoutInitial = JSON.parse(
  run("runtime-closeout-initial", ["./src/index.js", "runtime:closeout"]).stdout
).closeout;
if (
  runtimeCloseoutInitial.kind !== "runtime_closeout" ||
  !Array.isArray(runtimeCloseoutInitial.tasks) ||
  !Array.isArray(runtimeCloseoutInitial.swarms) ||
  runtimeCloseoutInitial.counts?.tasksReady < 1 ||
  runtimeCloseoutInitial.tasks?.some((entry) => entry.taskId === "task-3" && entry.reviewOutcome === "approved") !== true
) {
  console.error("[smoke:runtime-closeout] expected top-level runtime closeout");
  process.exit(1);
}
const runtimeCloseoutPackInitial = JSON.parse(
  run("runtime-closeout-pack-initial", ["./src/index.js", "runtime:closeout-pack"]).stdout
).closeoutPack;
if (
  runtimeCloseoutPackInitial.kind !== "runtime_closeout_pack" ||
  !runtimeCloseoutPackInitial.recommendedSurface ||
  !runtimeCloseoutPackInitial.overview ||
  !runtimeCloseoutPackInitial.surfaces
) {
  console.error("[smoke:runtime-closeout-pack] expected top-level runtime closeout pack");
  process.exit(1);
}
const runtimeDashboardInitial = JSON.parse(
  run("runtime-dashboard-initial", ["./src/index.js", "runtime:dashboard"]).stdout
).dashboard;
if (
  runtimeDashboardInitial.kind !== "runtime_dashboard" ||
  runtimeDashboardInitial.counts?.tasks < 3 ||
  runtimeDashboardInitial.leader?.queue?.kind !== "leader_queue"
) {
  console.error("[smoke:runtime-dashboard] expected top-level runtime dashboard");
  process.exit(1);
}
const runtimeDispatchInitial = JSON.parse(
  run("runtime-dispatch-initial", ["./src/index.js", "runtime:dispatch"]).stdout
).dispatch;
if (
  runtimeDispatchInitial.kind !== "runtime_dispatch" ||
  !Array.isArray(runtimeDispatchInitial.groups)
) {
  console.error("[smoke:runtime-dispatch] expected top-level runtime dispatch");
  process.exit(1);
}
const runtimeDispatchPackInitial = JSON.parse(
  run("runtime-dispatch-pack-initial", ["./src/index.js", "runtime:dispatch-pack"]).stdout
).dispatchPack;
if (
  runtimeDispatchPackInitial.kind !== "runtime_dispatch_pack" ||
  !runtimeDispatchPackInitial.recommendedSurface ||
  !runtimeDispatchPackInitial.overview ||
  !runtimeDispatchPackInitial.surfaces
) {
  console.error("[smoke:runtime-dispatch-pack] expected top-level runtime dispatch pack");
  process.exit(1);
}
const runtimeFocusInitial = JSON.parse(
  run("runtime-focus-initial", ["./src/index.js", "runtime:focus"]).stdout
).focus;
if (
  runtimeFocusInitial.kind !== "runtime_focus" ||
  !runtimeFocusInitial.focus
) {
  console.error("[smoke:runtime-focus] expected top-level runtime focus");
  process.exit(1);
}
const runtimeQueuePackInitial = JSON.parse(
  run("runtime-queue-pack-initial", ["./src/index.js", "runtime:queue-pack"]).stdout
).queuePack;
if (
  runtimeQueuePackInitial.kind !== "runtime_queue_pack" ||
  !runtimeQueuePackInitial.recommendedSurface ||
  !runtimeQueuePackInitial.overview ||
  !runtimeQueuePackInitial.surfaces
) {
  console.error("[smoke:runtime-queue-pack] expected top-level runtime queue pack");
  process.exit(1);
}
const runtimeHandoffsInitial = JSON.parse(
  run("runtime-handoffs-initial", ["./src/index.js", "runtime:handoffs"]).stdout
).handoffs;
if (
  runtimeHandoffsInitial.kind !== "runtime_handoffs" ||
  !Array.isArray(runtimeHandoffsInitial.groups)
) {
  console.error("[smoke:runtime-handoffs] expected top-level runtime handoffs");
  process.exit(1);
}
const runtimeRecoveryInitial = JSON.parse(
  run("runtime-recovery-initial", ["./src/index.js", "runtime:recovery"]).stdout
).recovery;
if (
  runtimeRecoveryInitial.kind !== "runtime_recovery" ||
  !Array.isArray(runtimeRecoveryInitial.groups) ||
  runtimeRecoveryInitial.counts?.totalEntries !== 0 ||
  runtimeRecoveryInitial.next !== null
) {
  console.error("[smoke:runtime-recovery] expected top-level runtime recovery");
  process.exit(1);
}
const runtimeRecoveryPackInitial = JSON.parse(
  run("runtime-recovery-pack-initial", ["./src/index.js", "runtime:recovery-pack"]).stdout
).recoveryPack;
if (
  runtimeRecoveryPackInitial.kind !== "runtime_recovery_pack" ||
  !runtimeRecoveryPackInitial.recommendedSurface ||
  !runtimeRecoveryPackInitial.overview ||
  !runtimeRecoveryPackInitial.surfaces
) {
  console.error("[smoke:runtime-recovery-pack] expected top-level runtime recovery pack");
  process.exit(1);
}
const runtimeSummaryPackInitial = JSON.parse(
  run("runtime-summary-pack-initial", ["./src/index.js", "runtime:summary-pack"]).stdout
).summaryPack;
if (
  runtimeSummaryPackInitial.kind !== "runtime_summary_pack" ||
  !runtimeSummaryPackInitial.recommendedSurface ||
  !runtimeSummaryPackInitial.focus ||
  !runtimeSummaryPackInitial.overview
) {
  console.error("[smoke:runtime-summary-pack] expected top-level runtime summary pack");
  process.exit(1);
}
const runtimeLeaderPackInitial = JSON.parse(
  run("runtime-leader-pack-initial", ["./src/index.js", "runtime:leader-pack"]).stdout
).leaderPack;
if (
  runtimeLeaderPackInitial.kind !== "runtime_leader_pack" ||
  !runtimeLeaderPackInitial.recommendedSurface ||
  !runtimeLeaderPackInitial.overview ||
  !runtimeLeaderPackInitial.surfaces
) {
  console.error("[smoke:runtime-leader-pack] expected top-level runtime leader pack");
  process.exit(1);
}
const runtimeOperatorPackInitial = JSON.parse(
  run("runtime-operator-pack-initial", ["./src/index.js", "runtime:operator-pack"]).stdout
).operatorPack;
if (
  runtimeOperatorPackInitial.kind !== "runtime_operator_pack" ||
  !runtimeOperatorPackInitial.recommendedSurface ||
  !runtimeOperatorPackInitial.overview ||
  !runtimeOperatorPackInitial.surfaces
) {
  console.error("[smoke:runtime-operator-pack] expected top-level runtime operator pack");
  process.exit(1);
}
const runtimeControlPackInitial = JSON.parse(
  run("runtime-control-pack-initial", ["./src/index.js", "runtime:control-pack"]).stdout
).controlPack;
if (
  runtimeControlPackInitial.kind !== "runtime_control_pack" ||
  !runtimeControlPackInitial.recommendedSurface ||
  !runtimeControlPackInitial.overview ||
  !runtimeControlPackInitial.surfaces
) {
  console.error("[smoke:runtime-control-pack] expected top-level runtime control pack");
  process.exit(1);
}
const runtimeSignalPackInitial = JSON.parse(
  run("runtime-signal-pack-initial", ["./src/index.js", "runtime:signal-pack"]).stdout
).signalPack;
if (
  runtimeSignalPackInitial.kind !== "runtime_signal_pack" ||
  !runtimeSignalPackInitial.recommendedSurface ||
  !runtimeSignalPackInitial.overview ||
  !runtimeSignalPackInitial.surfaces
) {
  console.error("[smoke:runtime-signal-pack] expected top-level runtime signal pack");
  process.exit(1);
}
const runtimeHandoffPackInitial = JSON.parse(
  run("runtime-handoff-pack-initial", ["./src/index.js", "runtime:handoff-pack"]).stdout
).handoffPack;
if (
  runtimeHandoffPackInitial.kind !== "runtime_handoff_pack" ||
  !runtimeHandoffPackInitial.recommendedSurface ||
  !runtimeHandoffPackInitial.overview ||
  !runtimeHandoffPackInitial.surfaces
) {
  console.error("[smoke:runtime-handoff-pack] expected top-level runtime handoff pack");
  process.exit(1);
}
const runtimeTriagePackInitial = JSON.parse(
  run("runtime-triage-pack-initial", ["./src/index.js", "runtime:triage-pack"]).stdout
).triagePack;
if (
  runtimeTriagePackInitial.kind !== "runtime_triage_pack" ||
  !runtimeTriagePackInitial.recommendedSurface ||
  !runtimeTriagePackInitial.overview ||
  !runtimeTriagePackInitial.surfaces
) {
  console.error("[smoke:runtime-triage-pack] expected top-level runtime triage pack");
  process.exit(1);
}
const runtimeSessionPackInitial = JSON.parse(
  run("runtime-session-pack-initial", ["./src/index.js", "runtime:session-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).sessionPack;
if (
  runtimeSessionPackInitial.kind !== "runtime_session_pack" ||
  !runtimeSessionPackInitial.recommendedSurface ||
  !runtimeSessionPackInitial.overview ||
  !runtimeSessionPackInitial.surfaces
) {
  console.error("[smoke:runtime-session-pack] expected top-level runtime session pack");
  process.exit(1);
}
const runtimeReviewInitial = JSON.parse(
  run("runtime-review-initial", ["./src/index.js", "runtime:review"]).stdout
).review;
if (
  runtimeReviewInitial.kind !== "runtime_review" ||
  !Array.isArray(runtimeReviewInitial.groups)
) {
  console.error("[smoke:runtime-review] expected top-level runtime review");
  process.exit(1);
}
const runtimeReviewPackInitial = JSON.parse(
  run("runtime-review-pack-initial", ["./src/index.js", "runtime:review-pack"]).stdout
).reviewPack;
if (
  runtimeReviewPackInitial.kind !== "runtime_review_pack" ||
  !runtimeReviewPackInitial.recommendedSurface ||
  !runtimeReviewPackInitial.overview ||
  !runtimeReviewPackInitial.surfaces
) {
  console.error("[smoke:runtime-review-pack] expected top-level runtime review pack");
  process.exit(1);
}
const runtimeAlertsInitial = JSON.parse(
  run("runtime-alerts-initial", ["./src/index.js", "runtime:alerts"]).stdout
).alerts;
if (
  runtimeAlertsInitial.kind !== "runtime_alerts" ||
  !Array.isArray(runtimeAlertsInitial.alerts)
) {
  console.error("[smoke:runtime-alerts] expected top-level runtime alerts");
  process.exit(1);
}
const runtimeWorkspacePackInitial = JSON.parse(
  run("runtime-workspace-pack-initial", ["./src/index.js", "runtime:workspace-pack"]).stdout
).workspacePack;
if (
  runtimeWorkspacePackInitial.kind !== "runtime_workspace_pack" ||
  !runtimeWorkspacePackInitial.recommendedSurface ||
  !runtimeWorkspacePackInitial.overview ||
  !runtimeWorkspacePackInitial.surfaces
) {
  console.error("[smoke:runtime-workspace-pack] expected top-level runtime workspace pack");
  process.exit(1);
}
const runtimeRolesInitial = JSON.parse(
  run("runtime-roles-initial", ["./src/index.js", "runtime:roles"]).stdout
).roles;
if (
  runtimeRolesInitial.kind !== "runtime_roles" ||
  !Array.isArray(runtimeRolesInitial.roles) ||
  runtimeRolesInitial.counts?.totalRoles < 4
) {
  console.error("[smoke:runtime-roles] expected top-level runtime roles");
  process.exit(1);
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

const fetchedTask = JSON.parse(run("task-get-verify", ["./src/index.js", "task:get", "--id", "task-3"]).stdout).task;
if (fetchedTask.id !== "task-3" || fetchedTask.owner !== "executor" || fetchedTask.verifier !== "tester") {
  console.error("[smoke:task-get] expected persisted task detail");
  process.exit(1);
}
const taskExecutionBrief = JSON.parse(run("task-brief-verify", ["./src/index.js", "task:brief", "--id", "task-3"]).stdout).brief;
if (
  taskExecutionBrief.kind !== "task_execution_brief" ||
  taskExecutionBrief.roles?.owner?.promptPath !== ".codex/agents/executor.md" ||
  taskExecutionBrief.roles?.verifier?.promptPath !== ".codex/agents/tester.md" ||
  taskExecutionBrief.recommendedNextAction !== "complete"
) {
  console.error("[smoke:task-brief] expected execution brief with owner/verifier prompt paths");
  process.exit(1);
}
const taskHistoryComplete = JSON.parse(
  run("task-history-complete", ["./src/index.js", "task:history", "--id", "task-3"]).stdout
).history;
if (
  !Array.isArray(taskHistoryComplete.history) ||
  taskHistoryComplete.history.length < 5 ||
  taskHistoryComplete.history.at(-1)?.type !== "approved"
) {
  console.error("[smoke:task-history] expected completed task history with approval tail");
  process.exit(1);
}
run("task-annotate-complete", [
  "./src/index.js",
  "task:annotate",
  "--id",
  "task-3",
  "--by",
  "tester",
  "--kind",
  "handoff",
  "--content",
  "verified with smoke coverage"
]);
const taskBriefAnnotated = JSON.parse(
  run("task-brief-annotated", ["./src/index.js", "task:brief", "--id", "task-3"]).stdout
).brief;
if (taskBriefAnnotated.annotations?.entries?.at(-1)?.content !== "verified with smoke coverage") {
  console.error("[smoke:task-annotate] expected annotation to appear in task brief");
  process.exit(1);
}
const taskReportDone = JSON.parse(
  run("task-report-done", ["./src/index.js", "task:report", "--id", "task-3"]).stdout
).report;
if (
  taskReportDone.closure?.reviewOutcome !== "approved" ||
  taskReportDone.acceptance?.[0]?.status !== "verified" ||
  taskReportDone.evidence?.annotations?.at(-1)?.content !== "verified with smoke coverage"
) {
  console.error("[smoke:task-report] expected approved task report with carried evidence");
  process.exit(1);
}
const testerInbox = JSON.parse(
  run("task-inbox-tester", ["./src/index.js", "task:inbox", "--role", "tester", "--worker", "tester-worker"]).stdout
).inbox;
if (testerInbox.counts.pendingReview !== 0 || testerInbox.tasks?.[0]?.relation !== "verifier_observe") {
  console.error("[smoke:task-inbox] expected tester inbox summary for completed task");
  process.exit(1);
}
const testerNext = JSON.parse(
  run("task-next-tester", ["./src/index.js", "task:next", "--role", "tester", "--worker", "tester-worker"]).stdout
).next;
if (testerNext.candidate !== null || testerNext.brief !== null) {
  console.error("[smoke:task-next] expected no next tester candidate after completion");
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
if (
  smokeTask.reviewedBy !== "tester" ||
  smokeTask.reviewOutcome !== "approved" ||
  !Array.isArray(smokeTask.reviewEvidence) ||
  smokeTask.reviewEvidence.length !== 2
) {
  console.error("[smoke:task-review] expected verifier approval metadata");
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
run("task-add-invalid-role", [
  "./src/index.js",
  "task:add",
  "--title",
  "invalid role task",
  "--owner",
  "leader",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "invalid owner caught",
  "--verification",
  "task check reports role error"
]);
const invalidRoleTaskValidation = JSON.parse(
  run("task-check-invalid-role", ["./src/index.js", "task:check", "--id", "task-1"]).stdout
).validation;
if (invalidRoleTaskValidation.ready || !invalidRoleTaskValidation.issues.some((issue) => issue.code === "unknown_owner")) {
  console.error("[smoke:task-check] expected unknown owner role validation issue");
  process.exit(1);
}
run("task-claim-invalid-role", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "blocked-worker"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
run("review-task-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "review loop task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/state.js",
  "--acceptance",
  "review loop enforced",
  "--verification",
  "task transitions honor verifier"
]);
run("review-task-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "review-worker"]);
run("review-task-ready", ["./src/index.js", "task:review", "--id", "task-1", "--by", "review-worker"]);
run("review-task-reject", [
  "./src/index.js",
  "task:reject",
  "--id",
  "task-1",
  "--by",
  "tester",
  "--status",
  "claimed",
  "--notes",
  "needs another pass",
  "--evidence",
  "reviewed smoke rejection"
]);
const rejectedTask = JSON.parse(run("review-task-list", ["./src/index.js", "task:list"]).stdout).tasks[0];
if (
  rejectedTask.queueStatus !== "claimed" ||
  rejectedTask.claimedBy !== "review-worker" ||
  rejectedTask.reviewOutcome !== "changes_requested" ||
  rejectedTask.reviewedBy !== "tester"
) {
  console.error("[smoke:task-reject] expected claimed return-to-worker review outcome");
  process.exit(1);
}
const reviewInbox = JSON.parse(
  run("task-inbox-reviewer", ["./src/index.js", "task:inbox", "--role", "tester", "--worker", "tester-worker"]).stdout
).inbox;
if (reviewInbox.counts.pendingReview !== 0 || reviewInbox.tasks?.[0]?.relation !== "verifier_observe") {
  console.error("[smoke:task-inbox] expected verifier inbox to reflect post-rejection observe state");
  process.exit(1);
}
const ownerNext = JSON.parse(
  run("task-next-owner", ["./src/index.js", "task:next", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).next;
if (ownerNext.candidate?.id !== "task-1" || ownerNext.candidate?.relation !== "owner_claimed_by_worker") {
  console.error("[smoke:task-next] expected owner next candidate to continue claimed task");
  process.exit(1);
}
const ownerPickup = JSON.parse(
  run("task-pickup-owner", ["./src/index.js", "task:pickup", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).pickup;
if (ownerPickup.outcome !== "continue" || ownerPickup.task?.id !== "task-1" || ownerPickup.command !== "node ./src/index.js task:review --id task-1 --by review-worker") {
  console.error("[smoke:task-pickup] expected claimed task to resume with review follow-up");
  process.exit(1);
}
const ownerSession = JSON.parse(
  run("worker-session-owner", ["./src/index.js", "worker:session", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).session;
if (
  ownerSession.counts.activeOwned !== 1 ||
  ownerSession.focus?.kind !== "active_task" ||
  ownerSession.activeOwned?.[0]?.summary?.id !== "task-1"
) {
  console.error("[smoke:worker-session] expected active owner session focus");
  process.exit(1);
}
run("task-annotate-owner", [
  "./src/index.js",
  "task:annotate",
  "--id",
  "task-1",
  "--by",
  "review-worker",
  "--kind",
  "context",
  "--content",
  "worker needs another pass before review"
]);
const ownerSessionAnnotated = JSON.parse(
  run("worker-session-owner-annotated", ["./src/index.js", "worker:session", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).session;
if (
  ownerSessionAnnotated.activeOwned?.[0]?.recentAnnotations?.at(-1)?.content !==
  "worker needs another pass before review"
) {
  console.error("[smoke:worker-session] expected owner annotation in worker session");
  process.exit(1);
}
const ownerHandoff = JSON.parse(
  run("worker-handoff-owner", ["./src/index.js", "worker:handoff", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).handoff;
if (
  ownerHandoff.focus?.kind !== "active_task" ||
  ownerHandoff.currentTask?.id !== "task-1" ||
  ownerHandoff.recentAnnotations?.at(-1)?.content !== "worker needs another pass before review"
) {
  console.error("[smoke:worker-handoff] expected owner handoff package with current task context");
  process.exit(1);
}
const ownerCloseout = JSON.parse(
  run("worker-closeout-owner", ["./src/index.js", "worker:closeout", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).closeout;
if (
  ownerCloseout.focus?.kind !== "active_task" ||
  ownerCloseout.command !== "node ./src/index.js task:review --id task-1 --by review-worker" ||
  ownerCloseout.report?.task?.id !== "task-1"
) {
  console.error("[smoke:worker-closeout] expected owner closeout bundle");
  process.exit(1);
}
const ownerWorkerPack = JSON.parse(
  run("runtime-worker-pack-owner", ["./src/index.js", "runtime:worker-pack", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).workerPack;
if (
  ownerWorkerPack.kind !== "runtime_worker_pack" ||
  ownerWorkerPack.recommendedSurface !== "worker:session" ||
  ownerWorkerPack.next?.focus?.kind !== "active_task" ||
  ownerWorkerPack.surfaces?.handoff?.currentTask?.id !== "task-1"
) {
  console.error("[smoke:runtime-worker-pack] expected owner worker pack");
  process.exit(1);
}
const ownerPackCli = JSON.parse(
  run("runtime-owner-pack-cli", ["./src/index.js", "runtime:owner-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).ownerPack;
if (
  ownerPackCli.kind !== "runtime_owner_pack" ||
  ownerPackCli.recommendedSurface !== "worker:session" ||
  ownerPackCli.next?.focus?.kind !== "active_task" ||
  ownerPackCli.surfaces?.handoff?.currentTask?.id !== "task-1" ||
  ownerPackCli.mode !== "owner"
) {
  console.error("[smoke:runtime-owner-pack] expected CLI owner pack");
  process.exit(1);
}
const ownerPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_owner_pack",
      arguments: {
        role: "executor",
        workerId: "review-worker"
      }
    }
  })
].join("\n") + "\n";
const ownerPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: ownerPackMcpInput,
  encoding: "utf8"
});
const ownerPackMcpLines = ownerPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const ownerPackMcpPayload = JSON.parse(JSON.parse(ownerPackMcpLines[1]).result.content[0].text);
if (
  ownerPackMcp.status !== 0 ||
  ownerPackMcpPayload.ownerPack?.recommendedSurface !== "worker:session" ||
  ownerPackMcpPayload.ownerPack?.next?.focus?.taskId !== "task-1" ||
  ownerPackMcpPayload.ownerPack?.surfaces?.handoff?.currentTask?.id !== "task-1"
) {
  console.error("[smoke:runtime-owner-pack-mcp] expected MCP owner pack");
  console.error(ownerPackMcp.stderr || ownerPackMcp.stdout);
  process.exit(1);
}
const reviewTaskHistory = JSON.parse(
  run("task-history-review-loop", ["./src/index.js", "task:history", "--id", "task-1"]).stdout
).history;
if (
  reviewTaskHistory.history?.map((entry) => entry.type).join(",") !== "created,claimed,ready_for_review,changes_requested"
) {
  console.error("[smoke:task-history] expected review loop handoff history");
  process.exit(1);
}
const reviewTaskReport = JSON.parse(
  run("task-report-review-loop", ["./src/index.js", "task:report", "--id", "task-1"]).stdout
).report;
if (
  reviewTaskReport.closure?.reviewOutcome !== "changes_requested" ||
  reviewTaskReport.closure?.closureReady !== false ||
  reviewTaskReport.evidence?.annotations?.at(-1)?.content !== "worker needs another pass before review"
) {
  console.error("[smoke:task-report] expected changes-requested task report");
  process.exit(1);
}
const reviewRuntimeRecovery = JSON.parse(
  run("runtime-recovery-review-loop", ["./src/index.js", "runtime:recovery"]).stdout
).recovery;
if (
  reviewRuntimeRecovery.counts?.changesRequested !== 1 ||
  reviewRuntimeRecovery.next?.taskId !== "task-1" ||
  reviewRuntimeRecovery.next?.recoveryType !== "changes_requested" ||
  reviewRuntimeRecovery.groups?.some((group) => group.recoveryType === "changes_requested" && group.entries?.[0]?.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-recovery] expected changes-requested recovery workspace");
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
const swarmBriefPlanned = JSON.parse(
  run("swarm-brief-planned", ["./src/index.js", "swarm:brief", "--id", "swarm-1"]).stdout
).brief;
if (
  swarmBriefPlanned.kind !== "swarm_execution_brief" ||
  swarmBriefPlanned.recommendedNextAction !== "queue_swarm_lanes" ||
  swarmBriefPlanned.owner?.id !== "leader"
) {
  console.error("[smoke:swarm-brief] expected pre-queue swarm brief");
  process.exit(1);
}
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
const swarmDispatchBundleCli = JSON.parse(
  run("swarm-dispatch-bundle-cli", ["./src/index.js", "swarm:dispatch-bundle", "--id", "swarm-1"]).stdout
).dispatchBundle;
if (
  swarmDispatchBundleCli.kind !== "swarm_dispatch_bundle" ||
  swarmDispatchBundleCli.dispatchableCount !== 2 ||
  swarmDispatchBundleCli.nextLane?.lane !== "lane-alpha" ||
  swarmDispatchBundleCli.taskBrief?.task?.id !== "task-1"
) {
  console.error("[smoke:swarm-dispatch-bundle] expected CLI dispatch bundle with next lane task brief");
  process.exit(1);
}
const leaderAssignmentsCli = JSON.parse(
  run("leader-assignments-cli", ["./src/index.js", "leader:assignments"]).stdout
).assignments;
if (
  leaderAssignmentsCli.kind !== "leader_assignments" ||
  leaderAssignmentsCli.counts?.totalAssignments !== 2 ||
  leaderAssignmentsCli.counts?.ownerGroups !== 2 ||
  !leaderAssignmentsCli.groups?.some((group) => group.owner?.id === "explore") ||
  !leaderAssignmentsCli.groups?.some((group) => group.owner?.id === "executor") ||
  !leaderAssignmentsCli.groups?.flatMap((group) => group.assignments ?? []).some((assignment) => assignment.taskBrief?.task?.id === "task-1")
) {
  console.error("[smoke:leader-assignments] expected CLI leader assignments grouped by owner");
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
run("swarm-task-1-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "worker-alpha"]);
run("swarm-task-1-approve", [
  "./src/index.js",
  "task:approve",
  "--id",
  "task-1",
  "--by",
  "reviewer",
  "--notes",
  "lane alpha approved"
]);
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
run("swarm-task-2-review", ["./src/index.js", "task:review", "--id", "task-2", "--by", "worker-beta"]);
run("swarm-task-2-approve", [
  "./src/index.js",
  "task:approve",
  "--id",
  "task-2",
  "--by",
  "tester",
  "--notes",
  "lane beta approved"
]);
const swarmOverviewReadyToComplete = JSON.parse(
  run("swarm-overview-ready-to-complete", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
const swarmExecutionBrief = JSON.parse(
  run("swarm-brief-ready", ["./src/index.js", "swarm:brief", "--id", "swarm-1"]).stdout
).brief;
if (
  swarmExecutionBrief.kind !== "swarm_execution_brief" ||
  swarmExecutionBrief.recommendedNextAction !== "complete" ||
  swarmExecutionBrief.nextLane !== null ||
  swarmExecutionBrief.lanes?.[0]?.owner?.promptPath !== ".codex/agents/explore.md"
) {
  console.error("[smoke:swarm-brief] expected completion-ready swarm brief");
  process.exit(1);
}
const swarmBundleCli = JSON.parse(
  run("swarm-bundle-cli", ["./src/index.js", "swarm:bundle", "--id", "swarm-1"]).stdout
).bundle;
if (
  swarmBundleCli.kind !== "swarm_bundle" ||
  swarmBundleCli.lanes?.length !== 2 ||
  swarmBundleCli.lanes?.[0]?.report?.task?.id !== "task-1" ||
  swarmBundleCli.summary?.includes("ready to complete") !== true
) {
  console.error("[smoke:swarm-bundle] expected CLI swarm bundle with lane reports");
  process.exit(1);
}
const swarmCloseoutCli = JSON.parse(
  run("swarm-closeout-cli", ["./src/index.js", "swarm:closeout", "--id", "swarm-1"]).stdout
).closeout;
if (
  swarmCloseoutCli.kind !== "swarm_closeout" ||
  swarmCloseoutCli.readyToComplete !== true ||
  swarmCloseoutCli.command !== "node ./src/index.js swarm:done --id swarm-1" ||
  swarmCloseoutCli.bundle?.swarm?.id !== "swarm-1"
) {
  console.error("[smoke:swarm-closeout] expected CLI swarm closeout bundle with explicit close command");
  process.exit(1);
}
run("leader-workspace-swarm-init", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader workspace smoke",
  "--owner",
  "leader",
  "--max-workers",
  "1",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-leader",
      summary: "Queue this swarm next",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/state.js"],
      acceptance: ["leader workspace identifies queue-ready swarm"],
      verification: ["leader workspace summary names swarm-2"]
    }
  ])
]);
const leaderWorkspaceCli = JSON.parse(
  run("leader-workspace-cli", ["./src/index.js", "leader:workspace"]).stdout
).workspace;
if (
  leaderWorkspaceCli.kind !== "leader_workspace" ||
  leaderWorkspaceCli.counts?.totalSwarms !== 2 ||
  leaderWorkspaceCli.counts?.readyToComplete !== 1 ||
  leaderWorkspaceCli.focus?.swarmId !== "swarm-2" ||
  leaderWorkspaceCli.focus?.recommendedNextAction !== "queue_swarm_lanes" ||
  leaderWorkspaceCli.focus?.bundle?.swarm?.id !== "swarm-2"
) {
  console.error("[smoke:leader-workspace] expected CLI leader workspace with prioritized swarm focus");
  process.exit(1);
}
const leaderQueueCli = JSON.parse(
  run("leader-queue-cli", ["./src/index.js", "leader:queue"]).stdout
).queue;
if (
  leaderQueueCli.kind !== "leader_queue" ||
  leaderQueueCli.counts?.total !== 2 ||
  leaderQueueCli.next?.swarmId !== "swarm-2" ||
  leaderQueueCli.next?.recommendedNextAction !== "queue_swarm_lanes"
) {
  console.error("[smoke:leader-queue] expected CLI leader queue prioritized to the queued-next swarm");
  process.exit(1);
}
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
const invalidSwarmRoleJson = JSON.stringify([
  {
    lane: "lane-role-bad-1",
    summary: "Unknown owner lane",
    owner: "leader",
    verifier: "tester",
    scope: ["src/index.js"],
    acceptance: ["role validation enforced"],
    verification: ["swarm check reports owner issue"]
  }
]);
run("swarm-init-invalid-role", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Invalid swarm role smoke",
  "--lanes",
  invalidSwarmRoleJson
]);
const invalidSwarmRoleValidation = JSON.parse(
  run("swarm-check-invalid-role", ["./src/index.js", "swarm:check", "--id", "swarm-1"]).stdout
).validation;
if (
  invalidSwarmRoleValidation.ready ||
  !invalidSwarmRoleValidation.lanes?.[0]?.issues?.some((issue) => issue.code === "unknown_owner")
) {
  console.error("[smoke:swarm-check] expected unknown lane owner validation issue");
  process.exit(1);
}
run("swarm-queue-invalid-role", ["./src/index.js", "swarm:queue", "--id", "swarm-1"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
run("swarm-init-blocked", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Blocked swarm smoke",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-blocked",
      summary: "Blocked lane",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["blocked bundle reports this lane"],
      verification: ["swarm blockers surface returns task report"]
    }
  ])
]);
run("swarm-queue-blocked", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
run("swarm-dispatch-blocked", [
  "./src/index.js",
  "swarm:dispatch",
  "--id",
  "swarm-1",
  "--by",
  "blocked-worker",
  "--owner",
  "executor"
]);
run("swarm-task-block", [
  "./src/index.js",
  "task:block",
  "--id",
  "task-1",
  "--by",
  "blocked-worker",
  "--notes",
  "waiting on unblock context"
]);
const swarmBlockersCli = JSON.parse(
  run("swarm-blockers-cli", ["./src/index.js", "swarm:blockers", "--id", "swarm-1"]).stdout
).blockers;
if (
  swarmBlockersCli.kind !== "swarm_blockers" ||
  swarmBlockersCli.blockedCount !== 1 ||
  swarmBlockersCli.blockers?.[0]?.taskId !== "task-1" ||
  swarmBlockersCli.blockers?.[0]?.report?.task?.id !== "task-1"
) {
  console.error("[smoke:swarm-blockers] expected CLI blocker bundle with blocked lane report");
  process.exit(1);
}
const swarmBlockersMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_blockers",
      arguments: { id: "swarm-1" }
    }
  })
].join("\n") + "\n";
const swarmBlockersMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmBlockersMcpInput,
  encoding: "utf8"
});
const swarmBlockersMcpLines = swarmBlockersMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmBlockersMcpPayload = JSON.parse(JSON.parse(swarmBlockersMcpLines[1]).result.content[0].text);
if (
  swarmBlockersMcp.status !== 0 ||
  swarmBlockersMcpPayload.blockers?.blockedCount !== 1 ||
  swarmBlockersMcpPayload.blockers?.blockers?.[0]?.recommendedNextAction !== "resolve_blocker_and_requeue"
) {
  console.error("[smoke:swarm-blockers-mcp] expected MCP blocker bundle");
  console.error(swarmBlockersMcp.stderr || swarmBlockersMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("swarm-init-dispatchable", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Dispatch bundle smoke",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-dispatch",
      summary: "Dispatch lane",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["dispatch bundle surfaces next lane"],
      verification: ["dispatch bundle includes task brief"]
    }
  ])
]);
run("swarm-queue-dispatchable", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
const swarmDispatchBundleMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_dispatch_bundle",
      arguments: { id: "swarm-1" }
    }
  })
].join("\n") + "\n";
const swarmDispatchBundleMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmDispatchBundleMcpInput,
  encoding: "utf8"
});
const swarmDispatchBundleMcpLines = swarmDispatchBundleMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmDispatchBundleMcpPayload = JSON.parse(JSON.parse(swarmDispatchBundleMcpLines[1]).result.content[0].text);
if (
  swarmDispatchBundleMcp.status !== 0 ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.nextLane?.lane !== "lane-dispatch" ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.taskBrief?.task?.id !== "task-1"
) {
  console.error("[smoke:swarm-dispatch-bundle-mcp] expected MCP dispatch bundle");
  console.error(swarmDispatchBundleMcp.stderr || swarmDispatchBundleMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("leader-queue-swarm-done", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader queue done swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-done",
      summary: "Done lane",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["done swarm exists"],
      verification: ["leader queue ranks pending swarm first"]
    }
  ])
]);
run("leader-queue-swarm-done-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
run("leader-queue-swarm-done-dispatch", ["./src/index.js", "swarm:dispatch", "--id", "swarm-1", "--by", "worker-done", "--owner", "explore"]);
run("leader-queue-swarm-done-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "worker-done"]);
run("leader-queue-swarm-done-approve", ["./src/index.js", "task:approve", "--id", "task-1", "--by", "reviewer"]);
run("leader-queue-swarm-pending", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader queue pending swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-pending",
      summary: "Pending lane",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["pending swarm exists"],
      verification: ["leader queue returns it first"]
    }
  ])
]);
const leaderQueueMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_queue",
      arguments: {}
    }
  })
].join("\n") + "\n";
const leaderQueueMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderQueueMcpInput,
  encoding: "utf8"
});
const leaderQueueMcpLines = leaderQueueMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderQueueMcpPayload = JSON.parse(JSON.parse(leaderQueueMcpLines[1]).result.content[0].text);
if (
  leaderQueueMcp.status !== 0 ||
  leaderQueueMcpPayload.queue?.next?.swarmId !== "swarm-2" ||
  leaderQueueMcpPayload.queue?.next?.recommendedNextAction !== "queue_swarm_lanes"
) {
  console.error("[smoke:leader-queue-mcp] expected MCP leader queue");
  console.error(leaderQueueMcp.stderr || leaderQueueMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("leader-assignments-swarm", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader assignments swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-assign-a",
      summary: "Dispatch to explore",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["assignment grouped under explore"],
      verification: ["leader assignments returns owner groups"]
    },
    {
      lane: "lane-assign-b",
      summary: "Dispatch to executor",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["assignment grouped under executor"],
      verification: ["leader assignments returns second owner group"]
    }
  ])
]);
run("leader-assignments-swarm-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
const leaderAssignmentsMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignments",
      arguments: {}
    }
  })
].join("\n") + "\n";
const leaderAssignmentsMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentsMcpInput,
  encoding: "utf8"
});
const leaderAssignmentsMcpLines = leaderAssignmentsMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentsMcpPayload = JSON.parse(JSON.parse(leaderAssignmentsMcpLines[1]).result.content[0].text);
if (
  leaderAssignmentsMcp.status !== 0 ||
  leaderAssignmentsMcpPayload.assignments?.counts?.totalAssignments !== 2 ||
  leaderAssignmentsMcpPayload.assignments?.counts?.ownerGroups !== 2 ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.some((group) => group.owner?.id === "explore") ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.some((group) => group.owner?.id === "executor") ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.flatMap((group) => group.assignments ?? []).some((assignment) => assignment.taskBrief?.task?.id === "task-1") ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.flatMap((group) => group.assignments ?? []).some((assignment) => assignment.taskBrief?.task?.id === "task-2")
) {
  console.error("[smoke:leader-assignments-mcp] expected MCP leader assignments");
  console.error(leaderAssignmentsMcp.stderr || leaderAssignmentsMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("dashboard-task-blocked", [
  "./src/index.js",
  "task:add",
  "--title",
  "dashboard blocked task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "blocked visible",
  "--verification",
  "dashboard shows blocked"
]);
run("dashboard-task-blocked-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "worker-blocked"]);
run("dashboard-task-blocked-mark", ["./src/index.js", "task:block", "--id", "task-1", "--by", "worker-blocked"]);
run("dashboard-task-review", [
  "./src/index.js",
  "task:add",
  "--title",
  "dashboard review task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/mcp.js",
  "--acceptance",
  "review visible",
  "--verification",
  "dashboard shows review"
]);
run("dashboard-task-review-claim", ["./src/index.js", "task:claim", "--id", "task-2", "--by", "worker-review"]);
run("dashboard-task-review-ready", ["./src/index.js", "task:review", "--id", "task-2", "--by", "worker-review"]);
run("dashboard-task-active", [
  "./src/index.js",
  "task:add",
  "--title",
  "dashboard active task",
  "--owner",
  "explore",
  "--verifier",
  "reviewer",
  "--scope",
  "src/state.js",
  "--acceptance",
  "active visible",
  "--verification",
  "dashboard shows active"
]);
run("dashboard-task-active-claim", ["./src/index.js", "task:claim", "--id", "task-3", "--by", "worker-active"]);
run("dashboard-swarm", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Dashboard swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-dashboard",
      summary: "Queue visible in dashboard",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["dashboard queue visible"],
      verification: ["dashboard leader queue available"]
    }
  ])
]);
run("dashboard-swarm-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
const runtimeActivityCli = JSON.parse(
  run("runtime-activity-cli", ["./src/index.js", "runtime:activity"]).stdout
).activity;
if (
  runtimeActivityCli.counts?.totalEntries < 6 ||
  runtimeActivityCli.next?.type !== "created" ||
  runtimeActivityCli.next?.taskId !== "task-4" ||
  runtimeActivityCli.entries?.some((entry) => entry.type === "blocked" && entry.taskId === "task-1") !== true ||
  runtimeActivityCli.entries?.some((entry) => entry.type === "ready_for_review" && entry.taskId === "task-2") !== true ||
  runtimeActivityCli.entries?.some((entry) => entry.type === "claimed" && entry.taskId === "task-3") !== true
) {
  console.error("[smoke:runtime-activity] expected CLI runtime activity stream");
  process.exit(1);
}
const runtimeCloseoutCli = JSON.parse(
  run("runtime-closeout-cli", ["./src/index.js", "runtime:closeout"]).stdout
).closeout;
if (
  runtimeCloseoutCli.counts?.tasksReady !== 0 ||
  runtimeCloseoutCli.counts?.swarmsReady !== 0 ||
  runtimeCloseoutCli.counts?.totalReady !== 0 ||
  runtimeCloseoutCli.next !== null ||
  runtimeCloseoutCli.tasks?.length !== 0
) {
  console.error("[smoke:runtime-closeout] expected CLI runtime closeout workspace");
  process.exit(1);
}
const runtimeCloseoutPackCli = JSON.parse(
  run("runtime-closeout-pack-cli", ["./src/index.js", "runtime:closeout-pack"]).stdout
).closeoutPack;
if (
  runtimeCloseoutPackCli.recommendedSurface !== "runtime:closeout" ||
  runtimeCloseoutPackCli.next?.closeout !== null ||
  runtimeCloseoutPackCli.overview?.closeout?.totalReady !== 0 ||
  runtimeCloseoutPackCli.surfaces?.summaryPack?.overview?.closeout?.totalReady !== 0
) {
  console.error("[smoke:runtime-closeout-pack] expected CLI closeout pack to reflect empty closeout state");
  process.exit(1);
}
const runtimeDashboardCli = JSON.parse(
  run("runtime-dashboard-cli", ["./src/index.js", "runtime:dashboard"]).stdout
).dashboard;
if (
  runtimeDashboardCli.counts?.blockedTasks !== 1 ||
  runtimeDashboardCli.counts?.pendingReview !== 1 ||
  runtimeDashboardCli.counts?.activeClaimed !== 1 ||
  runtimeDashboardCli.leader?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-dashboard] expected CLI dashboard counts and leader queue");
  process.exit(1);
}
const runtimeDispatchCli = JSON.parse(
  run("runtime-dispatch-cli", ["./src/index.js", "runtime:dispatch"]).stdout
).dispatch;
if (
  runtimeDispatchCli.counts?.ownerGroups !== 1 ||
  runtimeDispatchCli.counts?.totalAssignments !== 1 ||
  runtimeDispatchCli.next?.lane !== "lane-dashboard" ||
  runtimeDispatchCli.groups?.[0]?.owner?.id !== "executor" ||
  runtimeDispatchCli.groups?.[0]?.assignments?.[0]?.taskBrief?.task?.id !== "task-4"
) {
  console.error("[smoke:runtime-dispatch] expected CLI owner-grouped dispatch workspace");
  process.exit(1);
}
const runtimeDispatchPackCli = JSON.parse(
  run("runtime-dispatch-pack-cli", ["./src/index.js", "runtime:dispatch-pack"]).stdout
).dispatchPack;
if (
  runtimeDispatchPackCli.recommendedSurface !== "runtime:dispatch" ||
  runtimeDispatchPackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeDispatchPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeDispatchPackCli.overview?.dispatch?.totalAssignments !== 1 ||
  runtimeDispatchPackCli.surfaces?.roles?.next?.role?.id !== "tester"
) {
  console.error("[smoke:runtime-dispatch-pack] expected CLI dispatch pack to recommend dispatch");
  process.exit(1);
}
const runtimeFocusCli = JSON.parse(
  run("runtime-focus-cli", ["./src/index.js", "runtime:focus"]).stdout
).focus;
if (
  runtimeFocusCli.focus?.type !== "blocked_task" ||
  runtimeFocusCli.focus?.taskId !== "task-1" ||
  runtimeFocusCli.focus?.recommendedNextAction !== "resolve_blocker_and_requeue" ||
  runtimeFocusCli.sources?.review?.totalPendingReview !== 1 ||
  runtimeFocusCli.sources?.dispatch?.totalAssignments !== 1
) {
  console.error("[smoke:runtime-focus] expected CLI runtime focus to prioritize blocked work");
  process.exit(1);
}
const runtimeQueuePackCli = JSON.parse(
  run("runtime-queue-pack-cli", ["./src/index.js", "runtime:queue-pack"]).stdout
).queuePack;
if (
  runtimeQueuePackCli.recommendedSurface !== "leader:queue" ||
  runtimeQueuePackCli.next?.queue?.swarmId !== "swarm-1" ||
  runtimeQueuePackCli.next?.focus?.taskId !== "task-1" ||
  runtimeQueuePackCli.overview?.queue?.total !== 1 ||
  runtimeQueuePackCli.surfaces?.dashboard?.leader?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-queue-pack] expected CLI queue pack to recommend leader queue");
  process.exit(1);
}
const runtimeHandoffsCli = JSON.parse(
  run("runtime-handoffs-cli", ["./src/index.js", "runtime:handoffs"]).stdout
).handoffs;
if (
  runtimeHandoffsCli.counts?.actorGroups !== 3 ||
  runtimeHandoffsCli.counts?.totalHandoffs !== 3 ||
  runtimeHandoffsCli.counts?.reviewDecisions !== 1 ||
  runtimeHandoffsCli.counts?.blockedRecoveries !== 1 ||
  runtimeHandoffsCli.counts?.ownerClaims !== 1 ||
  runtimeHandoffsCli.next?.taskId !== "task-2" ||
  runtimeHandoffsCli.next?.actor?.id !== "tester" ||
  runtimeHandoffsCli.groups?.some((group) => group.actor?.id === "tester" && group.handoffs?.[0]?.taskId === "task-2") !== true ||
  runtimeHandoffsCli.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-1")) !== true ||
  runtimeHandoffsCli.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-4")) !== true
) {
  console.error("[smoke:runtime-handoffs] expected CLI next-actor handoff workspace");
  process.exit(1);
}
const runtimeRecoveryCli = JSON.parse(
  run("runtime-recovery-cli", ["./src/index.js", "runtime:recovery"]).stdout
).recovery;
if (
  runtimeRecoveryCli.counts?.recoveryGroups < 1 ||
  runtimeRecoveryCli.counts?.blocked !== 1 ||
  runtimeRecoveryCli.next?.taskId !== "task-1" ||
  runtimeRecoveryCli.next?.recoveryType !== "blocked_recovery" ||
  runtimeRecoveryCli.groups?.some((group) => group.recoveryType === "blocked_recovery" && group.entries?.[0]?.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-recovery] expected CLI recovery workspace");
  process.exit(1);
}
const runtimeRecoveryPackCli = JSON.parse(
  run("runtime-recovery-pack-cli", ["./src/index.js", "runtime:recovery-pack"]).stdout
).recoveryPack;
if (
  runtimeRecoveryPackCli.recommendedSurface !== "runtime:recovery" ||
  runtimeRecoveryPackCli.next?.recovery?.taskId !== "task-1" ||
  runtimeRecoveryPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeRecoveryPackCli.overview?.recovery?.blocked !== 1 ||
  runtimeRecoveryPackCli.surfaces?.focus?.focus?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-recovery-pack] expected CLI recovery pack to recommend recovery");
  process.exit(1);
}
const runtimeSummaryPackCli = JSON.parse(
  run("runtime-summary-pack-cli", ["./src/index.js", "runtime:summary-pack"]).stdout
).summaryPack;
if (
  runtimeSummaryPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeSummaryPackCli.focus?.focus?.taskId !== "task-1" ||
  runtimeSummaryPackCli.next?.recovery?.taskId !== "task-1" ||
  runtimeSummaryPackCli.overview?.dashboard?.blockedTasks !== 1
) {
  console.error("[smoke:runtime-summary-pack] expected CLI summary pack to recommend focus");
  process.exit(1);
}
const runtimeLeaderPackCli = JSON.parse(
  run("runtime-leader-pack-cli", ["./src/index.js", "runtime:leader-pack"]).stdout
).leaderPack;
if (
  runtimeLeaderPackCli.recommendedSurface !== "runtime:dispatch" ||
  runtimeLeaderPackCli.next?.workspace?.swarmId !== "swarm-1" ||
  runtimeLeaderPackCli.overview?.dispatch?.totalAssignments !== 1 ||
  runtimeLeaderPackCli.surfaces?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-leader-pack] expected CLI leader pack to recommend dispatch");
  process.exit(1);
}
const runtimeOperatorPackCli = JSON.parse(
  run("runtime-operator-pack-cli", ["./src/index.js", "runtime:operator-pack"]).stdout
).operatorPack;
if (
  runtimeOperatorPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeOperatorPackCli.focus?.focus?.taskId !== "task-1" ||
  runtimeOperatorPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeOperatorPackCli.overview?.alerts?.high !== 1 ||
  runtimeOperatorPackCli.surfaces?.closeout?.counts?.tasksReady !== 0
) {
  console.error("[smoke:runtime-operator-pack] expected CLI operator pack to recommend focus");
  process.exit(1);
}
const runtimeControlPackCli = JSON.parse(
  run("runtime-control-pack-cli", ["./src/index.js", "runtime:control-pack"]).stdout
).controlPack;
if (
  runtimeControlPackCli.recommendedSurface !== "runtime:summary-pack" ||
  runtimeControlPackCli.next?.summary?.taskId !== "task-1" ||
  runtimeControlPackCli.next?.workspace?.recovery?.taskId !== "task-1" ||
  runtimeControlPackCli.next?.operator?.handoff?.taskId !== "task-2" ||
  runtimeControlPackCli.next?.leader?.dispatch?.lane !== "lane-dashboard"
) {
  console.error("[smoke:runtime-control-pack] expected CLI control pack to recommend summary pack");
  process.exit(1);
}
const runtimeSignalPackCli = JSON.parse(
  run("runtime-signal-pack-cli", ["./src/index.js", "runtime:signal-pack"]).stdout
).signalPack;
if (
  runtimeSignalPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeSignalPackCli.next?.focus?.taskId !== "task-1" ||
  runtimeSignalPackCli.next?.alert?.taskId !== "task-1" ||
  runtimeSignalPackCli.next?.activity?.taskId !== "task-4" ||
  runtimeSignalPackCli.next?.role?.role?.id !== "tester"
) {
  console.error("[smoke:runtime-signal-pack] expected CLI signal pack to recommend focus");
  process.exit(1);
}
const runtimeHandoffPackCli = JSON.parse(
  run("runtime-handoff-pack-cli", ["./src/index.js", "runtime:handoff-pack"]).stdout
).handoffPack;
if (
  runtimeHandoffPackCli.recommendedSurface !== "runtime:handoffs" ||
  runtimeHandoffPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeHandoffPackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeHandoffPackCli.next?.review?.taskId !== "task-2" ||
  runtimeHandoffPackCli.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-handoff-pack] expected CLI handoff pack to recommend handoffs");
  process.exit(1);
}
const runtimeTriagePackCli = JSON.parse(
  run("runtime-triage-pack-cli", ["./src/index.js", "runtime:triage-pack"]).stdout
).triagePack;
if (
  runtimeTriagePackCli.recommendedSurface !== "runtime:focus" ||
  runtimeTriagePackCli.next?.focus?.taskId !== "task-1" ||
  runtimeTriagePackCli.next?.alert?.taskId !== "task-1" ||
  runtimeTriagePackCli.next?.review?.taskId !== "task-2" ||
  runtimeTriagePackCli.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-triage-pack] expected CLI triage pack to recommend focus");
  process.exit(1);
}
const runtimeSessionPackCli = JSON.parse(
  run("runtime-session-pack-cli", ["./src/index.js", "runtime:session-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).sessionPack;
if (
  runtimeSessionPackCli.recommendedSurface !== "worker:closeout" ||
  runtimeSessionPackCli.next?.verifier?.review?.taskId !== "task-2" ||
  runtimeSessionPackCli.next?.role?.lane !== "verifier" ||
  runtimeSessionPackCli.surfaces?.verifierPack?.recommendedSurface !== "worker:closeout"
) {
  console.error("[smoke:runtime-session-pack] expected CLI session pack to recommend verifier next");
  process.exit(1);
}
const runtimeReviewCli = JSON.parse(
  run("runtime-review-cli", ["./src/index.js", "runtime:review"]).stdout
).review;
if (
  runtimeReviewCli.counts?.verifierGroups !== 1 ||
  runtimeReviewCli.counts?.totalPendingReview !== 1 ||
  runtimeReviewCli.next?.taskId !== "task-2" ||
  runtimeReviewCli.groups?.[0]?.verifier?.id !== "tester" ||
  runtimeReviewCli.groups?.[0]?.tasks?.[0]?.taskBrief?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-review] expected CLI verifier-grouped review workspace");
  process.exit(1);
}
const runtimeReviewPackCli = JSON.parse(
  run("runtime-review-pack-cli", ["./src/index.js", "runtime:review-pack", "--role", "tester", "--worker", "tester-worker"]).stdout
).reviewPack;
if (
  runtimeReviewPackCli.recommendedSurface !== "runtime:verifier-pack" ||
  runtimeReviewPackCli.next?.review?.taskId !== "task-2" ||
  runtimeReviewPackCli.next?.verifier?.decision?.id !== "task-2" ||
  runtimeReviewPackCli.overview?.review?.totalPendingReview !== 1 ||
  runtimeReviewPackCli.surfaces?.verifierPack?.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-review-pack] expected CLI review pack to recommend verifier pack");
  process.exit(1);
}
const runtimeAlertsCli = JSON.parse(
  run("runtime-alerts-cli", ["./src/index.js", "runtime:alerts"]).stdout
).alerts;
if (
  runtimeAlertsCli.counts?.high !== 1 ||
  runtimeAlertsCli.counts?.medium < 1 ||
  runtimeAlertsCli.alerts?.[0]?.kind !== "blocked_task"
) {
  console.error("[smoke:runtime-alerts] expected CLI alert stream with blocked task first");
  process.exit(1);
}
const runtimeRolesCli = JSON.parse(
  run("runtime-roles-cli", ["./src/index.js", "runtime:roles"]).stdout
).roles;
if (
  runtimeRolesCli.counts?.withPendingReview !== 1 ||
  runtimeRolesCli.counts?.withBlockedOwnerWork !== 1 ||
  runtimeRolesCli.counts?.withClaimableOwnerWork !== 1 ||
  runtimeRolesCli.next?.role?.id !== "tester" ||
  runtimeRolesCli.roles?.find((entry) => entry.role?.id === "tester")?.nextAction?.lane !== "verifier" ||
  runtimeRolesCli.roles?.find((entry) => entry.role?.id === "executor")?.counts?.ownerBlocked !== 1 ||
  runtimeRolesCli.roles?.find((entry) => entry.role?.id === "explore")?.counts?.ownerClaimed !== 1
) {
  console.error("[smoke:runtime-roles] expected CLI runtime role pressure ordering");
  process.exit(1);
}
const runtimeWorkspacePackCli = JSON.parse(
  run("runtime-workspace-pack-cli", ["./src/index.js", "runtime:workspace-pack"]).stdout
).workspacePack;
if (
  runtimeWorkspacePackCli.recommendedSurface !== "runtime:recovery" ||
  runtimeWorkspacePackCli.next?.dashboard?.swarmId !== "swarm-1" ||
  runtimeWorkspacePackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeWorkspacePackCli.next?.review?.taskId !== "task-2" ||
  runtimeWorkspacePackCli.next?.recovery?.taskId !== "task-1" ||
  runtimeWorkspacePackCli.overview?.dashboard?.blockedTasks !== 1
) {
  console.error("[smoke:runtime-workspace-pack] expected CLI workspace pack to recommend recovery");
  process.exit(1);
}
const runtimeActivityMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_activity",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeActivityMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeActivityMcpInput,
  encoding: "utf8"
});
const runtimeActivityMcpLines = runtimeActivityMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeActivityMcpPayload = JSON.parse(JSON.parse(runtimeActivityMcpLines[1]).result.content[0].text);
if (
  runtimeActivityMcp.status !== 0 ||
  runtimeActivityMcpPayload.activity?.counts?.totalEntries < 6 ||
  runtimeActivityMcpPayload.activity?.entries?.some((entry) => entry.type === "blocked" && entry.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-activity-mcp] expected MCP runtime activity");
  console.error(runtimeActivityMcp.stderr || runtimeActivityMcp.stdout);
  process.exit(1);
}
const runtimeCloseoutMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_closeout",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeCloseoutMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeCloseoutMcpInput,
  encoding: "utf8"
});
const runtimeCloseoutMcpLines = runtimeCloseoutMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeCloseoutMcpPayload = JSON.parse(JSON.parse(runtimeCloseoutMcpLines[1]).result.content[0].text);
if (
  runtimeCloseoutMcp.status !== 0 ||
  runtimeCloseoutMcpPayload.closeout?.counts?.tasksReady !== 0 ||
  runtimeCloseoutMcpPayload.closeout?.next !== null
) {
  console.error("[smoke:runtime-closeout-mcp] expected MCP runtime closeout");
  console.error(runtimeCloseoutMcp.stderr || runtimeCloseoutMcp.stdout);
  process.exit(1);
}
const runtimeCloseoutPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_closeout_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeCloseoutPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeCloseoutPackMcpInput,
  encoding: "utf8"
});
const runtimeCloseoutPackMcpLines = runtimeCloseoutPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeCloseoutPackMcpPayload = JSON.parse(JSON.parse(runtimeCloseoutPackMcpLines[1]).result.content[0].text);
if (
  runtimeCloseoutPackMcp.status !== 0 ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.recommendedSurface !== "runtime:closeout" ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.overview?.closeout?.totalReady !== 0 ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.next?.closeout !== null
) {
  console.error("[smoke:runtime-closeout-pack-mcp] expected MCP runtime closeout pack");
  console.error(runtimeCloseoutPackMcp.stderr || runtimeCloseoutPackMcp.stdout);
  process.exit(1);
}
const runtimeDashboardMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dashboard",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDashboardMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDashboardMcpInput,
  encoding: "utf8"
});
const runtimeDashboardMcpLines = runtimeDashboardMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDashboardMcpPayload = JSON.parse(JSON.parse(runtimeDashboardMcpLines[1]).result.content[0].text);
if (
  runtimeDashboardMcp.status !== 0 ||
  runtimeDashboardMcpPayload.dashboard?.counts?.blockedTasks !== 1 ||
  runtimeDashboardMcpPayload.dashboard?.counts?.pendingReview !== 1 ||
  runtimeDashboardMcpPayload.dashboard?.counts?.activeClaimed !== 1 ||
  runtimeDashboardMcpPayload.dashboard?.leader?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-dashboard-mcp] expected MCP runtime dashboard");
  console.error(runtimeDashboardMcp.stderr || runtimeDashboardMcp.stdout);
  process.exit(1);
}
const runtimeDispatchMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dispatch",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDispatchMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDispatchMcpInput,
  encoding: "utf8"
});
const runtimeDispatchMcpLines = runtimeDispatchMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDispatchMcpPayload = JSON.parse(JSON.parse(runtimeDispatchMcpLines[1]).result.content[0].text);
if (
  runtimeDispatchMcp.status !== 0 ||
  runtimeDispatchMcpPayload.dispatch?.counts?.ownerGroups !== 1 ||
  runtimeDispatchMcpPayload.dispatch?.counts?.totalAssignments !== 1 ||
  runtimeDispatchMcpPayload.dispatch?.next?.lane !== "lane-dashboard" ||
  runtimeDispatchMcpPayload.dispatch?.groups?.[0]?.owner?.id !== "executor"
) {
  console.error("[smoke:runtime-dispatch-mcp] expected MCP runtime dispatch");
  console.error(runtimeDispatchMcp.stderr || runtimeDispatchMcp.stdout);
  process.exit(1);
}
const runtimeDispatchPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dispatch_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDispatchPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDispatchPackMcpInput,
  encoding: "utf8"
});
const runtimeDispatchPackMcpLines = runtimeDispatchPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDispatchPackMcpPayload = JSON.parse(JSON.parse(runtimeDispatchPackMcpLines[1]).result.content[0].text);
if (
  runtimeDispatchPackMcp.status !== 0 ||
  runtimeDispatchPackMcpPayload.dispatchPack?.recommendedSurface !== "runtime:dispatch" ||
  runtimeDispatchPackMcpPayload.dispatchPack?.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeDispatchPackMcpPayload.dispatchPack?.next?.handoff?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-dispatch-pack-mcp] expected MCP runtime dispatch pack");
  console.error(runtimeDispatchPackMcp.stderr || runtimeDispatchPackMcp.stdout);
  process.exit(1);
}
const runtimeFocusMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_focus",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeFocusMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeFocusMcpInput,
  encoding: "utf8"
});
const runtimeFocusMcpLines = runtimeFocusMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeFocusMcpPayload = JSON.parse(JSON.parse(runtimeFocusMcpLines[1]).result.content[0].text);
if (
  runtimeFocusMcp.status !== 0 ||
  runtimeFocusMcpPayload.focus?.focus?.type !== "blocked_task" ||
  runtimeFocusMcpPayload.focus?.focus?.taskId !== "task-1" ||
  runtimeFocusMcpPayload.focus?.sources?.dispatch?.totalAssignments !== 1
) {
  console.error("[smoke:runtime-focus-mcp] expected MCP runtime focus");
  console.error(runtimeFocusMcp.stderr || runtimeFocusMcp.stdout);
  process.exit(1);
}
const runtimeQueuePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_queue_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeQueuePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeQueuePackMcpInput,
  encoding: "utf8"
});
const runtimeQueuePackMcpLines = runtimeQueuePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeQueuePackMcpPayload = JSON.parse(JSON.parse(runtimeQueuePackMcpLines[1]).result.content[0].text);
if (
  runtimeQueuePackMcp.status !== 0 ||
  runtimeQueuePackMcpPayload.queuePack?.recommendedSurface !== "leader:queue" ||
  runtimeQueuePackMcpPayload.queuePack?.next?.queue?.swarmId !== "swarm-1" ||
  runtimeQueuePackMcpPayload.queuePack?.overview?.queue?.total !== 1
) {
  console.error("[smoke:runtime-queue-pack-mcp] expected MCP runtime queue pack");
  console.error(runtimeQueuePackMcp.stderr || runtimeQueuePackMcp.stdout);
  process.exit(1);
}
const runtimeHandoffsMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_handoffs",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeHandoffsMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeHandoffsMcpInput,
  encoding: "utf8"
});
const runtimeHandoffsMcpLines = runtimeHandoffsMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeHandoffsMcpPayload = JSON.parse(JSON.parse(runtimeHandoffsMcpLines[1]).result.content[0].text);
if (
  runtimeHandoffsMcp.status !== 0 ||
  runtimeHandoffsMcpPayload.handoffs?.counts?.totalHandoffs !== 3 ||
  runtimeHandoffsMcpPayload.handoffs?.groups?.some((group) => group.actor?.id === "tester" && group.handoffs?.[0]?.taskId === "task-2") !== true ||
  runtimeHandoffsMcpPayload.handoffs?.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-1")) !== true
) {
  console.error("[smoke:runtime-handoffs-mcp] expected MCP runtime handoffs");
  console.error(runtimeHandoffsMcp.stderr || runtimeHandoffsMcp.stdout);
  process.exit(1);
}
const runtimeRecoveryMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_recovery",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeRecoveryMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRecoveryMcpInput,
  encoding: "utf8"
});
const runtimeRecoveryMcpLines = runtimeRecoveryMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRecoveryMcpPayload = JSON.parse(JSON.parse(runtimeRecoveryMcpLines[1]).result.content[0].text);
if (
  runtimeRecoveryMcp.status !== 0 ||
  runtimeRecoveryMcpPayload.recovery?.counts?.blocked !== 1 ||
  runtimeRecoveryMcpPayload.recovery?.next?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-recovery-mcp] expected MCP runtime recovery");
  console.error(runtimeRecoveryMcp.stderr || runtimeRecoveryMcp.stdout);
  process.exit(1);
}
const runtimeRecoveryPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_recovery_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeRecoveryPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRecoveryPackMcpInput,
  encoding: "utf8"
});
const runtimeRecoveryPackMcpLines = runtimeRecoveryPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRecoveryPackMcpPayload = JSON.parse(JSON.parse(runtimeRecoveryPackMcpLines[1]).result.content[0].text);
if (
  runtimeRecoveryPackMcp.status !== 0 ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.recommendedSurface !== "runtime:recovery" ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.next?.recovery?.taskId !== "task-1" ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.next?.handoff?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-recovery-pack-mcp] expected MCP runtime recovery pack");
  console.error(runtimeRecoveryPackMcp.stderr || runtimeRecoveryPackMcp.stdout);
  process.exit(1);
}
const runtimeSummaryPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_summary_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeSummaryPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSummaryPackMcpInput,
  encoding: "utf8"
});
const runtimeSummaryPackMcpLines = runtimeSummaryPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSummaryPackMcpPayload = JSON.parse(JSON.parse(runtimeSummaryPackMcpLines[1]).result.content[0].text);
if (
  runtimeSummaryPackMcp.status !== 0 ||
  runtimeSummaryPackMcpPayload.summaryPack?.recommendedSurface !== "runtime:focus" ||
  runtimeSummaryPackMcpPayload.summaryPack?.focus?.focus?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-summary-pack-mcp] expected MCP runtime summary pack");
  console.error(runtimeSummaryPackMcp.stderr || runtimeSummaryPackMcp.stdout);
  process.exit(1);
}
const runtimeLeaderPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_leader_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeLeaderPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeLeaderPackMcpInput,
  encoding: "utf8"
});
const runtimeLeaderPackMcpLines = runtimeLeaderPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeLeaderPackMcpPayload = JSON.parse(JSON.parse(runtimeLeaderPackMcpLines[1]).result.content[0].text);
if (
  runtimeLeaderPackMcp.status !== 0 ||
  runtimeLeaderPackMcpPayload.leaderPack?.recommendedSurface !== "runtime:dispatch" ||
  runtimeLeaderPackMcpPayload.leaderPack?.surfaces?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-leader-pack-mcp] expected MCP runtime leader pack");
  console.error(runtimeLeaderPackMcp.stderr || runtimeLeaderPackMcp.stdout);
  process.exit(1);
}
const runtimeOperatorPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_operator_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeOperatorPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeOperatorPackMcpInput,
  encoding: "utf8"
});
const runtimeOperatorPackMcpLines = runtimeOperatorPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeOperatorPackMcpPayload = JSON.parse(JSON.parse(runtimeOperatorPackMcpLines[1]).result.content[0].text);
if (
  runtimeOperatorPackMcp.status !== 0 ||
  runtimeOperatorPackMcpPayload.operatorPack?.recommendedSurface !== "runtime:focus" ||
  runtimeOperatorPackMcpPayload.operatorPack?.focus?.focus?.taskId !== "task-1" ||
  runtimeOperatorPackMcpPayload.operatorPack?.next?.handoff?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-operator-pack-mcp] expected MCP runtime operator pack");
  console.error(runtimeOperatorPackMcp.stderr || runtimeOperatorPackMcp.stdout);
  process.exit(1);
}
const runtimeControlPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_control_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeControlPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeControlPackMcpInput,
  encoding: "utf8"
});
const runtimeControlPackMcpLines = runtimeControlPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeControlPackMcpPayload = JSON.parse(JSON.parse(runtimeControlPackMcpLines[1]).result.content[0].text);
if (
  runtimeControlPackMcp.status !== 0 ||
  runtimeControlPackMcpPayload.controlPack?.recommendedSurface !== "runtime:summary-pack" ||
  runtimeControlPackMcpPayload.controlPack?.next?.summary?.taskId !== "task-1" ||
  runtimeControlPackMcpPayload.controlPack?.next?.leader?.dispatch?.lane !== "lane-dashboard"
) {
  console.error("[smoke:runtime-control-pack-mcp] expected MCP runtime control pack");
  console.error(runtimeControlPackMcp.stderr || runtimeControlPackMcp.stdout);
  process.exit(1);
}
const runtimeSignalPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_signal_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeSignalPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSignalPackMcpInput,
  encoding: "utf8"
});
const runtimeSignalPackMcpLines = runtimeSignalPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSignalPackMcpPayload = JSON.parse(JSON.parse(runtimeSignalPackMcpLines[1]).result.content[0].text);
if (
  runtimeSignalPackMcp.status !== 0 ||
  runtimeSignalPackMcpPayload.signalPack?.recommendedSurface !== "runtime:focus" ||
  runtimeSignalPackMcpPayload.signalPack?.next?.focus?.taskId !== "task-1" ||
  runtimeSignalPackMcpPayload.signalPack?.next?.role?.role?.id !== "tester"
) {
  console.error("[smoke:runtime-signal-pack-mcp] expected MCP runtime signal pack");
  console.error(runtimeSignalPackMcp.stderr || runtimeSignalPackMcp.stdout);
  process.exit(1);
}
const runtimeHandoffPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_handoff_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeHandoffPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeHandoffPackMcpInput,
  encoding: "utf8"
});
const runtimeHandoffPackMcpLines = runtimeHandoffPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeHandoffPackMcpPayload = JSON.parse(JSON.parse(runtimeHandoffPackMcpLines[1]).result.content[0].text);
if (
  runtimeHandoffPackMcp.status !== 0 ||
  runtimeHandoffPackMcpPayload.handoffPack?.recommendedSurface !== "runtime:handoffs" ||
  runtimeHandoffPackMcpPayload.handoffPack?.next?.handoff?.taskId !== "task-2" ||
  runtimeHandoffPackMcpPayload.handoffPack?.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-handoff-pack-mcp] expected MCP runtime handoff pack");
  console.error(runtimeHandoffPackMcp.stderr || runtimeHandoffPackMcp.stdout);
  process.exit(1);
}
const runtimeTriagePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_triage_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeTriagePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeTriagePackMcpInput,
  encoding: "utf8"
});
const runtimeTriagePackMcpLines = runtimeTriagePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeTriagePackMcpPayload = JSON.parse(JSON.parse(runtimeTriagePackMcpLines[1]).result.content[0].text);
if (
  runtimeTriagePackMcp.status !== 0 ||
  runtimeTriagePackMcpPayload.triagePack?.recommendedSurface !== "runtime:focus" ||
  runtimeTriagePackMcpPayload.triagePack?.next?.focus?.taskId !== "task-1" ||
  runtimeTriagePackMcpPayload.triagePack?.next?.review?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-triage-pack-mcp] expected MCP runtime triage pack");
  console.error(runtimeTriagePackMcp.stderr || runtimeTriagePackMcp.stdout);
  process.exit(1);
}
const runtimeSessionPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_session_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const runtimeSessionPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSessionPackMcpInput,
  encoding: "utf8"
});
const runtimeSessionPackMcpLines = runtimeSessionPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSessionPackMcpPayload = JSON.parse(JSON.parse(runtimeSessionPackMcpLines[1]).result.content[0].text);
if (
  runtimeSessionPackMcp.status !== 0 ||
  runtimeSessionPackMcpPayload.sessionPack?.recommendedSurface !== "worker:closeout" ||
  runtimeSessionPackMcpPayload.sessionPack?.next?.verifier?.review?.taskId !== "task-2" ||
  runtimeSessionPackMcpPayload.sessionPack?.next?.role?.lane !== "verifier"
) {
  console.error("[smoke:runtime-session-pack-mcp] expected MCP runtime session pack");
  console.error(runtimeSessionPackMcp.stderr || runtimeSessionPackMcp.stdout);
  process.exit(1);
}
const runtimeReviewMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_review",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeReviewMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeReviewMcpInput,
  encoding: "utf8"
});
const runtimeReviewMcpLines = runtimeReviewMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeReviewMcpPayload = JSON.parse(JSON.parse(runtimeReviewMcpLines[1]).result.content[0].text);
if (
  runtimeReviewMcp.status !== 0 ||
  runtimeReviewMcpPayload.review?.counts?.verifierGroups !== 1 ||
  runtimeReviewMcpPayload.review?.counts?.totalPendingReview !== 1 ||
  runtimeReviewMcpPayload.review?.next?.taskId !== "task-2" ||
  runtimeReviewMcpPayload.review?.groups?.[0]?.verifier?.id !== "tester"
) {
  console.error("[smoke:runtime-review-mcp] expected MCP runtime review");
  console.error(runtimeReviewMcp.stderr || runtimeReviewMcp.stdout);
  process.exit(1);
}
const runtimeReviewPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_review_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker"
      }
    }
  })
].join("\n") + "\n";
const runtimeReviewPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeReviewPackMcpInput,
  encoding: "utf8"
});
const runtimeReviewPackMcpLines = runtimeReviewPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeReviewPackMcpPayload = JSON.parse(JSON.parse(runtimeReviewPackMcpLines[1]).result.content[0].text);
if (
  runtimeReviewPackMcp.status !== 0 ||
  runtimeReviewPackMcpPayload.reviewPack?.recommendedSurface !== "runtime:verifier-pack" ||
  runtimeReviewPackMcpPayload.reviewPack?.next?.review?.taskId !== "task-2" ||
  runtimeReviewPackMcpPayload.reviewPack?.next?.verifier?.decision?.id !== "task-2"
) {
  console.error("[smoke:runtime-review-pack-mcp] expected MCP runtime review pack");
  console.error(runtimeReviewPackMcp.stderr || runtimeReviewPackMcp.stdout);
  process.exit(1);
}
const runtimeAlertsMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_alerts",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeAlertsMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeAlertsMcpInput,
  encoding: "utf8"
});
const runtimeAlertsMcpLines = runtimeAlertsMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeAlertsMcpPayload = JSON.parse(JSON.parse(runtimeAlertsMcpLines[1]).result.content[0].text);
if (
  runtimeAlertsMcp.status !== 0 ||
  runtimeAlertsMcpPayload.alerts?.counts?.high !== 1 ||
  runtimeAlertsMcpPayload.alerts?.alerts?.[0]?.kind !== "blocked_task"
) {
  console.error("[smoke:runtime-alerts-mcp] expected MCP runtime alerts");
  console.error(runtimeAlertsMcp.stderr || runtimeAlertsMcp.stdout);
  process.exit(1);
}
const runtimeRolesMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_roles",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeRolesMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRolesMcpInput,
  encoding: "utf8"
});
const runtimeRolesMcpLines = runtimeRolesMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRolesMcpPayload = JSON.parse(JSON.parse(runtimeRolesMcpLines[1]).result.content[0].text);
if (
  runtimeRolesMcp.status !== 0 ||
  runtimeRolesMcpPayload.roles?.counts?.withPendingReview !== 1 ||
  runtimeRolesMcpPayload.roles?.next?.role?.id !== "tester" ||
  runtimeRolesMcpPayload.roles?.roles?.find((entry) => entry.role?.id === "executor")?.counts?.ownerBlocked !== 1
) {
  console.error("[smoke:runtime-roles-mcp] expected MCP runtime role queue");
  console.error(runtimeRolesMcp.stderr || runtimeRolesMcp.stdout);
  process.exit(1);
}
const runtimeWorkspacePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_workspace_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeWorkspacePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeWorkspacePackMcpInput,
  encoding: "utf8"
});
const runtimeWorkspacePackMcpLines = runtimeWorkspacePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeWorkspacePackMcpPayload = JSON.parse(JSON.parse(runtimeWorkspacePackMcpLines[1]).result.content[0].text);
if (
  runtimeWorkspacePackMcp.status !== 0 ||
  runtimeWorkspacePackMcpPayload.workspacePack?.recommendedSurface !== "runtime:recovery" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.next?.review?.taskId !== "task-2" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-workspace-pack-mcp] expected MCP runtime workspace pack");
  console.error(runtimeWorkspacePackMcp.stderr || runtimeWorkspacePackMcp.stdout);
  process.exit(1);
}

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
      name: "swarm_brief",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "swarm_check",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "swarm_queue_tasks",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "swarm_dispatch",
      arguments: { id: "swarm-1", claimedBy: "mcp-worker", owner: "executor" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "task_ready_for_review",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "task_done",
      arguments: { id: "task-1", reviewedBy: "tester", reviewEvidence: ["mcp verifier approved"] }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "swarm_sync",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "swarm_overview",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "swarm_bundle",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: {
      name: "swarm_closeout",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: {
      name: "task_list",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 14,
    method: "tools/call",
    params: {
      name: "swarm_list",
      arguments: { detailed: true }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 15,
    method: "tools/call",
    params: {
      name: "leader_workspace",
      arguments: {}
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
const swarmBriefResult = swarmMcpLines.length >= 3 ? JSON.parse(swarmMcpLines[2]) : null;
const swarmBriefText = swarmBriefResult?.result?.content?.[0]?.text;
const swarmBriefPayload = swarmBriefText ? JSON.parse(swarmBriefText) : null;
const swarmCheckResult = swarmMcpLines.length >= 4 ? JSON.parse(swarmMcpLines[3]) : null;
const swarmCheckText = swarmCheckResult?.result?.content?.[0]?.text;
const swarmCheckPayload = swarmCheckText ? JSON.parse(swarmCheckText) : null;
const swarmOverviewResult = swarmMcpLines.length >= 10 ? JSON.parse(swarmMcpLines[9]) : null;
const swarmOverviewText = swarmOverviewResult?.result?.content?.[0]?.text;
const swarmOverviewPayload = swarmOverviewText ? JSON.parse(swarmOverviewText) : null;
const swarmBundleResult = swarmMcpLines.length >= 11 ? JSON.parse(swarmMcpLines[10]) : null;
const swarmBundleText = swarmBundleResult?.result?.content?.[0]?.text;
const swarmBundlePayload = swarmBundleText ? JSON.parse(swarmBundleText) : null;
const swarmCloseoutResult = swarmMcpLines.length >= 12 ? JSON.parse(swarmMcpLines[11]) : null;
const swarmCloseoutText = swarmCloseoutResult?.result?.content?.[0]?.text;
const swarmCloseoutPayload = swarmCloseoutText ? JSON.parse(swarmCloseoutText) : null;
const swarmTaskListResult = swarmMcpLines.length >= 13 ? JSON.parse(swarmMcpLines[12]) : null;
const swarmTaskListText = swarmTaskListResult?.result?.content?.[0]?.text;
const swarmTaskListPayload = swarmTaskListText ? JSON.parse(swarmTaskListText) : null;
const swarmListDetailedResult = swarmMcpLines.length >= 14 ? JSON.parse(swarmMcpLines[13]) : null;
const swarmListDetailedText = swarmListDetailedResult?.result?.content?.[0]?.text;
const swarmListDetailedPayload = swarmListDetailedText ? JSON.parse(swarmListDetailedText) : null;
const leaderWorkspaceResult = swarmMcpLines.length >= 15 ? JSON.parse(swarmMcpLines[14]) : null;
const leaderWorkspaceText = leaderWorkspaceResult?.result?.content?.[0]?.text;
const leaderWorkspacePayload = leaderWorkspaceText ? JSON.parse(leaderWorkspaceText) : null;
const mcpSwarmTask = swarmTaskListPayload?.tasks?.find((task) => task.swarmId === "swarm-1" && task.claimedBy === "mcp-worker");
if (
  swarmMcp.status !== 0 ||
  swarmBriefPayload?.brief?.recommendedNextAction !== "queue_swarm_lanes" ||
  swarmCheckPayload?.validation?.ready !== true ||
  !mcpSwarmTask ||
  mcpSwarmTask.reviewedBy !== "tester" ||
  mcpSwarmTask.reviewOutcome !== "approved" ||
  swarmBundlePayload?.bundle?.lanes?.[0]?.report?.task?.id !== "task-1" ||
  swarmCloseoutPayload?.closeout?.command !== "node ./src/index.js swarm:done --id swarm-1" ||
  leaderWorkspacePayload?.workspace?.focus?.swarmId !== "swarm-1" ||
  leaderWorkspacePayload?.workspace?.focus?.bundle?.swarm?.id !== "swarm-1" ||
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
      name: "runtime_catalog",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "runtime_status",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
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
    id: 5,
    method: "tools/call",
    params: {
      name: "task_get",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "task_brief",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "task_check",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "task_claim",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "task_ready_for_review",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "task_reject",
      arguments: {
        id: "task-1",
        reviewedBy: "tester",
        nextQueueStatus: "released",
        notes: "needs another MCP pass"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "task_claim",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: {
      name: "task_ready_for_review",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: {
      name: "task_approve",
      arguments: {
        id: "task-1",
        reviewedBy: "tester",
        reviewEvidence: ["mcp reviewer approval"]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 14,
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
const taskCatalogResult = taskAddMcpLines.length >= 2 ? JSON.parse(taskAddMcpLines[1]) : null;
const taskCatalogText = taskCatalogResult?.result?.content?.[0]?.text;
const taskCatalogPayload = taskCatalogText ? JSON.parse(taskCatalogText) : null;
const taskStatusResult = taskAddMcpLines.length >= 3 ? JSON.parse(taskAddMcpLines[2]) : null;
const taskStatusText = taskStatusResult?.result?.content?.[0]?.text;
const taskStatusPayload = taskStatusText ? JSON.parse(taskStatusText) : null;
const taskGetResult = taskAddMcpLines.length >= 5 ? JSON.parse(taskAddMcpLines[4]) : null;
const taskGetText = taskGetResult?.result?.content?.[0]?.text;
const taskGetPayload = taskGetText ? JSON.parse(taskGetText) : null;
const taskBriefResult = taskAddMcpLines.length >= 6 ? JSON.parse(taskAddMcpLines[5]) : null;
const taskBriefText = taskBriefResult?.result?.content?.[0]?.text;
const taskBriefPayload = taskBriefText ? JSON.parse(taskBriefText) : null;
const taskHistoryMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_history",
      arguments: { id: "task-1" }
    }
  })
].join("\n") + "\n";
const taskCheckResult = taskAddMcpLines.length >= 7 ? JSON.parse(taskAddMcpLines[6]) : null;
const taskCheckText = taskCheckResult?.result?.content?.[0]?.text;
const taskCheckPayload = taskCheckText ? JSON.parse(taskCheckText) : null;
const taskRejectResult = taskAddMcpLines.length >= 10 ? JSON.parse(taskAddMcpLines[9]) : null;
const taskRejectText = taskRejectResult?.result?.content?.[0]?.text;
const taskRejectPayload = taskRejectText ? JSON.parse(taskRejectText) : null;
const taskListResult = taskAddMcpLines.length >= 14 ? JSON.parse(taskAddMcpLines[13]) : null;
const taskListText = taskListResult?.result?.content?.[0]?.text;
const taskListPayload = taskListText ? JSON.parse(taskListText) : null;
const mcpTask = taskListPayload?.tasks?.find((task) => task.title === "mcp metadata task");
const taskHistoryMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskHistoryMcpInput,
  encoding: "utf8"
});
const taskHistoryMcpLines = taskHistoryMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskHistoryMcpPayload = JSON.parse(JSON.parse(taskHistoryMcpLines[1]).result.content[0].text);
const taskAnnotateMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_annotate",
      arguments: {
        id: "task-1",
        actor: "tester",
        kind: "review-note",
        content: "reviewed through MCP flow"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "task_brief",
      arguments: { id: "task-1" }
    }
  })
].join("\n") + "\n";
const taskAnnotateMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskAnnotateMcpInput,
  encoding: "utf8"
});
const taskAnnotateMcpLines = taskAnnotateMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskAnnotateMcpBrief = JSON.parse(JSON.parse(taskAnnotateMcpLines[2]).result.content[0].text);
const taskReportMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_report",
      arguments: { id: "task-1" }
    }
  })
].join("\n") + "\n";
const taskReportMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskReportMcpInput,
  encoding: "utf8"
});
const taskReportMcpLines = taskReportMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskReportMcpPayload = JSON.parse(JSON.parse(taskReportMcpLines[1]).result.content[0].text);
if (
  taskAddMcp.status !== 0 ||
  !taskCatalogPayload?.catalog?.agents?.some((agent) => agent.id === "tester") ||
  taskStatusPayload?.status?.counts?.agents !== 4 ||
  taskGetPayload?.task?.id !== "task-1" ||
  taskBriefPayload?.brief?.roles?.owner?.promptPath !== ".codex/agents/executor.md" ||
  taskHistoryMcp.status !== 0 ||
  taskHistoryMcpPayload.history?.history?.at(-1)?.type !== "approved" ||
  taskAnnotateMcp.status !== 0 ||
  taskAnnotateMcpBrief.brief?.annotations?.entries?.at(-1)?.content !== "reviewed through MCP flow" ||
  taskReportMcp.status !== 0 ||
  taskReportMcpPayload.report?.closure?.reviewOutcome !== "approved" ||
  !mcpTask ||
  mcpTask.verifier !== "tester" ||
  taskCheckPayload?.validation?.ready !== true ||
  taskRejectPayload?.rejected?.queueStatus !== "released" ||
  mcpTask.reviewedBy !== "tester" ||
  mcpTask.reviewOutcome !== "approved"
) {
  console.error("[smoke:task-add-mcp] expected persisted MCP metadata");
  console.error(taskAddMcp.stderr || taskAddMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("inbox-task-add-1", [
  "./src/index.js",
  "task:add",
  "--title",
  "claimable task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "claim later",
  "--verification",
  "inbox ranks claimable"
]);
run("inbox-task-add-2", [
  "./src/index.js",
  "task:add",
  "--title",
  "review task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/mcp.js",
  "--acceptance",
  "review later",
  "--verification",
  "inbox ranks review"
]);
run("inbox-task-claim-2", ["./src/index.js", "task:claim", "--id", "task-2", "--by", "worker-review"]);
run("inbox-task-ready-2", ["./src/index.js", "task:review", "--id", "task-2", "--by", "worker-review"]);
const cliInbox = JSON.parse(
  run("task-inbox-cli", ["./src/index.js", "task:inbox", "--role", "tester", "--worker", "tester-worker"]).stdout
).inbox;
if (cliInbox.tasks?.[0]?.id !== "task-2" || cliInbox.tasks?.[0]?.relation !== "verifier_review") {
  console.error("[smoke:task-inbox] expected verifier review task to rank first");
  process.exit(1);
}
const cliNext = JSON.parse(
  run("task-next-cli", ["./src/index.js", "task:next", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).next;
if (cliNext.candidate?.id !== "task-2" || cliNext.brief?.recommendedNextAction !== "review_and_decide") {
  console.error("[smoke:task-next] expected verifier next task to include execution brief");
  process.exit(1);
}
const verifierSession = JSON.parse(
  run("worker-session-verifier", ["./src/index.js", "worker:session", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).session;
if (
  verifierSession.counts.reviewQueue !== 1 ||
  verifierSession.focus?.kind !== "review_task" ||
  verifierSession.reviewQueue?.[0]?.summary?.id !== "task-2"
) {
  console.error("[smoke:worker-session] expected verifier session review focus");
  process.exit(1);
}
const verifierHandoff = JSON.parse(
  run("worker-handoff-verifier", ["./src/index.js", "worker:handoff", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).handoff;
if (
  verifierHandoff.focus?.kind !== "review_task" ||
  verifierHandoff.currentTask?.id !== "task-2" ||
  verifierHandoff.summary?.includes("verifier") !== true
) {
  console.error("[smoke:worker-handoff] expected verifier handoff package");
  process.exit(1);
}
const verifierCloseout = JSON.parse(
  run("worker-closeout-verifier", ["./src/index.js", "worker:closeout", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).closeout;
if (
  verifierCloseout.focus?.kind !== "review_task" ||
  verifierCloseout.command !== "node ./src/index.js task:approve --id task-2 --by tester" ||
  verifierCloseout.report?.task?.id !== "task-2"
) {
  console.error("[smoke:worker-closeout] expected verifier closeout bundle");
  process.exit(1);
}
const verifierWorkerPack = JSON.parse(
  run("runtime-worker-pack-verifier", ["./src/index.js", "runtime:worker-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).workerPack;
if (
  verifierWorkerPack.recommendedSurface !== "worker:closeout" ||
  verifierWorkerPack.next?.focus?.kind !== "review_task" ||
  verifierWorkerPack.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-worker-pack] expected verifier worker pack");
  process.exit(1);
}
const verifierPackCli = JSON.parse(
  run("runtime-verifier-pack-cli", ["./src/index.js", "runtime:verifier-pack", "--role", "tester", "--worker", "tester-worker"]).stdout
).verifierPack;
if (
  verifierPackCli.kind !== "runtime_verifier_pack" ||
  verifierPackCli.recommendedSurface !== "worker:closeout" ||
  verifierPackCli.next?.decision?.id !== "task-2" ||
  verifierPackCli.surfaces?.review?.counts?.totalPendingReview !== 1 ||
  verifierPackCli.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-verifier-pack] expected CLI verifier pack");
  process.exit(1);
}
const verifierBundleCli = JSON.parse(
  run("verifier-bundle-cli", ["./src/index.js", "verifier:bundle", "--role", "tester", "--worker", "tester-worker"]).stdout
).bundle;
if (
  verifierBundleCli.currentTask?.id !== "task-2" ||
  verifierBundleCli.report?.task?.id !== "task-2" ||
  verifierBundleCli.commands?.approve !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:verifier-bundle] expected CLI verifier decision bundle");
  process.exit(1);
}
const ownerPickupClaim = JSON.parse(
  run("task-pickup-claim", ["./src/index.js", "task:pickup", "--role", "executor", "--worker", "worker-owner", "--mode", "owner"]).stdout
).pickup;
if (
  ownerPickupClaim.outcome !== "claimed" ||
  ownerPickupClaim.task?.id !== "task-1" ||
  ownerPickupClaim.task?.claimedBy !== "worker-owner" ||
  ownerPickupClaim.brief?.task?.queueStatus !== "claimed"
) {
  console.error("[smoke:task-pickup] expected claimable task to auto-claim for owner");
  process.exit(1);
}
const inboxMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_inbox",
      arguments: { role: "tester", workerId: "tester-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "task_next",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const inboxMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: inboxMcpInput,
  encoding: "utf8"
});
const inboxMcpLines = inboxMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const inboxMcpPayload = JSON.parse(JSON.parse(inboxMcpLines[1]).result.content[0].text);
const nextMcpPayload = JSON.parse(JSON.parse(inboxMcpLines[2]).result.content[0].text);
if (
  inboxMcp.status !== 0 ||
  inboxMcpPayload.inbox?.tasks?.[0]?.id !== "task-2" ||
  nextMcpPayload.next?.candidate?.id !== "task-2" ||
  nextMcpPayload.next?.brief?.roles?.verifier?.promptPath !== ".codex/agents/tester.md"
) {
  console.error("[smoke:task-inbox-mcp] expected inbox and next-task MCP surfaces");
  console.error(inboxMcp.stderr || inboxMcp.stdout);
  process.exit(1);
}
const pickupMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_pickup",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const pickupMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: pickupMcpInput,
  encoding: "utf8"
});
const pickupMcpLines = pickupMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const pickupMcpPayload = JSON.parse(JSON.parse(pickupMcpLines[1]).result.content[0].text);
if (
  pickupMcp.status !== 0 ||
  pickupMcpPayload.pickup?.outcome !== "review" ||
  pickupMcpPayload.pickup?.candidate?.id !== "task-2" ||
  pickupMcpPayload.pickup?.command !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:task-pickup-mcp] expected review pickup payload");
  console.error(pickupMcp.stderr || pickupMcp.stdout);
  process.exit(1);
}
const workerSessionMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "worker_session",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const workerSessionMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerSessionMcpInput,
  encoding: "utf8"
});
const workerSessionMcpLines = workerSessionMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerSessionMcpPayload = JSON.parse(JSON.parse(workerSessionMcpLines[1]).result.content[0].text);
if (
  workerSessionMcp.status !== 0 ||
  workerSessionMcpPayload.session?.focus?.kind !== "review_task" ||
  workerSessionMcpPayload.session?.reviewQueue?.[0]?.summary?.id !== "task-2"
) {
  console.error("[smoke:worker-session-mcp] expected review-focused worker session");
  console.error(workerSessionMcp.stderr || workerSessionMcp.stdout);
  process.exit(1);
}
const workerHandoffMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "worker_handoff",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const workerHandoffMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerHandoffMcpInput,
  encoding: "utf8"
});
const workerHandoffMcpLines = workerHandoffMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerHandoffMcpPayload = JSON.parse(JSON.parse(workerHandoffMcpLines[1]).result.content[0].text);
if (
  workerHandoffMcp.status !== 0 ||
  workerHandoffMcpPayload.handoff?.focus?.kind !== "review_task" ||
  workerHandoffMcpPayload.handoff?.currentTask?.id !== "task-2"
) {
  console.error("[smoke:worker-handoff-mcp] expected verifier handoff payload");
  console.error(workerHandoffMcp.stderr || workerHandoffMcp.stdout);
  process.exit(1);
}
const workerCloseoutMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "worker_closeout",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const workerCloseoutMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerCloseoutMcpInput,
  encoding: "utf8"
});
const workerCloseoutMcpLines = workerCloseoutMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerCloseoutMcpPayload = JSON.parse(JSON.parse(workerCloseoutMcpLines[1]).result.content[0].text);
if (
  workerCloseoutMcp.status !== 0 ||
  workerCloseoutMcpPayload.closeout?.focus?.kind !== "review_task" ||
  workerCloseoutMcpPayload.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:worker-closeout-mcp] expected verifier closeout bundle");
  console.error(workerCloseoutMcp.stderr || workerCloseoutMcp.stdout);
  process.exit(1);
}
const verifierBundleMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "verifier_bundle",
      arguments: { role: "tester", workerId: "tester-worker" }
    }
  })
].join("\n") + "\n";
const verifierBundleMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: verifierBundleMcpInput,
  encoding: "utf8"
});
const verifierBundleMcpLines = verifierBundleMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const verifierBundleMcpPayload = JSON.parse(JSON.parse(verifierBundleMcpLines[1]).result.content[0].text);
if (
  verifierBundleMcp.status !== 0 ||
  verifierBundleMcpPayload.bundle?.currentTask?.id !== "task-2" ||
  verifierBundleMcpPayload.bundle?.commands?.approve !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:verifier-bundle-mcp] expected MCP verifier decision bundle");
  console.error(verifierBundleMcp.stderr || verifierBundleMcp.stdout);
  process.exit(1);
}
const workerPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_worker_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const workerPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerPackMcpInput,
  encoding: "utf8"
});
const workerPackMcpLines = workerPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerPackMcpPayload = JSON.parse(JSON.parse(workerPackMcpLines[1]).result.content[0].text);
if (
  workerPackMcp.status !== 0 ||
  workerPackMcpPayload.workerPack?.recommendedSurface !== "worker:closeout" ||
  workerPackMcpPayload.workerPack?.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-worker-pack-mcp] expected MCP worker pack");
  console.error(workerPackMcp.stderr || workerPackMcp.stdout);
  process.exit(1);
}
const verifierPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_verifier_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker"
      }
    }
  })
].join("\n") + "\n";
const verifierPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: verifierPackMcpInput,
  encoding: "utf8"
});
const verifierPackMcpLines = verifierPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const verifierPackMcpPayload = JSON.parse(JSON.parse(verifierPackMcpLines[1]).result.content[0].text);
if (
  verifierPackMcp.status !== 0 ||
  verifierPackMcpPayload.verifierPack?.recommendedSurface !== "worker:closeout" ||
  verifierPackMcpPayload.verifierPack?.next?.decision?.id !== "task-2" ||
  verifierPackMcpPayload.verifierPack?.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-verifier-pack-mcp] expected MCP verifier pack");
  console.error(verifierPackMcp.stderr || verifierPackMcp.stdout);
  process.exit(1);
}
const inboxHistory = JSON.parse(
  run("task-history-inbox", ["./src/index.js", "task:history", "--id", "task-2"]).stdout
).history;
if (
  inboxHistory.history?.map((entry) => entry.type).join(",") !== "created,claimed,ready_for_review"
) {
  console.error("[smoke:task-history] expected inbox review task history");
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
