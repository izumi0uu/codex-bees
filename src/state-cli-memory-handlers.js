import { exit, readListOption, readOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
import { getMemoryView, listMemoriesView, searchMemoriesView, storeMemoryMutation } from "./state-runtime.js";

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
  write(JSON.stringify({ stored: memory }, null, 2) + "\n");
}

function handleMemoryGet() {
  const id = requireOption("--id");
  const memory = getMemoryView(id);
  if (!memory) {
    writeErr(`Unknown memory id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ memory }, null, 2) + "\n");
}

function handleMemoryList() {
  write(JSON.stringify({ memories: listMemoriesView(readMemoryFilters()) }, null, 2) + "\n");
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
