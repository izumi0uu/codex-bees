import { option } from "./state-command-option-helpers.js";

export const PREVIEW_OPTION = option("--preview", "Show the exact init file plan without writing anything");
export const FORCE_OPTION = option("--force", "Overwrite shipped .codex assets that already exist");
export const DIR_OPTION = option("--dir <path>", "Materialize assets into a target directory instead of cwd");
export const TARGET_OPTION = option("--target <path>", "Alias for --dir");
export const HELP_OPTION = option("--help", "Show init subcommand help");

export const COMMAND_NAME_OPTION = option("--name <command>", "Command id from the shipped CLI catalog");
export const INIT_OPTION_NAME_OPTION = option("--option <option>", "Init option name from the shipped init option catalog");
export const MCP_OPTION_NAME_OPTION = option("--option <option>", "MCP option name from the shipped MCP option catalog");
export const TOOL_NAME_OPTION = option("--name <tool>", "Tool name from the shipped MCP tool catalog");
export const AGENT_ID_OPTION = option("--id <agent-id>", "Agent id from the shipped local agent catalog");
export const SKILL_ID_OPTION = option("--id <skill-id>", "Skill id from the shipped local skill catalog");
export const CAPABILITY_ID_OPTION = option("--id <capability-id>", "Capability id from the shipped runtime capability inventory");
