export const option = (flag, description) => ({ option: flag, description });

export const COMMAND_ALIASES = {
  help: "--help",
  version: "--version"
};

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
export const PLANNER_PROFILE_ID_OPTION = option("--profile <planner-profile-id>", "Planner profile id from the shipped planner profile catalog");
export const ROLE_OPTION = option("--role <role>", "Role id to scope the view or action to");
export const OWNER_OPTION = option("--owner <owner>", "Owner role to filter, assign, or reconcile against");
export const WORKER_OPTION = option("--worker <worker-id>", "Worker id to bind the view or action to");
export const WORKERS_OPTION = option("--workers <json>", "JSON role-to-worker map for concrete launch commands; values may be a worker id or worker-id array");
export const MODE_OPTION = option("--mode <mode>", "Execution mode label to carry into the generated runtime surface");
export const STATUS_OPTION = option("--status <status>", "Status filter or next queue status override");
export const TOPOLOGY_OPTION = option("--topology <topology>", "Swarm topology filter or topology override");
export const LIMIT_OPTION = option("--limit <number>", "Maximum number of entries to include");
export const DETAIL_OPTION = option("--detail <detail>", "Output detail level for compact/full runtime pack views");
export const TASK_ID_OPTION = option("--task <task-id>", "Task id to target or preselect");
export const TASK_RECORD_ID_OPTION = option("--id <task-id>", "Task id from the local coordination task store");
export const SWARM_ID_OPTION = option("--id <swarm-id>", "Swarm id from the local swarm store");
export const MEMORY_ID_OPTION = option("--id <memory-id>", "Memory id from the local memory store");
export const ACTOR_OPTION = option("--by <actor>", "Worker or reviewer id performing the lifecycle mutation");
export const NOTES_OPTION = option("--notes <text>", "Free-form note stored with the resulting mutation");
export const REVIEW_EVIDENCE_OPTION = option("--evidence <item|item>", "Pipe-delimited review evidence entries");
export const OBJECTIVE_OPTION = option("--objective <text>", "Objective text for the generated task or swarm");
export const TITLE_OPTION = option("--title <title>", "Human-readable title for the created or updated record");
export const VERIFIER_OPTION = option("--verifier <role>", "Verifier role for review and approval");
export const LANE_OPTION = option("--lane <lane>", "Lane id inside the parent swarm contract");
export const LANE_PURPOSE_OPTION = option("--lane-purpose <purpose>", "Planner lane purpose for ordering (discovery|implementation|verification|documentation)");
export const SWARM_LINK_OPTION = option("--swarm-id <swarm-id>", "Link the task to an existing swarm");
export const SCOPE_OPTION = option("--scope <path,path>", "Comma-delimited scope paths; repeat the flag to append more");
export const DEPENDS_ON_OPTION = option("--depends-on <ref,ref>", "Comma-delimited dependency refs; repeat the flag to append more");
export const ACCEPTANCE_OPTION = option("--acceptance <item|item>", "Pipe-delimited acceptance criteria entries");
export const VERIFICATION_OPTION = option("--verification <item|item>", "Pipe-delimited verification command or inspection entries");
export const KIND_OPTION = option("--kind <kind>", "Structured note kind for the task annotation");
export const CONTENT_OPTION = option("--content <text>", "Content payload to store with the mutation or memory");
export const MAX_WORKERS_OPTION = option("--max-workers <number>", "Maximum worker count for the swarm topology");
export const LANE_SOURCE_OPTION = option("--lane-source <source>", "Source label describing how the swarm lanes were derived");
export const LANES_OPTION = option("--lanes <json>", "JSON array of lane contracts");
export const QUERY_OPTION = option("--query <text>", "Search query text");
export const NAMESPACE_OPTION = option("--namespace <namespace>", "Namespace filter or value for stored memories");
export const KIND_FILTER_OPTION = option("--kind <kind>", "Kind filter or value for stored memories");
export const AGENT_FILTER_OPTION = option("--agent <agent>", "Agent filter or value for stored memories");
export const TAGS_OPTION = option("--tags <tag,tag>", "Comma-delimited tags; repeat the flag to append more");
export const DETAILED_OPTION = option("--detailed", "Include nested lane and task detail in swarm list output");

export const JSON_WORKERS_NOTE = "Pass --workers as a JSON object that maps role ids to worker ids or worker-id arrays when launch surfaces should emit concrete worker commands.";
export const RUNTIME_PACK_DETAIL_NOTE = "Runtime summary/control packs default to compact output; pass --detail full to expand nested surfaces.";
export const JSON_LANES_NOTE = "Pass --lanes as a JSON array of lane contracts.";
export const JSON_LANE_DEPENDENCY_NOTE = "Lane JSON may include dependsOn arrays that reference prerequisite lane ids.";
export const PIPE_LIST_NOTE = "Pipe-delimited flags such as --acceptance, --verification, and --evidence accept multiple entries in one argument.";

export function cloneEntries(entries = []) {
  return entries.map((entry) => ({ ...entry }));
}

export function formatOptionLines(options) {
  if (options.length === 0) {
    return [];
  }

  const width = options.reduce((max, entry) => Math.max(max, entry.option.length), 0) + 2;
  return options.map((entry) => `${entry.option.padEnd(width)}${entry.description}`);
}

export function normalizeCommand(command) {
  if (!command) {
    return undefined;
  }

  return COMMAND_ALIASES[command] ?? command;
}

export function getCommandAliases(command) {
  return Object.entries(COMMAND_ALIASES)
    .filter(([, canonical]) => canonical === command)
    .map(([alias]) => alias);
}

export function pushCommandHelpSection(lines, title, bodyLines) {
  if (bodyLines.length === 0) {
    return;
  }

  lines.push("", `${title}:`, ...bodyLines.map((line) => `  ${line}`));
}
