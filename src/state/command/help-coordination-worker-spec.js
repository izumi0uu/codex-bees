import { formatCommandUsage as commandUsage } from "./help-format.js";
import {
  JSON_WORKERS_NOTE,
  LIMIT_OPTION,
  MODE_OPTION,
  OWNER_OPTION,
  ROLE_OPTION,
  STATUS_OPTION,
  TASK_ID_OPTION,
  TOPOLOGY_OPTION,
  WORKER_OPTION,
  WORKERS_OPTION
} from "./options.js";

export const COORDINATION_WORKER_COMMAND_HELP_OVERRIDES = {
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
  "leader:assignment-ranking": {
    usage: [commandUsage("leader:assignment-ranking", "[--status <status>] [--topology <topology>] [--owner <owner>]")],
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
  }
};
