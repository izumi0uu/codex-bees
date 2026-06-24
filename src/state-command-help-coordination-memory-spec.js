import { formatCommandUsage as commandUsage } from "./state-command-help-format.js";
import {
  AGENT_FILTER_OPTION,
  CONTENT_OPTION,
  KIND_FILTER_OPTION,
  LIMIT_OPTION,
  MEMORY_ID_OPTION,
  NAMESPACE_OPTION,
  NOTES_OPTION,
  QUERY_OPTION,
  TAGS_OPTION,
  TITLE_OPTION
} from "./state-command-options.js";

export const COORDINATION_MEMORY_COMMAND_HELP_OVERRIDES = {
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
