export const option = (flag, description) => ({ option: flag, description });

export const COMMAND_ALIASES = {
  help: "--help",
  version: "--version"
};

export function cloneEntries(entries = []) {
  return entries.map((entry) => ({ ...entry }));
}

export function findOptionEntry(entries, option) {
  if (!option) {
    return undefined;
  }

  return entries.find((entry) => entry.option === option);
}

export function createOptionCatalogView(kind, options, {
  loadedReason,
  emptyReason
}) {
  return {
    kind,
    recommendedReason: options.length > 0 ? loadedReason : emptyReason,
    counts: {
      totalOptions: options.length
    },
    options
  };
}

export function createResolvedOptionView(kind, option, matchedEntry, {
  loadedReason,
  missingReason,
  text
} = {}) {
  const view = {
    kind,
    recommendedReason: matchedEntry ? loadedReason : missingReason,
    option: option ?? null,
    matchedOption: matchedEntry?.option ?? null,
    entry: matchedEntry ?? null
  };

  if (text !== undefined) {
    view.text = text;
  }

  return view;
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
