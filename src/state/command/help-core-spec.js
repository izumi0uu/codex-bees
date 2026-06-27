import { formatCommandUsage as commandUsage } from "./help-format.js";
import {
  AGENT_ID_OPTION,
  CAPABILITY_ID_OPTION,
  COMMAND_NAME_OPTION,
  HEIGHT_OPTION,
  INIT_OPTION_NAME_OPTION,
  MCP_OPTION_NAME_OPTION,
  SECTION_OPTION,
  SKILL_ID_OPTION,
  SNAPSHOT_OPTION,
  TOOL_NAME_OPTION
  ,
  WIDTH_OPTION
} from "./options.js";

export const CORE_COMMAND_HELP_OVERRIDES = {
  tui: {
    usage: [commandUsage("tui", "[--snapshot] [--section <section>] [--width <columns>] [--height <rows>]")],
    options: [SNAPSHOT_OPTION, SECTION_OPTION, WIDTH_OPTION, HEIGHT_OPTION],
    notes: [
      "Without --snapshot this opens a full-screen terminal UI when stdin/stdout are TTY-backed.",
      "Use ':' or '/' inside the TUI to open the launcher, filter commands/screens/actions, then return to the current screen after execution.",
      "Inside the launcher, Up/Down changes the selected entry, Tab accepts it into the prompt, Enter runs it, and Esc cancels.",
      "Press '.' from the main TUI to replay the most recent CLI command from the recent-actions history.",
      "Wide terminals automatically switch into a split-pane layout, and interactive sessions keep a live refresh + event stream sidebar running by default."
    ]
  },
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
