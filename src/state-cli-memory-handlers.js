import { readListOption, readOption, requireOption, write } from "./state-cli-helpers.js";
import { getMemoryView, listMemoriesView, searchMemoriesView, storeMemoryMutation } from "./state-runtime.js";
import { writeLookupView } from "./state-cli-lookup-writers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

function readMemoryFilters() {
  return {
    namespace: readOption("--namespace"),
    kind: readOption("--kind"),
    agent: readOption("--agent"),
    tags: readListOption("--tags")
  };
}

function handleMemoryStore() {
  const content = requireOption("--content");
  const memory = storeMemoryMutation({
    ...readMemoryFilters(),
    title: readOption("--title"),
    notes: readOption("--notes"),
    content
  });
  writeNamedView("stored", memory);
}

function handleMemoryGet() {
  const id = requireOption("--id");
  writeLookupView("memory", getMemoryView, id, "memory");
}

function handleMemoryList() {
  writeNamedView("memories", listMemoriesView(readMemoryFilters()));
}

function handleMemorySearch() {
  const query = requireOption("--query");
  const limit = Number(readOption("--limit") ?? "10");
  const results = searchMemoriesView(query, readMemoryFilters(), limit);

  write(JSON.stringify(results, null, 2) + "\n");
}

export {
  handleMemoryStore,
  handleMemoryGet,
  handleMemoryList,
  handleMemorySearch
};
