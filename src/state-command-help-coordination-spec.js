import { COORDINATION_MEMORY_COMMAND_HELP_OVERRIDES } from "./state-command-help-coordination-memory-spec.js";
import { COORDINATION_PLAN_COMMAND_HELP_OVERRIDES } from "./state-command-help-coordination-plan-spec.js";
import { COORDINATION_SWARM_COMMAND_HELP_OVERRIDES } from "./state-command-help-coordination-swarm-spec.js";
import { COORDINATION_TASK_COMMAND_HELP_OVERRIDES } from "./state-command-help-coordination-task-spec.js";
import { COORDINATION_WORKER_COMMAND_HELP_OVERRIDES } from "./state-command-help-coordination-worker-spec.js";

export const COORDINATION_COMMAND_HELP_OVERRIDES = {
  ...COORDINATION_PLAN_COMMAND_HELP_OVERRIDES,
  ...COORDINATION_TASK_COMMAND_HELP_OVERRIDES,
  ...COORDINATION_WORKER_COMMAND_HELP_OVERRIDES,
  ...COORDINATION_SWARM_COMMAND_HELP_OVERRIDES,
  ...COORDINATION_MEMORY_COMMAND_HELP_OVERRIDES
};
