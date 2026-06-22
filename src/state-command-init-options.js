import { cloneEntries } from "./state-command-options.js";

const INIT_COMMAND_OPTIONS = [
  { option: "--preview", description: "Show the exact init file plan without writing anything" },
  { option: "--force", description: "Overwrite shipped .codex asset files that already exist" },
  { option: "--dir <path>", description: "Materialize assets into a target directory instead of cwd" },
  { option: "--target <path>", description: "Alias for --dir" },
  { option: "--help", description: "Show init subcommand help" }
];

export function getInitCommandCatalog() {
  return cloneEntries(INIT_COMMAND_OPTIONS);
}

export function getInitCommandCatalogView() {
  const options = getInitCommandCatalog();

  return {
    kind: "init_command_catalog_view",
    recommendedReason: options.length > 0 ? "init_command_catalog_loaded" : "init_command_catalog_empty",
    counts: {
      totalOptions: options.length
    },
    options
  };
}

export function getInitCommandCatalogEntry(option) {
  if (!option) {
    return undefined;
  }

  return getInitCommandCatalog().find((entry) => entry.option === option);
}

export function getInitCommandCatalogEntryView(option) {
  const matchedEntry = getInitCommandCatalogEntry(option);

  return {
    kind: "init_command_option_view",
    recommendedReason: matchedEntry ? "init_command_option_loaded" : "init_command_option_missing",
    option: option ?? null,
    matchedOption: matchedEntry?.option ?? null,
    entry: matchedEntry ?? null
  };
}
