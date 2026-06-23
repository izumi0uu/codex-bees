export const option = (flag, description) => ({ option: flag, description });

export const COMMAND_ALIASES = {
  help: "--help",
  version: "--version"
};

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
