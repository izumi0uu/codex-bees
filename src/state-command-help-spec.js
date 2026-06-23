import { cloneEntries } from "./state-command-options.js";
import { formatCommandUsage } from "./state-command-help-format.js";
import { CORE_COMMAND_HELP_OVERRIDES } from "./state-command-help-core-spec.js";
import { COORDINATION_COMMAND_HELP_OVERRIDES } from "./state-command-help-coordination-spec.js";
import { RUNTIME_COMMAND_HELP_OVERRIDES } from "./state-command-help-runtime-spec.js";

export { formatCommandUsage };

export const COMMAND_HELP_OVERRIDES = {
  ...CORE_COMMAND_HELP_OVERRIDES,
  ...RUNTIME_COMMAND_HELP_OVERRIDES,
  ...COORDINATION_COMMAND_HELP_OVERRIDES
};

export function getCommandHelpSpec(command, entry) {
  const override = COMMAND_HELP_OVERRIDES[command];

  return {
    usage: [...(override?.usage ?? [])],
    options: cloneEntries(override?.options ?? entry?.options ?? []),
    notes: [...(override?.notes ?? [])]
  };
}
