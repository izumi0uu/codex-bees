import {
  getCommandCatalogView,
  getMcpCommandCatalog,
  getMcpCommandCatalogView,
  getPackageMetadata,
  getCapabilityCatalog,
  getRuntimeCatalogView,
  getRuntimeDoctorView,
  getRuntimeReadyView,
  getRuntimeStatusView,
  getToolCatalogView,
  planTask,
  queueTasksFromPlan,
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
  renderMcpHelpText,
  validateSwarm,
  validateTask
} from "codex-bees";

import { renderHelpText } from "codex-bees/commands";
import { callMcpTool, handleMcpRequest } from "codex-bees/mcp";
import {
  getPackageMetadata as getApiPackageMetadata,
  getRuntimeReadyView as getApiRuntimeReadyView,
  getToolCatalogView as getApiToolCatalogView
} from "codex-bees/api";
import { getRuntimeCatalogView as getCatalogSubpathView } from "codex-bees/catalog";
import { getRuntimeContractView as getContractSubpathView } from "codex-bees/runtime-contract";
import { planSwarm as planSwarmSubpath, planTask as planTaskSubpath } from "codex-bees/planner";
import { getRuntimeStatusView as getStatusSubpathView } from "codex-bees/runtime-status";

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
getCommandCatalogView().commands.find((entry) => entry.command === "mcp")?.options?.[0]?.option;
renderHelpText();
getMcpCommandCatalog()[0]?.option;
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

const apiMetadataProduct: string = getApiPackageMetadata().product;
const apiReadyKind: "runtime_ready_view" = getApiRuntimeReadyView().kind;
const apiToolName: string | undefined = getApiToolCatalogView().tools[0]?.name;
const catalogSource: string = getCatalogSubpathView().catalog.source;
const contractMode: string = getContractSubpathView().contract.mode;
const capabilityCategory: string = getCapabilityCatalog()[0]?.category ?? "runtime";
const statusProduct: string = getStatusSubpathView().status.product;
const statusCliEntry: string | undefined = getStatusSubpathView().status.recommendedEntryPoints.cli[0];
const plannerLane: string | undefined = planTaskSubpath("typed downstream planner").lanes[0]?.lane;
const swarmLane: string | undefined = planSwarmSubpath("typed downstream swarm").swarm.lanes[0]?.lane;
const swarmWorkers: number = planSwarmSubpath("typed downstream swarm").swarm.maxWorkers;
const queuedPlanKind: "queued_plan" = queueTasksFromPlan("typed queued plan", (tasks: unknown[]) => tasks as any).kind;
const memorySearchQuery: string = searchMemoriesView("typed", {}, 5).query;
const memorySearchScore: number | undefined = searchMemoriesView("typed", {}, 5).results[0]?.score;
const memorySearchNamespace: string | undefined = searchMemoriesView("typed", {}, 5).results[0]?.namespace;
