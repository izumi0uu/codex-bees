import { formatCommandUsage as commandUsage } from "./help-format.js";
import {
  DETAIL_OPTION,
  JSON_WORKERS_NOTE,
  LIMIT_OPTION,
  MODE_OPTION,
  OWNER_OPTION,
  ROLE_OPTION,
  RUNTIME_PACK_DETAIL_NOTE,
  STATUS_OPTION,
  TOPOLOGY_OPTION,
  WORKER_OPTION,
  WORKERS_OPTION
} from "./options.js";

export const RUNTIME_COMMAND_HELP_OVERRIDES = {
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
    usage: [commandUsage("runtime:control-pack", "[--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
  },
  "runtime:dispatch-ranking": {
    usage: [commandUsage("runtime:dispatch-ranking")],
    options: []
  },
  "runtime:signal-pack": {
    usage: [commandUsage("runtime:signal-pack", "[--limit <number>]")],
    options: [LIMIT_OPTION]
  },
  "runtime:execution-pack": {
    usage: [commandUsage("runtime:execution-pack", "[--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
  },
  "runtime:pickup-pack": {
    usage: [commandUsage("runtime:pickup-pack", "--role <role> --worker <worker-id> [--mode <mode>]")],
    options: [ROLE_OPTION, WORKER_OPTION, MODE_OPTION]
  },
  "runtime:leader-pack": {
    usage: [commandUsage("runtime:leader-pack", "[--status <status>] [--topology <topology>] [--owner <owner>] [--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [STATUS_OPTION, TOPOLOGY_OPTION, OWNER_OPTION, WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
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
    usage: [commandUsage("runtime:queue-pack", "[--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
  },
  "runtime:workspace-pack": {
    usage: [commandUsage("runtime:workspace-pack", "[--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
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
    usage: [commandUsage("runtime:summary-pack", "[--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
  },
  "runtime:dispatch-pack": {
    usage: [commandUsage("runtime:dispatch-pack", "[--worker <worker-id>] [--workers <json>] [--detail <detail>]")],
    options: [WORKER_OPTION, WORKERS_OPTION, DETAIL_OPTION],
    notes: [JSON_WORKERS_NOTE, RUNTIME_PACK_DETAIL_NOTE]
  },
  "runtime:focus-candidates": {
    usage: [commandUsage("runtime:focus-candidates")],
    options: []
  },
  "runtime:roles": {
    usage: [commandUsage("runtime:roles", "[--limit <number>]")],
    options: [LIMIT_OPTION]
  }
};
