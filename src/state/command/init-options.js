import {
  cloneEntries,
  createOptionCatalogView,
  createResolvedOptionView,
  findOptionEntry
} from "./options.js";

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
  return createOptionCatalogView("init_command_catalog_view", options, {
    loadedReason: "init_command_catalog_loaded",
    emptyReason: "init_command_catalog_empty"
  });
}

export function getInitCommandCatalogEntry(option) {
  return findOptionEntry(getInitCommandCatalog(), option);
}

export function getInitCommandCatalogEntryView(option) {
  const matchedEntry = getInitCommandCatalogEntry(option);
  return createResolvedOptionView("init_command_option_view", option, matchedEntry, {
    loadedReason: "init_command_option_loaded",
    missingReason: "init_command_option_missing"
  });
}
