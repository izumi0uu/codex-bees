import { PRODUCT_NAME } from "./metadata.js";
import {
  ACCEPTANCE_OPTION,
  ACTOR_OPTION,
  AGENT_FILTER_OPTION,
  AGENT_ID_OPTION,
  CAPABILITY_ID_OPTION,
  cloneEntries,
  COMMAND_NAME_OPTION,
  CONTENT_OPTION,
  DETAILED_OPTION,
  INIT_OPTION_NAME_OPTION,
  JSON_LANES_NOTE,
  JSON_WORKERS_NOTE,
  KIND_FILTER_OPTION,
  KIND_OPTION,
  LANE_OPTION,
  LANES_OPTION,
  LANE_SOURCE_OPTION,
  LIMIT_OPTION,
  MAX_WORKERS_OPTION,
  MCP_OPTION_NAME_OPTION,
  MEMORY_ID_OPTION,
  MODE_OPTION,
  NAMESPACE_OPTION,
  NOTES_OPTION,
  OBJECTIVE_OPTION,
  option,
  OWNER_OPTION,
  PIPE_LIST_NOTE,
  QUERY_OPTION,
  REVIEW_EVIDENCE_OPTION,
  ROLE_OPTION,
  SCOPE_OPTION,
  SKILL_ID_OPTION,
  STATUS_OPTION,
  SWARM_ID_OPTION,
  SWARM_LINK_OPTION,
  TAGS_OPTION,
  TASK_ID_OPTION,
  TASK_RECORD_ID_OPTION,
  TITLE_OPTION,
  TOOL_NAME_OPTION,
  TOPOLOGY_OPTION,
  VERIFICATION_OPTION,
  VERIFIER_OPTION,
  WORKER_OPTION,
  WORKERS_OPTION
} from "./state-command-options.js";

export function formatCommandUsage(command, suffix = "") {
  return `${PRODUCT_NAME} ${command}${suffix ? ` ${suffix}` : ""}`;
}

const commandUsage = formatCommandUsage;

export const COMMAND_HELP_OVERRIDES = {
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

export function getCommandHelpSpec(command, entry) {
  const override = COMMAND_HELP_OVERRIDES[command];

  return {
    usage: [...(override?.usage ?? [])],
    options: cloneEntries(override?.options ?? entry?.options ?? []),
    notes: [...(override?.notes ?? [])]
  };
}
