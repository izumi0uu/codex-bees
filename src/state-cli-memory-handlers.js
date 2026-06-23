import { argv, exit, readJsonOption, readListOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import {
  activateSwarm,
  addTasks,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  getMemoryView,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
  listMemoriesView,
  listSwarmsView,
  queueSwarmTasks,
  searchMemoriesView,
  storeMemoryMutation,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  syncSwarmStatus,
  updateSwarmMutation,
  validateSwarm
} from "./state-runtime.js";

function handleMemoryStore() {
  const content = requireOption("--content");
  const memory = storeMemoryMutation({
    namespace: readOption("--namespace"),
    kind: readOption("--kind"),
    title: readOption("--title"),
    agent: readOption("--agent"),
    tags: readListOption("--tags"),
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
  write(
    JSON.stringify(
      {
        memories: listMemoriesView({
          namespace: readOption("--namespace"),
          kind: readOption("--kind"),
          agent: readOption("--agent"),
          tags: readListOption("--tags")
        })
      },
      null,
      2
    ) + "\n"
  );
}

function handleMemorySearch() {
  const query = requireOption("--query");
  const limit = Number(readOption("--limit") ?? "10");
  const results = searchMemoriesView(
    query,
    {
      namespace: readOption("--namespace"),
      kind: readOption("--kind"),
      agent: readOption("--agent"),
      tags: readListOption("--tags")
    },
    limit
  );

  write(JSON.stringify(results, null, 2) + "\n");
}

export {
  handleMemoryStore,
  handleMemoryGet,
  handleMemoryList,
  handleMemorySearch
};
