import { option } from "./option-helpers.js";

export const ROLE_OPTION = option("--role <role>", "Role id to scope the view or action to");
export const OWNER_OPTION = option("--owner <owner>", "Owner role to filter, assign, or reconcile against");
export const WORKER_OPTION = option("--worker <worker-id>", "Worker id to bind the view or action to");
export const WORKERS_OPTION = option("--workers <json>", "JSON role-to-worker map for concrete launch commands; values may be a worker id or worker-id array");
export const MODE_OPTION = option("--mode <mode>", "Execution mode label to carry into the generated runtime surface");
export const STATUS_OPTION = option("--status <status>", "Status filter or next queue status override");
export const TOPOLOGY_OPTION = option("--topology <topology>", "Swarm topology filter or topology override");
export const LIMIT_OPTION = option("--limit <number>", "Maximum number of entries to include");
export const DETAIL_OPTION = option("--detail <detail>", "Output detail level for compact/full runtime pack views");

export const JSON_WORKERS_NOTE = "Pass --workers as a JSON object that maps role ids to worker ids or worker-id arrays when launch surfaces should emit concrete worker commands.";
export const RUNTIME_PACK_DETAIL_NOTE = "Runtime summary/control/dispatch/execution/leader/queue/workspace packs default to compact output; pass --detail full to expand nested surfaces.";
