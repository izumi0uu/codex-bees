import { formatCommandUsage as commandUsage } from "./state-command-help-format.js";
import {
  ACCEPTANCE_OPTION,
  ACTOR_OPTION,
  CONTENT_OPTION,
  DEPENDS_ON_OPTION,
  KIND_OPTION,
  LANE_OPTION,
  LANE_PURPOSE_OPTION,
  MODE_OPTION,
  NOTES_OPTION,
  OBJECTIVE_OPTION,
  OWNER_OPTION,
  PIPE_LIST_NOTE,
  REVIEW_EVIDENCE_OPTION,
  ROLE_OPTION,
  SCOPE_OPTION,
  STATUS_OPTION,
  SWARM_LINK_OPTION,
  TASK_ID_OPTION,
  TASK_RECORD_ID_OPTION,
  TITLE_OPTION,
  VERIFICATION_OPTION,
  VERIFIER_OPTION,
  WORKER_OPTION,
  LIMIT_OPTION
} from "./state-command-options.js";

export const COORDINATION_TASK_COMMAND_HELP_OVERRIDES = {
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
  }
};
