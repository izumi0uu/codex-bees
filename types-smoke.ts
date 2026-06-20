import {
  getCommandCatalogView,
  getPackageMetadata,
  getRuntimeCatalogView,
  getRuntimeDoctorView,
  getRuntimeReadyView,
  getRuntimeStatusView,
  getToolCatalogView,
  planTask,
  listMcpTools,
  addTask,
  getTaskView,
  initSwarm,
  getSwarmView,
  listMemoriesView,
  listSwarmsView,
  listTasksView,
  searchMemoriesView,
  stateFilePath,
  storeMemory,
  validateSwarm,
  validateTask
} from "codex-bees";

import { renderHelpText } from "codex-bees/commands";
import { callMcpTool, getMcpCommandCatalogView, handleMcpRequest, renderMcpHelpText } from "codex-bees/mcp";

const metadata = getPackageMetadata();
metadata.product;
metadata.version;
metadata.description;
metadata.license;
metadata.homepage;
metadata.bugsUrl;
metadata.repositoryUrl;
metadata.keywords[0];

getCommandCatalogView().commands[0]?.command;
renderHelpText();
getMcpCommandCatalogView().options[0]?.option;
renderMcpHelpText();
getRuntimeCatalogView().catalog.paths.codexDir;
getRuntimeDoctorView().contract.kind;
getRuntimeReadyView().next[0];
getRuntimeStatusView({ version: metadata.version, toolCount: listMcpTools().length }).kind;
getToolCatalogView().tools[0]?.name;
planTask("typed smoke").lanes[0]?.owner;

handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" }).result;
callMcpTool("runtime_contract");

const task = addTask({
  title: "typed task",
  owner: "executor",
  verifier: "tester",
  scope: ["src/index.js"],
  acceptance: ["ok"],
  verification: ["ok"]
});
task.id;
getTaskView(task.id)?.task.id;
validateTask(task.id).recommendedReason;

const swarm = initSwarm({
  objective: "typed swarm",
  owner: "leader",
  lanes: [
    {
      lane: "lane-1",
      summary: "sum",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["ok"],
      verification: ["ok"]
    }
  ]
});
swarm.id;
getSwarmView(swarm.id)?.swarm.id;
validateSwarm(swarm.id).recommendedReason;

storeMemory({ content: "typed memory", namespace: "types", kind: "note" }).id;
listTasksView().counts.totalTasks;
listSwarmsView({}, { detailed: true }).counts.totalSwarms;
listMemoriesView({ namespace: "types" }).counts.totalMemories;
searchMemoriesView("typed", {}, 5);
stateFilePath();
