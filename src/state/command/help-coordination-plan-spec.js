import { formatCommandUsage as commandUsage } from "./help-format.js";
import {
  option,
  PLANNER_PROFILE_FILE_NOTE,
  PLANNER_PROFILE_FILE_OPTION,
  PLANNER_PROFILE_ID_OPTION
} from "./options.js";

export const COORDINATION_PLAN_COMMAND_HELP_OVERRIDES = {
  "plan:profiles": {
    usage: [commandUsage("plan:profiles", "[--profile-file <path>]")],
    options: [PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:profile": {
    usage: [commandUsage("plan:profile", "--profile <planner-profile-id> [--profile-file <path>]")],
    options: [PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  plan: {
    usage: [commandUsage("plan", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to turn into a bounded execution plan"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:queue": {
    usage: [commandUsage("plan:queue", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to plan and immediately queue as local tasks"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:swarm": {
    usage: [commandUsage("plan:swarm", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to turn into a bounded swarm contract"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  },
  "plan:swarm:queue": {
    usage: [commandUsage("plan:swarm:queue", "--task <task> [--profile <planner-profile-id>] [--profile-file <path>]")],
    options: [option("--task <task>", "Task brief to turn into a swarm and immediately queue as local tasks"), PLANNER_PROFILE_ID_OPTION, PLANNER_PROFILE_FILE_OPTION],
    notes: [PLANNER_PROFILE_FILE_NOTE]
  }
};
