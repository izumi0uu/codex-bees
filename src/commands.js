import { PRODUCT_NAME } from "./metadata.js";
import {
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  renderMcpHelpText
} from "./mcp.js";

export {
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  renderMcpHelpText
};

const INIT_COMMAND_OPTIONS = [
  { option: "--preview", description: "Show the exact init file plan without writing anything" },
  { option: "--force", description: "Overwrite shipped .codex asset files that already exist" },
  { option: "--dir <path>", description: "Materialize assets into a target directory instead of cwd" },
  { option: "--target <path>", description: "Alias for --dir" },
  { option: "--help", description: "Show init subcommand help" }
];

const COMMAND_ALIASES = {
  help: "--help",
  version: "--version"
};

const option = (flag, description) => ({ option: flag, description });
const commandUsage = (command, suffix = "") => `${PRODUCT_NAME} ${command}${suffix ? ` ${suffix}` : ""}`;

const COMMAND_NAME_OPTION = option("--name <command>", "Command id from the shipped CLI catalog");
const INIT_OPTION_NAME_OPTION = option("--option <option>", "Init option name from the shipped init option catalog");
const MCP_OPTION_NAME_OPTION = option("--option <option>", "MCP option name from the shipped MCP option catalog");
const TOOL_NAME_OPTION = option("--name <tool>", "Tool name from the shipped MCP tool catalog");
const AGENT_ID_OPTION = option("--id <agent-id>", "Agent id from the shipped local agent catalog");
const SKILL_ID_OPTION = option("--id <skill-id>", "Skill id from the shipped local skill catalog");
const CAPABILITY_ID_OPTION = option("--id <capability-id>", "Capability id from the shipped runtime capability inventory");
const ROLE_OPTION = option("--role <role>", "Role id to scope the view or action to");
const OWNER_OPTION = option("--owner <owner>", "Owner role to filter, assign, or reconcile against");
const WORKER_OPTION = option("--worker <worker-id>", "Worker id to bind the view or action to");
const WORKERS_OPTION = option("--workers <json>", "JSON array of worker ids for concrete launch commands");
const MODE_OPTION = option("--mode <mode>", "Execution mode label to carry into the generated runtime surface");
const STATUS_OPTION = option("--status <status>", "Status filter or next queue status override");
const TOPOLOGY_OPTION = option("--topology <topology>", "Swarm topology filter or topology override");
const LIMIT_OPTION = option("--limit <number>", "Maximum number of entries to include");
const TASK_ID_OPTION = option("--task <task-id>", "Task id to target or preselect");
const TASK_RECORD_ID_OPTION = option("--id <task-id>", "Task id from the local coordination task store");
const SWARM_ID_OPTION = option("--id <swarm-id>", "Swarm id from the local swarm store");
const MEMORY_ID_OPTION = option("--id <memory-id>", "Memory id from the local memory store");
const ACTOR_OPTION = option("--by <actor>", "Worker or reviewer id performing the lifecycle mutation");
const NOTES_OPTION = option("--notes <text>", "Free-form note stored with the resulting mutation");
const REVIEW_EVIDENCE_OPTION = option("--evidence <item|item>", "Pipe-delimited review evidence entries");
const OBJECTIVE_OPTION = option("--objective <text>", "Objective text for the generated task or swarm");
const TITLE_OPTION = option("--title <title>", "Human-readable title for the created or updated record");
const VERIFIER_OPTION = option("--verifier <role>", "Verifier role for review and approval");
const LANE_OPTION = option("--lane <lane>", "Lane id inside the parent swarm contract");
const SWARM_LINK_OPTION = option("--swarm-id <swarm-id>", "Link the task to an existing swarm");
const SCOPE_OPTION = option("--scope <path,path>", "Comma-delimited scope paths; repeat the flag to append more");
const ACCEPTANCE_OPTION = option("--acceptance <item|item>", "Pipe-delimited acceptance criteria entries");
const VERIFICATION_OPTION = option("--verification <item|item>", "Pipe-delimited verification command or inspection entries");
const KIND_OPTION = option("--kind <kind>", "Structured note kind for the task annotation");
const CONTENT_OPTION = option("--content <text>", "Content payload to store with the mutation or memory");
const MAX_WORKERS_OPTION = option("--max-workers <number>", "Maximum worker count for the swarm topology");
const LANE_SOURCE_OPTION = option("--lane-source <source>", "Source label describing how the swarm lanes were derived");
const LANES_OPTION = option("--lanes <json>", "JSON array of lane contracts");
const QUERY_OPTION = option("--query <text>", "Search query text");
const NAMESPACE_OPTION = option("--namespace <namespace>", "Namespace filter or value for stored memories");
const KIND_FILTER_OPTION = option("--kind <kind>", "Kind filter or value for stored memories");
const AGENT_FILTER_OPTION = option("--agent <agent>", "Agent filter or value for stored memories");
const TAGS_OPTION = option("--tags <tag,tag>", "Comma-delimited tags; repeat the flag to append more");
const DETAILED_OPTION = option("--detailed", "Include nested lane and task detail in swarm list output");
const PREVIEW_OPTION = option("--preview", "Show the exact init file plan without writing anything");
const FORCE_OPTION = option("--force", "Overwrite shipped .codex assets that already exist");
const DIR_OPTION = option("--dir <path>", "Materialize assets into a target directory instead of cwd");
const TARGET_OPTION = option("--target <path>", "Alias for --dir");
const HELP_OPTION = option("--help", "Show init subcommand help");

const JSON_WORKERS_NOTE = "Pass --workers as a JSON array of worker ids when launch surfaces should emit concrete worker commands.";
const JSON_LANES_NOTE = "Pass --lanes as a JSON array of lane contracts.";
const PIPE_LIST_NOTE = "Pipe-delimited flags such as --acceptance, --verification, and --evidence accept multiple entries in one argument.";

const COMMAND_HELP_OVERRIDES = {
  "command:get": {
    usage: [commandUsage("command:get", "--name <command>")],
    options: [COMMAND_NAME_OPTION]
  },
  "command:help": {
    usage: [commandUsage("command:help", "--name <command>")],
    options: [COMMAND_NAME_OPTION]
  },
  "mcp:option": {
    usage: [commandUsage("mcp:option", "--option <option>")],
    options: [MCP_OPTION_NAME_OPTION]
  },
  "mcp:help": {
    usage: [commandUsage("mcp:help", "--option <option>")],
    options: [MCP_OPTION_NAME_OPTION]
  },
  "init:option": {
    usage: [commandUsage("init:option", "--option <option>")],
    options: [INIT_OPTION_NAME_OPTION]
  },
  "init:help": {
    usage: [commandUsage("init:help", "--option <option>")],
    options: [INIT_OPTION_NAME_OPTION]
  },
  "tools:get": {
    usage: [commandUsage("tools:get", "--name <tool>")],
    options: [TOOL_NAME_OPTION]
  },
  "catalog:agent": {
    usage: [commandUsage("catalog:agent", "--id <agent-id>")],
    options: [AGENT_ID_OPTION]
  },
  "catalog:skill": {
    usage: [commandUsage("catalog:skill", "--id <skill-id>")],
    options: [SKILL_ID_OPTION]
  },
  "capabilities:get": {
    usage: [commandUsage("capabilities:get", "--id <capability-id>")],
    options: [CAPABILITY_ID_OPTION]
  },
  "runtime:activity": {
    usage: [commandUsage("runtime:activity", "[--limit <number>]")],
    options: [LIMIT_OPTION]
  },
  "runtime:assignment-pack": {
    usage: [commandUsage("runtime:assignment-pack", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "runtime:closeout-pack": {
    usage: [commandUsage("runtime:closeout-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:control-pack": {
    usage: [commandUsage("runtime:control-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:signal-pack": {
    usage: [commandUsage("runtime:signal-pack", "[--limit <number>]")],
    options: [LIMIT_OPTION]
  },
  "runtime:execution-pack": {
    usage: [commandUsage("runtime:execution-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:pickup-pack": {
    usage: [commandUsage("runtime:pickup-pack", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "runtime:leader-pack": {
    usage: [commandUsage("runtime:leader-pack", "[options]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION, WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:review-pack": {
    usage: [commandUsage("runtime:review-pack", "[--role <role>] [--worker <worker-id>]")],
    options: [ROLE_OPTION, WORKER_OPTION]
  },
  "runtime:session-pack": {
    usage: [commandUsage("runtime:session-pack", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "runtime:queue-pack": {
    usage: [commandUsage("runtime:queue-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:workspace-pack": {
    usage: [commandUsage("runtime:workspace-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:owner-pack": {
    usage: [commandUsage("runtime:owner-pack", "--role <role> --worker <worker-id>")],
    options: [ROLE_OPTION, WORKER_OPTION]
  },
  "runtime:role-pack": {
    usage: [commandUsage("runtime:role-pack", "--role <role> [--worker <worker-id>] [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "runtime:verifier-pack": {
    usage: [commandUsage("runtime:verifier-pack", "--role <role> --worker <worker-id>")],
    options: [ROLE_OPTION, WORKER_OPTION]
  },
  "runtime:worker-pack": {
    usage: [commandUsage("runtime:worker-pack", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "runtime:summary-pack": {
    usage: [commandUsage("runtime:summary-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:dispatch-pack": {
    usage: [commandUsage("runtime:dispatch-pack", "[--worker <worker-id>] [--workers <json>]")],
    options: [WORKER_OPTION, WORKERS_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "runtime:roles": {
    usage: [commandUsage("runtime:roles", "[--limit <number>]")],
    options: [LIMIT_OPTION]
  },
  plan: {
    usage: [commandUsage("plan", "--task <task>")],
    options: [option("--task <task>", "Task brief to turn into a bounded execution plan")]
  },
  "plan:queue": {
    usage: [commandUsage("plan:queue", "--task <task>")],
    options: [option("--task <task>", "Task brief to plan and immediately queue as local tasks")]
  },
  "plan:swarm": {
    usage: [commandUsage("plan:swarm", "--task <task>")],
    options: [option("--task <task>", "Task brief to turn into a bounded swarm contract")]
  },
  "plan:swarm:queue": {
    usage: [commandUsage("plan:swarm:queue", "--task <task>")],
    options: [option("--task <task>", "Task brief to turn into a swarm and immediately queue as local tasks")]
  },
  "task:add": {
    usage: [commandUsage("task:add", "--title <title> [options]")],
    options: [
      TITLE_OPTION,
      STATUS_OPTION,
      OWNER_OPTION,
      VERIFIER_OPTION,
      OBJECTIVE_OPTION,
      LANE_OPTION,
      SWARM_LINK_OPTION,
      SCOPE_OPTION,
      ACCEPTANCE_OPTION,
      VERIFICATION_OPTION,
      NOTES_OPTION
    ],
    notes: [PIPE_LIST_NOTE]
  },
  "task:get": {
    usage: [commandUsage("task:get", "--id <task-id>")],
    options: [TASK_RECORD_ID_OPTION]
  },
  "task:history": {
    usage: [commandUsage("task:history", "--id <task-id>")],
    options: [TASK_RECORD_ID_OPTION]
  },
  "task:annotate": {
    usage: [commandUsage("task:annotate", "--id <task-id> --content <text> [--by <actor>] [--kind <kind>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, KIND_OPTION, CONTENT_OPTION]
  },
  "task:report": {
    usage: [commandUsage("task:report", "--id <task-id>")],
    options: [TASK_RECORD_ID_OPTION]
  },
  "task:brief": {
    usage: [commandUsage("task:brief", "--id <task-id>")],
    options: [TASK_RECORD_ID_OPTION]
  },
  "task:inbox": {
    usage: [commandUsage("task:inbox", "--role <role> [--worker <worker-id>] [--limit <number>]")],
    options: [ROLE_OPTION, WORKER_OPTION, LIMIT_OPTION]
  },
  "task:next": {
    usage: [commandUsage("task:next", "--role <role> [--worker <worker-id>] [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "task:assignment-preview": {
    usage: [commandUsage("task:assignment-preview", "--role <role> --worker <worker-id> [--mode <mode>] [--task <task-id>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION, TASK_ID_OPTION]
  },
  "task:assignment-pickup": {
    usage: [commandUsage("task:assignment-pickup", "--role <role> --worker <worker-id> [--mode <mode>] [--task <task-id>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION, TASK_ID_OPTION]
  },
  "task:pickup-preview": {
    usage: [commandUsage("task:pickup-preview", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "task:pickup": {
    usage: [commandUsage("task:pickup", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "worker:session": {
    usage: [commandUsage("worker:session", "--role <role> --worker <worker-id> [--mode <mode>] [--limit <number>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION, LIMIT_OPTION]
  },
  "worker:handoff": {
    usage: [commandUsage("worker:handoff", "--role <role> --worker <worker-id> [--mode <mode>] [--limit <number>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION, LIMIT_OPTION]
  },
  "worker:closeout": {
    usage: [commandUsage("worker:closeout", "--role <role> --worker <worker-id> [--mode <mode>] [--limit <number>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION, LIMIT_OPTION]
  },
  "verifier:bundle": {
    usage: [commandUsage("verifier:bundle", "--role <role> --worker <worker-id> [--limit <number>]")],
    options: [ROLE_OPTION, WORKER_OPTION, LIMIT_OPTION]
  },
  "leader:workspace": {
    usage: [commandUsage("leader:workspace", "[--status <status>] [--topology <topology>] [--owner <owner>]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION]
  },
  "leader:queue": {
    usage: [commandUsage("leader:queue", "[--status <status>] [--topology <topology>] [--owner <owner>]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION]
  },
  "leader:assignments": {
    usage: [commandUsage("leader:assignments", "[--status <status>] [--topology <topology>] [--owner <owner>]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION]
  },
  "leader:assignment-dispatch": {
    usage: [commandUsage("leader:assignment-dispatch", "[options]")],
    options: [ROLE_OPTION, OWNER_OPTION, WORKER_OPTION, TASK_ID_OPTION, STATUS_OPTION, TOPOLOGY_OPTION]
  },
  "leader:assignment-dispatch-bundle": {
    usage: [commandUsage("leader:assignment-dispatch-bundle", "[options]")],
    options: [ROLE_OPTION, OWNER_OPTION, WORKER_OPTION, WORKERS_OPTION, TASK_ID_OPTION, STATUS_OPTION, TOPOLOGY_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "leader:assignment-launch-plan": {
    usage: [commandUsage("leader:assignment-launch-plan", "[options]")],
    options: [ROLE_OPTION, OWNER_OPTION, WORKER_OPTION, WORKERS_OPTION, TASK_ID_OPTION, STATUS_OPTION, TOPOLOGY_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "leader:assignment-dispatch-pack": {
    usage: [commandUsage("leader:assignment-dispatch-pack", "[options]")],
    options: [ROLE_OPTION, OWNER_OPTION, WORKER_OPTION, WORKERS_OPTION, TASK_ID_OPTION, STATUS_OPTION, TOPOLOGY_OPTION],
    notes: [JSON_WORKERS_NOTE]
  },
  "task:claim": {
    usage: [commandUsage("task:claim", "--id <task-id> --by <actor>")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION]
  },
  "task:block": {
    usage: [commandUsage("task:block", "--id <task-id> [--by <actor>] [--notes <text>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "task:review": {
    usage: [commandUsage("task:review", "--id <task-id> [--by <actor>] [--notes <text>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "task:approve": {
    usage: [commandUsage("task:approve", "--id <task-id> --by <actor> [--notes <text>] [--evidence <item|item>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION, REVIEW_EVIDENCE_OPTION],
    notes: [PIPE_LIST_NOTE]
  },
  "task:reject": {
    usage: [commandUsage("task:reject", "--id <task-id> --by <actor> [--notes <text>] [--status <status>] [--evidence <item|item>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION, STATUS_OPTION, REVIEW_EVIDENCE_OPTION],
    notes: [PIPE_LIST_NOTE]
  },
  "task:done": {
    usage: [commandUsage("task:done", "--id <task-id> --by <actor> [--notes <text>] [--evidence <item|item>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION, REVIEW_EVIDENCE_OPTION],
    notes: [PIPE_LIST_NOTE]
  },
  "task:release": {
    usage: [commandUsage("task:release", "--id <task-id> [--by <actor>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION]
  },
  "task:update": {
    usage: [commandUsage("task:update", "--id <task-id> [options]")],
    options: [
      TASK_RECORD_ID_OPTION,
      TITLE_OPTION,
      STATUS_OPTION,
      OWNER_OPTION,
      VERIFIER_OPTION,
      OBJECTIVE_OPTION,
      LANE_OPTION,
      SWARM_LINK_OPTION,
      SCOPE_OPTION,
      ACCEPTANCE_OPTION,
      VERIFICATION_OPTION,
      NOTES_OPTION
    ],
    notes: [PIPE_LIST_NOTE]
  },
  "task:check": {
    usage: [commandUsage("task:check", "--id <task-id>")],
    options: [TASK_RECORD_ID_OPTION]
  },
  "swarm:init": {
    usage: [commandUsage("swarm:init", "--objective <text> [options]")],
    options: [OBJECTIVE_OPTION, TOPOLOGY_OPTION, MAX_WORKERS_OPTION, OWNER_OPTION, LANE_SOURCE_OPTION, NOTES_OPTION, LANES_OPTION],
    notes: [JSON_LANES_NOTE]
  },
  "swarm:list": {
    usage: [commandUsage("swarm:list", "[--status <status>] [--topology <topology>] [--owner <owner>] [--detailed]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION, DETAILED_OPTION]
  },
  "swarm:get": {
    usage: [commandUsage("swarm:get", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:brief": {
    usage: [commandUsage("swarm:brief", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:bundle": {
    usage: [commandUsage("swarm:bundle", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:blockers": {
    usage: [commandUsage("swarm:blockers", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:closeout": {
    usage: [commandUsage("swarm:closeout", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:dispatch-bundle": {
    usage: [commandUsage("swarm:dispatch-bundle", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:update": {
    usage: [commandUsage("swarm:update", "--id <swarm-id> [options]")],
    options: [SWARM_ID_OPTION, OBJECTIVE_OPTION, TOPOLOGY_OPTION, MAX_WORKERS_OPTION, OWNER_OPTION, LANE_SOURCE_OPTION, NOTES_OPTION, LANES_OPTION],
    notes: [JSON_LANES_NOTE]
  },
  "swarm:check": {
    usage: [commandUsage("swarm:check", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:overview": {
    usage: [commandUsage("swarm:overview", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:dispatch": {
    usage: [commandUsage("swarm:dispatch", "--id <swarm-id> --by <actor> [--owner <owner>]")],
    options: [SWARM_ID_OPTION, ACTOR_OPTION, OWNER_OPTION]
  },
  "swarm:sync": {
    usage: [commandUsage("swarm:sync", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:start": {
    usage: [commandUsage("swarm:start", "--id <swarm-id> [--owner <owner>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, OWNER_OPTION, NOTES_OPTION]
  },
  "swarm:block": {
    usage: [commandUsage("swarm:block", "--id <swarm-id> [--owner <owner>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, OWNER_OPTION, NOTES_OPTION]
  },
  "swarm:done": {
    usage: [commandUsage("swarm:done", "--id <swarm-id> [--owner <owner>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, OWNER_OPTION, NOTES_OPTION]
  },
  "swarm:cancel": {
    usage: [commandUsage("swarm:cancel", "--id <swarm-id> [--owner <owner>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, OWNER_OPTION, NOTES_OPTION]
  },
  "swarm:queue": {
    usage: [commandUsage("swarm:queue", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "memory:store": {
    usage: [commandUsage("memory:store", "--content <text> [options]")],
    options: [CONTENT_OPTION, NAMESPACE_OPTION, KIND_FILTER_OPTION, TITLE_OPTION, AGENT_FILTER_OPTION, TAGS_OPTION, NOTES_OPTION]
  },
  "memory:get": {
    usage: [commandUsage("memory:get", "--id <memory-id>")],
    options: [MEMORY_ID_OPTION]
  },
  "memory:list": {
    usage: [commandUsage("memory:list", "[--namespace <namespace>] [--kind <kind>] [--agent <agent>] [--tags <tag,tag>]")],
    options: [NAMESPACE_OPTION, KIND_FILTER_OPTION, AGENT_FILTER_OPTION, TAGS_OPTION]
  },
  "memory:search": {
    usage: [commandUsage("memory:search", "--query <text> [--limit <number>] [--namespace <namespace>] [--kind <kind>] [--agent <agent>] [--tags <tag,tag>]")],
    options: [QUERY_OPTION, LIMIT_OPTION, NAMESPACE_OPTION, KIND_FILTER_OPTION, AGENT_FILTER_OPTION, TAGS_OPTION]
  },
  "--help": {
    usage: [commandUsage("--help"), commandUsage("help")],
    notes: ["Print the full top-level command catalog."]
  },
  "--version": {
    usage: [commandUsage("--version"), commandUsage("version")],
    notes: ["Print the shipped package version."]
  }
};

function cloneEntries(entries = []) {
  return entries.map((entry) => ({ ...entry }));
}

function normalizeCommand(command) {
  if (!command) {
    return undefined;
  }

  return COMMAND_ALIASES[command] ?? command;
}

function getCommandAliases(command) {
  return Object.entries(COMMAND_ALIASES)
    .filter(([, canonical]) => canonical === command)
    .map(([alias]) => alias);
}

function getCommandHelpSpec(command, entry) {
  const override = COMMAND_HELP_OVERRIDES[command];

  return {
    usage: [...(override?.usage ?? [])],
    options: cloneEntries(override?.options ?? entry?.options ?? []),
    notes: [...(override?.notes ?? [])]
  };
}

function getStructuredCommandOptions(command, entry) {
  if (command === "init") {
    return getInitCommandCatalog();
  }

  if (command === "mcp") {
    return getMcpCommandCatalog();
  }

  const helpSpec = getCommandHelpSpec(command, entry);
  return helpSpec.options.length > 0 ? cloneEntries(helpSpec.options) : undefined;
}

function pushCommandHelpSection(lines, title, bodyLines) {
  if (bodyLines.length === 0) {
    return;
  }

  lines.push("", `${title}:`, ...bodyLines.map((line) => `  ${line}`));
}

function formatOptionLines(options) {
  if (options.length === 0) {
    return [];
  }

  const width = options.reduce((max, entry) => Math.max(max, entry.option.length), 0) + 2;
  return options.map((entry) => `${entry.option.padEnd(width)}${entry.description}`);
}

export function getInitCommandCatalog() {
  return cloneEntries(INIT_COMMAND_OPTIONS);
}

export function getInitCommandCatalogView() {
  const options = getInitCommandCatalog();

  return {
    kind: "init_command_catalog_view",
    recommendedReason: options.length > 0 ? "init_command_catalog_loaded" : "init_command_catalog_empty",
    counts: {
      totalOptions: options.length
    },
    options
  };
}

export function getInitCommandCatalogEntry(option) {
  if (!option) {
    return undefined;
  }

  return getInitCommandCatalog().find((entry) => entry.option === option);
}

export function getInitCommandCatalogEntryView(option) {
  const matchedEntry = getInitCommandCatalogEntry(option);

  return {
    kind: "init_command_option_view",
    recommendedReason: matchedEntry ? "init_command_option_loaded" : "init_command_option_missing",
    option: option ?? null,
    matchedOption: matchedEntry?.option ?? null,
    entry: matchedEntry ?? null
  };
}

export function getCommandCatalog() {
  const commands = [
    { command: "run", description: "Start the local Codex runtime shell contract" },
    { command: "ready", description: "Show the runtime readiness view" },
    { command: "commands", description: "Show the CLI command catalog view" },
    { command: "command:get", description: "Show one CLI command view" },
    { command: "command:help", description: "Show one CLI command help view" },
    { command: "init", description: "Materialize the shipped .codex runtime assets into the current project", options: getInitCommandCatalog() },
    { command: "init:options", description: "Show the init option catalog view" },
    { command: "init:option", description: "Show one init option view" },
    { command: "init:help", description: "Show one init option help view" },
    { command: "mcp", description: "Start the local Codex MCP stdio runtime or inspect its subcommands", options: getMcpCommandCatalog() },
    { command: "mcp:options", description: "Show the MCP option catalog view" },
    { command: "mcp:option", description: "Show one MCP option view" },
    { command: "mcp:help", description: "Show one MCP option help view" },
    { command: "tools", description: "Print the current MCP tool catalog" },
    { command: "tools:get", description: "Show one MCP tool view" },
    { command: "catalog", description: "Print the shipped local agent and skill catalog" },
    { command: "catalog:agents", description: "Show the shipped local agent catalog view" },
    { command: "catalog:agent", description: "Show one shipped local agent view" },
    { command: "catalog:skills", description: "Show the shipped local skill catalog view" },
    { command: "catalog:skill", description: "Show one shipped local skill view" },
    { command: "guidance:overview", description: "Show the runtime coordination overview view" },
    { command: "guidance:worker", description: "Show the worker guidance view" },
    { command: "contract", description: "Show the runtime contract view" },
    { command: "doctor", description: "Print runtime contract diagnostics" },
    { command: "metadata", description: "Print package identity metadata" },
    { command: "status", description: "Print runtime state and surface summary" },
    { command: "capabilities", description: "Print the shipped runtime capability inventory" },
    { command: "capabilities:get", description: "Show one runtime capability view" },
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
    { command: "plan:swarm:queue", description: "Generate a bounded swarm contract and queue its lanes as local tasks" },
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
    { command: "swarm:overview", description: "Summarize one swarm and its current lane state" },
    { command: "swarm:dispatch", description: "Claim the next runnable swarm lane for a worker" },
    { command: "swarm:update", description: "Update a local swarm contract" },
    { command: "swarm:check", description: "Validate one swarm contract for lane readiness" },
    { command: "swarm:sync", description: "Reconcile one swarm status against its linked task state" },
    { command: "swarm:start", description: "Mark a planned swarm active" },
    { command: "swarm:block", description: "Mark an active swarm blocked" },
    { command: "swarm:done", description: "Mark a swarm complete" },
    { command: "swarm:cancel", description: "Cancel a swarm" },
    { command: "swarm:queue", description: "Queue swarm lanes into local tasks" },
    { command: "memory:store", description: "Store a persistent local memory" },
    { command: "memory:get", description: "Show one persistent local memory" },
    { command: "memory:list", description: "List persistent local memories" },
    { command: "memory:search", description: "Search persistent local memories" },
    { command: "--help", description: "Show help" },
    { command: "--version", description: "Show version" }
  ];

  return commands.map((entry) => {
    const options = getStructuredCommandOptions(entry.command, entry);
    return options ? { ...entry, options } : entry;
  });
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

export function getCommandCatalogEntry(command) {
  const normalizedCommand = normalizeCommand(command);
  if (!normalizedCommand) {
    return undefined;
  }

  return getCommandCatalog().find((entry) => entry.command === normalizedCommand);
}

export function getCommandCatalogEntryView(command) {
  const matchedEntry = getCommandCatalogEntry(command);

  return {
    kind: "command_catalog_entry_view",
    recommendedReason: matchedEntry ? "command_catalog_entry_loaded" : "command_catalog_entry_missing",
    command: command ?? null,
    matchedCommand: matchedEntry?.command ?? null,
    entry: matchedEntry ?? null
  };
}

export function getCommandHelpView(command) {
  const matchedEntry = getCommandCatalogEntry(command);
  const text = renderCommandHelpText(command);

  return {
    kind: "command_help_view",
    recommendedReason: matchedEntry ? "command_help_loaded" : "command_help_fallback_loaded",
    command: command ?? null,
    matchedCommand: matchedEntry?.command ?? null,
    text,
    entry: matchedEntry ?? null
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
    ...formatOptionLines([
      PREVIEW_OPTION,
      FORCE_OPTION,
      DIR_OPTION,
      TARGET_OPTION,
      HELP_OPTION
    ]).map((line) => `  ${line}`)
  ].join("\n") + "\n";
}

export function getInitHelpView(option) {
  const matchedOption = getInitCommandCatalogEntry(option);
  const text = renderInitHelpText();

  return {
    kind: "init_help_view",
    recommendedReason: matchedOption ? "init_help_loaded" : "init_help_fallback_loaded",
    option: option ?? null,
    matchedOption: matchedOption?.option ?? null,
    text,
    entry: matchedOption ?? null
  };
}

export function renderCommandHelpText(command) {
  const normalizedCommand = normalizeCommand(command);

  if (normalizedCommand === "init") {
    return renderInitHelpText();
  }

  if (normalizedCommand === "mcp") {
    return renderMcpHelpText();
  }

  const matchedEntry = getCommandCatalogEntry(normalizedCommand);
  if (!matchedEntry) {
    return renderHelpText();
  }

  const helpSpec = getCommandHelpSpec(normalizedCommand, matchedEntry);
  const usageLines = helpSpec.usage.length > 0 ? helpSpec.usage : [`${PRODUCT_NAME} ${matchedEntry.command}`];
  const aliases = getCommandAliases(matchedEntry.command);
  const lines = [
    `${PRODUCT_NAME} ${matchedEntry.command}`,
    "",
    "Usage:",
    ...usageLines.map((line) => `  ${line}`)
  ];

  pushCommandHelpSection(lines, "Description", [matchedEntry.description]);
  pushCommandHelpSection(lines, "Aliases", aliases);
  pushCommandHelpSection(
    lines,
    "Options",
    formatOptionLines(helpSpec.options)
  );
  pushCommandHelpSection(lines, "Notes", helpSpec.notes);

  return lines.join("\n") + "\n";
}
