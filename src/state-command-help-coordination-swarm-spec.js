import { formatCommandUsage as commandUsage } from "./state-command-help-format.js";
import {
  ACTOR_OPTION,
  DETAILED_OPTION,
  JSON_LANES_NOTE,
  JSON_LANE_DEPENDENCY_NOTE,
  LANES_OPTION,
  LANE_SOURCE_OPTION,
  MAX_WORKERS_OPTION,
  NOTES_OPTION,
  OBJECTIVE_OPTION,
  OWNER_OPTION,
  STATUS_OPTION,
  SWARM_ID_OPTION,
  TOPOLOGY_OPTION
} from "./state-command-options.js";

export const COORDINATION_SWARM_COMMAND_HELP_OVERRIDES = {
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
  }
};
