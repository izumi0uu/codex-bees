import { formatCommandUsage as commandUsage } from "./state-command-help-format.js";
import {
  ACCEPTANCE_OPTION,
  ACTOR_OPTION,
  AGENT_FILTER_OPTION,
  CONTENT_OPTION,
  DETAILED_OPTION,
  DEPENDS_ON_OPTION,
  JSON_LANES_NOTE,
  JSON_LANE_DEPENDENCY_NOTE,
  JSON_WORKERS_NOTE,
  KIND_FILTER_OPTION,
  KIND_OPTION,
  LANE_OPTION,
  LANE_PURPOSE_OPTION,
  LANES_OPTION,
  LANE_SOURCE_OPTION,
  LIMIT_OPTION,
  MAX_WORKERS_OPTION,
  MEMORY_ID_OPTION,
  MODE_OPTION,
  NAMESPACE_OPTION,
  NOTES_OPTION,
  OBJECTIVE_OPTION,
  option,
  OWNER_OPTION,
  PIPE_LIST_NOTE,
  PLANNER_PROFILE_FILE_NOTE,
  PLANNER_PROFILE_FILE_OPTION,
  PLANNER_PROFILE_ID_OPTION,
  QUERY_OPTION,
  REVIEW_EVIDENCE_OPTION,
  ROLE_OPTION,
  SCOPE_OPTION,
  STATUS_OPTION,
  SWARM_ID_OPTION,
  SWARM_LINK_OPTION,
  TAGS_OPTION,
  TASK_ID_OPTION,
  TASK_RECORD_ID_OPTION,
  TITLE_OPTION,
  TOPOLOGY_OPTION,
  VERIFICATION_OPTION,
  VERIFIER_OPTION,
  WORKER_OPTION,
  WORKERS_OPTION
} from "./state-command-options.js";

export const COORDINATION_COMMAND_HELP_OVERRIDES = {
  "plan:profiles": {
    usage: [commandUsage("plan:profiles", "[--profile-file <path>]")],
    options: [PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:profile": {
    usage: [commandUsage("plan:profile", "--profile <planner-profile-id> [--profile-file <path>]")],
    options: [PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  plan: {
    usage: [commandUsage("plan", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to turn into a bounded execution plan"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:queue": {
    usage: [commandUsage("plan:queue", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to plan and immediately queue as local tasks"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:swarm": {
    usage: [commandUsage("plan:swarm", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to turn into a bounded swarm contract"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:swarm:queue": {
    usage: [commandUsage("plan:swarm:queue", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to turn into a swarm and immediately queue as local tasks"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
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
      LANE_PURPOSE_OPTION,
      SWARM_LINK_OPTION,
      SCOPE_OPTION,
      DEPENDS_ON_OPTION,
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
  "task:archive:list": {
    usage: [commandUsage("task:archive:list")],
    options: []
  },
  "task:archive:get": {
    usage: [commandUsage("task:archive:get", "--id <task-id>")],
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
  "task:archive": {
    usage: [commandUsage("task:archive", "--id <task-id> [--by <actor>] [--notes <text>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "task:restore": {
    usage: [commandUsage("task:restore", "--id <task-id> [--by <actor>] [--notes <text>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "task:reopen": {
    usage: [commandUsage("task:reopen", "--id <task-id> [--by <actor>] [--notes <text>]")],
    options: [TASK_RECORD_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
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
      DEPENDS_ON_OPTION,
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
    notes: [JSON_LANES_NOTE, JSON_LANE_DEPENDENCY_NOTE]
  },
  "swarm:list": {
    usage: [commandUsage("swarm:list", "[--status <status>] [--topology <topology>] [--owner <owner>] [--detailed]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION, DETAILED_OPTION]
  },
  "swarm:get": {
    usage: [commandUsage("swarm:get", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:archive:list": {
    usage: [commandUsage("swarm:archive:list")],
    options: []
  },
  "swarm:archive:get": {
    usage: [commandUsage("swarm:archive:get", "--id <swarm-id>")],
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
  "swarm:archive": {
    usage: [commandUsage("swarm:archive", "--id <swarm-id> [--by <actor>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "swarm:restore": {
    usage: [commandUsage("swarm:restore", "--id <swarm-id> [--by <actor>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "swarm:reopen": {
    usage: [commandUsage("swarm:reopen", "--id <swarm-id> [--by <actor>] [--notes <text>]")],
    options: [SWARM_ID_OPTION, ACTOR_OPTION, NOTES_OPTION]
  },
  "swarm:dispatch-bundle": {
    usage: [commandUsage("swarm:dispatch-bundle", "--id <swarm-id>")],
    options: [SWARM_ID_OPTION]
  },
  "swarm:update": {
    usage: [commandUsage("swarm:update", "--id <swarm-id> [options]")],
    options: [SWARM_ID_OPTION, OBJECTIVE_OPTION, TOPOLOGY_OPTION, MAX_WORKERS_OPTION, OWNER_OPTION, LANE_SOURCE_OPTION, NOTES_OPTION, LANES_OPTION],
    notes: [JSON_LANES_NOTE, JSON_LANE_DEPENDENCY_NOTE]
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
  }
};
