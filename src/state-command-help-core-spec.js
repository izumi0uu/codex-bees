import { formatCommandUsage as commandUsage } from "./state-command-help-format.js";
import {
  AGENT_ID_OPTION,
  CAPABILITY_ID_OPTION,
  COMMAND_NAME_OPTION,
  INIT_OPTION_NAME_OPTION,
  MCP_OPTION_NAME_OPTION,
  SKILL_ID_OPTION,
  TOOL_NAME_OPTION
} from "./state-command-options.js";

export const CORE_COMMAND_HELP_OVERRIDES = {
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
  "catalog:agent-doc": {
    usage: [commandUsage("catalog:agent-doc", "--id <agent-id>")],
    options: [AGENT_ID_OPTION]
  },
  "catalog:skill": {
    usage: [commandUsage("catalog:skill", "--id <skill-id>")],
    options: [SKILL_ID_OPTION]
  },
  "catalog:skill-doc": {
    usage: [commandUsage("catalog:skill-doc", "--id <skill-id>")],
    options: [SKILL_ID_OPTION]
  },
  "capabilities:get": {
    usage: [commandUsage("capabilities:get", "--id <capability-id>")],
    options: [CAPABILITY_ID_OPTION]
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
