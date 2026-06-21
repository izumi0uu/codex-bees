import { PRODUCT_NAME } from "./metadata.js";
import { getMcpCommandCatalog } from "./mcp.js";

const INIT_COMMAND_OPTIONS = [
  { option: "--preview", description: "Show the exact init file plan without writing anything" },
  { option: "--force", description: "Overwrite shipped .codex asset files that already exist" },
  { option: "--dir <path>", description: "Materialize assets into a target directory instead of cwd" },
  { option: "--target <path>", description: "Alias for --dir" },
  { option: "--help", description: "Show init subcommand help" }
];

export function getInitCommandCatalog() {
  return INIT_COMMAND_OPTIONS.map((entry) => ({ ...entry }));
}

export function getCommandCatalog() {
  return [
    { command: "run", description: "Start the local Codex runtime shell contract" },
    { command: "init", description: "Materialize the shipped .codex runtime assets into the current project", options: getInitCommandCatalog() },
    { command: "mcp", description: "Start the local Codex MCP stdio runtime or inspect its subcommands", options: getMcpCommandCatalog() },
    { command: "tools", description: "Print the current MCP tool catalog" },
    { command: "catalog", description: "Print the shipped local agent and skill catalog" },
    { command: "doctor", description: "Print runtime contract diagnostics" },
    { command: "metadata", description: "Print package identity metadata" },
    { command: "status", description: "Print runtime state and surface summary" },
    { command: "capabilities", description: "Print the shipped runtime capability inventory" },
    { command: "runtime:alerts", description: "Build the top-level orchestration alert stream" },
    { command: "runtime:activity", description: "Build the recent runtime activity stream" },
    { command: "runtime:assignment-pack", description: "Build the leader-to-worker assignment package" },
    { command: "runtime:dashboard", description: "Build the top-level orchestration dashboard" },
    { command: "runtime:closeout", description: "Build the final closeout workspace" },
    { command: "runtime:closeout-pack", description: "Build the closeout-oriented runtime package" },
    { command: "runtime:control-pack", description: "Build the automation/control runtime package" },
    { command: "runtime:dispatch", description: "Build the owner-grouped dispatch workspace" },
    { command: "runtime:dispatch-pack", description: "Build the dispatch-oriented runtime package" },
    { command: "runtime:execution-pack", description: "Build the execution-oriented runtime package" },
    { command: "runtime:focus", description: "Build the single next-action runtime focus" },
    { command: "runtime:handoff-pack", description: "Build the handoff-oriented runtime package" },
    { command: "runtime:handoffs", description: "Build the next-actor handoff workspace" },
    { command: "runtime:leader-pack", description: "Build the leader-oriented runtime package" },
    { command: "runtime:operator-pack", description: "Build the operator-oriented runtime package" },
    { command: "runtime:owner-pack", description: "Build the owner-oriented runtime package" },
    { command: "runtime:pickup-pack", description: "Build the start-work pickup package for one worker" },
    { command: "runtime:queue-pack", description: "Build the queue-oriented runtime package with launch-first recommendations" },
    { command: "runtime:recovery-pack", description: "Build the recovery-oriented runtime package" },
    { command: "runtime:recovery", description: "Build the recovery-oriented task workspace" },
    { command: "runtime:role-pack", description: "Build the role-oriented runtime package" },
    { command: "runtime:review-pack", description: "Build the review-oriented runtime package" },
    { command: "runtime:session-pack", description: "Build the per-worker runtime session package" },
    { command: "runtime:signal-pack", description: "Build the signal-oriented runtime package" },
    { command: "runtime:summary-pack", description: "Build the automation-first summary package with compact launch context" },
    { command: "runtime:triage-pack", description: "Build the triage-oriented runtime package" },
    { command: "runtime:verifier-pack", description: "Build the verifier-oriented runtime package" },
    { command: "runtime:workspace-pack", description: "Build the orchestration workspace package" },
    { command: "runtime:worker-pack", description: "Build the worker-oriented runtime package" },
    { command: "runtime:review", description: "Build the verifier-grouped review workspace" },
    { command: "runtime:roles", description: "Build the role-level orchestration queue view" },
    { command: "plan", description: "Generate a bounded read-only execution plan" },
    { command: "plan:queue", description: "Generate a plan and queue its lanes as local tasks" },
    { command: "plan:swarm", description: "Generate a bounded swarm contract from a task brief" },
    { command: "task:list", description: "List local coordination tasks" },
    { command: "task:add", description: "Add a local coordination task" },
    { command: "task:get", description: "Show one local coordination task" },
    { command: "task:history", description: "Show structured handoff history for one task" },
    { command: "task:annotate", description: "Add a persistent handoff note to one task" },
    { command: "task:report", description: "Build a delivery-ready report for one task" },
    { command: "task:brief", description: "Render an execution brief for one task" },
    { command: "task:inbox", description: "List role-relevant tasks in execution priority order" },
    { command: "task:next", description: "Resolve the next task a role should pick up" },
    { command: "task:assignment-preview", description: "Preview the next leader-assigned task for one worker" },
    { command: "task:assignment-pickup", description: "Claim or resume the next leader-assigned task for one worker" },
    { command: "task:pickup-preview", description: "Preview what the next pickup would do for one worker" },
    { command: "task:pickup", description: "Claim or resume the next task for one worker" },
    { command: "worker:session", description: "Show the current execution workspace for one worker" },
    { command: "worker:handoff", description: "Build a return-ready handoff package for one worker" },
    { command: "worker:closeout", description: "Build a closure-oriented bundle for one worker" },
    { command: "verifier:bundle", description: "Build a decision-ready bundle for one verifier" },
    { command: "leader:assignment-dispatch", description: "Build a worker-targeted dispatch package for one leader assignment" },
    { command: "leader:assignment-dispatch-bundle", description: "Build a multi-worker launch bundle across owner groups" },
    { command: "leader:assignment-launch-plan", description: "Build a step-by-step startup plan across worker launches" },
    { command: "leader:assignment-dispatch-pack", description: "Build worker-targeted dispatch packages across owner groups" },
    { command: "leader:assignments", description: "Build owner-grouped dispatch assignments across swarms" },
    { command: "leader:queue", description: "Build a prioritized leader decision queue across swarms" },
    { command: "leader:workspace", description: "Build a leader-ready orchestration workspace across swarms" },
    { command: "task:claim", description: "Claim a local coordination task" },
    { command: "task:block", description: "Mark a claimed task as blocked" },
    { command: "task:review", description: "Mark a task as ready for review" },
    { command: "task:approve", description: "Approve a ready-for-review task as its verifier" },
    { command: "task:reject", description: "Return a ready-for-review task for more work" },
    { command: "task:done", description: "Approve a ready-for-review task as its verifier" },
    { command: "task:release", description: "Release a local coordination task" },
    { command: "task:update", description: "Update a local coordination task" },
    { command: "task:check", description: "Validate one local coordination task for bounded execution" },
    { command: "swarm:init", description: "Create a bounded local swarm contract" },
    { command: "swarm:list", description: "List local swarm contracts" },
    { command: "swarm:get", description: "Show one local swarm contract" },
    { command: "swarm:brief", description: "Render an execution brief for one swarm" },
    { command: "swarm:bundle", description: "Build a leader-ready orchestration bundle for one swarm" },
    { command: "swarm:blockers", description: "Build a blocker-oriented bundle for one swarm" },
    { command: "swarm:closeout", description: "Build a closure-oriented bundle for one swarm" },
    { command: "swarm:dispatch-bundle", description: "Build a dispatch-oriented bundle for one swarm" },
    { command: "swarm:update", description: "Update a local swarm contract" },
    { command: "swarm:check", description: "Validate one swarm contract for lane readiness" },
    { command: "swarm:start", description: "Mark a planned swarm active" },
    { command: "swarm:block", description: "Mark an active swarm blocked" },
    { command: "swarm:done", description: "Mark a swarm complete" },
    { command: "swarm:cancel", description: "Cancel a swarm" },
    { command: "swarm:queue", description: "Queue swarm lanes into local tasks" },
    { command: "memory:store", description: "Store a persistent local memory" },
    { command: "memory:list", description: "List persistent local memories" },
    { command: "memory:search", description: "Search persistent local memories" },
    { command: "--help", description: "Show help" },
    { command: "--version", description: "Show version" }
  ];
}

export function getCommandCatalogView() {
  const commands = getCommandCatalog();
  return {
    kind: "command_catalog_view",
    recommendedReason: commands.length > 0 ? "command_catalog_loaded" : "command_catalog_empty",
    counts: {
      totalCommands: commands.length
    },
    commands
  };
}

export function renderHelpText() {
  const lines = [`${PRODUCT_NAME}`, "", "Usage:"];
  for (const entry of getCommandCatalog()) {
    lines.push(`  ${PRODUCT_NAME} ${entry.command.padEnd(15)} ${entry.description}`);
  }
  return lines.join("\n") + "\n";
}

export function renderInitHelpText() {
  return [
    `${PRODUCT_NAME} init`,
    "",
    "Usage:",
    `  ${PRODUCT_NAME} init [--preview] [--force] [--dir <path>]`,
    "",
    "Options:",
    ...getInitCommandCatalog().map((entry) => `  ${entry.option.padEnd(15)} ${entry.description}`)
  ].join("\n") + "\n";
}
