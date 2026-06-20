import {
  PACKAGE_VERSION,
  PRODUCT_NAME,
  getCommandCatalog,
  getCommandCatalogView,
  getCoordinationOverview,
  getCoordinationOverviewView,
  getMcpCommandCatalog,
  getMcpCommandCatalogView,
  getPackageMetadata,
  getPackageMetadataView,
  handleMcpRequest,
  getCapabilityCatalog,
  getCapabilityCatalogView,
  getRuntimeCatalog,
  getRuntimeCatalogPaths,
  getRuntimeCatalogView,
  getRuntimeContractView,
  getRuntimeDoctorView,
  getRuntimeReadyView,
  getRuntimeStatus,
  getRuntimeStatusView,
  getToolCatalogView,
  getWorkerGuidelines,
  getWorkerGuidelinesView,
  listAgentCatalog,
  planSwarm,
  planTask,
  renderHelpText as renderHelpTextRoot,
  queueTasksFromPlan,
  listAgentRoleIds,
  listMcpTools,
  listSkillCatalog,
  runMcpCli,
  addTask,
  startMcpServer,
  callMcpTool,
  getTask,
  getTaskView,
  initSwarm,
  getSwarm,
  getSwarmView,
  listMemoriesView,
  listSwarmsView,
  listTasksView,
  searchMemoriesView,
  serializeMcpMessage,
  stateFilePath,
  storeMemory,
  toolCatalog,
  renderMcpHelpText,
  resolveRuntimeCatalogPath,
  validateSwarm,
  validateTask
} from "codex-bees";

import { renderHelpText as renderHelpTextCommands } from "codex-bees/commands";
import { callMcpTool as callMcpToolSubpath, handleMcpRequest as handleMcpRequestSubpath } from "codex-bees/mcp";
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
const rootCommandName: string | undefined = getCommandCatalog()[0]?.command;
const rootHelpTextDirect: string = renderHelpTextRoot();
const rootHelpText: string = renderHelpTextCommands();
const rootExecutionModel: string = getCoordinationOverview().executionModel;
const rootCoordinationViewKind: "coordination_overview_view" = getCoordinationOverviewView().kind;
const rootWorkerGuideline: string = getWorkerGuidelines().fileOwnership;
const rootWorkerGuidelinesKind: "worker_guidelines_view" = getWorkerGuidelinesView().kind;
renderHelpTextCommands();
getMcpCommandCatalog()[0]?.option;
getMcpCommandCatalogView().options[0]?.option;
renderMcpHelpText();
getRuntimeCatalogView().catalog.paths.codexDir;
getRuntimeDoctorView().contract.kind;
getRuntimeReadyView().next[0];
getRuntimeStatusView({ version: metadata.version, toolCount: listMcpTools().length }).kind;
getToolCatalogView().tools[0]?.name;
const rootToolName: string | undefined = toolCatalog[0]?.name;
const rootToolSchemaType: string | undefined = getToolCatalogView().tools[0]?.inputSchema.type as string | undefined;
const rootSwarmPlanWorkers: number = planSwarm("typed root swarm").swarm.maxWorkers;
const serializedMcpMessage: string = serializeMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" });
const rootRunMcpCli: (args?: string[]) => Promise<void> = runMcpCli;
const rootStartMcpServer: () => Promise<void> = startMcpServer;
const plannerHasSrc: boolean = planTask("typed smoke").evidence.repoSignals.hasSrc;
const plannerRolePath: string | undefined = planTask("typed smoke").evidence.roleFiles[0]?.path;

const subpathMcpResult: unknown = handleMcpRequestSubpath({ jsonrpc: "2.0", id: 1, method: "tools/list" }).result;
const subpathMcpToolResult: unknown = callMcpToolSubpath("runtime_contract", {});
const rootMcpResult: unknown = handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" }).result;
const rootMcpToolResult: unknown = callMcpTool("runtime_contract", {});
const rootMcpParams = handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "runtime_contract", arguments: {} } }).id;

const task = addTask({
  title: "typed task",
  owner: "executor",
  verifier: "tester",
  scope: ["src/index.js"],
  acceptance: ["ok"],
  verification: ["ok"]
});
task.id;
const fetchedTaskId: string | undefined = getTask(task.id)?.id;
const taskOwner: string | null | undefined = task.owner;
const taskScopePath: string | undefined = task.scope?.[0];
const taskHistoryType: string | undefined = task.history?.[0]?.type;
const taskAnnotationKind: string | undefined = task.annotations?.[0]?.kind;
getTaskView(task.id)?.task.id;
const taskHasHistory: boolean | undefined = getTaskView(task.id)?.metadata.hasHistory;
const taskReviewState: string | undefined = getTaskView(task.id)?.metadata.reviewState;
validateTask(task.id).recommendedReason;
const taskValidationReady: boolean = validateTask(task.id).ready;
const taskValidationIssueCode: string | undefined = validateTask(task.id).issues[0]?.code;

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
const fetchedSwarmId: string | undefined = getSwarm(swarm.id)?.id;
const swarmOwner: string | null | undefined = swarm.owner;
const swarmTopology: string | undefined = swarm.topology;
const swarmLaneSummary: string | undefined = swarm.lanes?.[0]?.summary;
const swarmLaneTaskId: string | null | undefined = swarm.lanes?.[0]?.taskId;
const swarmMaxWorkers: number | undefined = swarm.maxWorkers;
const swarmCreatedAt: string | null | undefined = swarm.createdAt;
const swarmUpdatedAt: string | null | undefined = swarm.updatedAt;
getSwarmView(swarm.id)?.swarm.id;
const swarmDerivedStatus: string | undefined = getSwarmView(swarm.id)?.metadata.derivedStatus;
const swarmReadyToComplete: boolean | undefined = getSwarmView(swarm.id)?.metadata.readyToComplete;
validateSwarm(swarm.id).recommendedReason;
const swarmValidationReady: boolean = validateSwarm(swarm.id).ready;
const swarmValidationLane: string | undefined = validateSwarm(swarm.id).lanes[0]?.lane;
const swarmValidationOverlapPath: string | undefined = validateSwarm(swarm.id).overlaps[0]?.path;

const typedMemory = storeMemory({ content: "typed memory", namespace: "types", kind: "note", title: "typed", tags: ["types"], agent: "tester" });
typedMemory.id;
const typedMemoryNamespace: string | undefined = typedMemory.namespace;
const typedMemoryTitle: string | null | undefined = typedMemory.title;
const typedMemoryAgent: string | null | undefined = typedMemory.agent;
const typedMemoryTag: string | undefined = typedMemory.tags?.[0];
const typedMemoryCreatedAt: string | null | undefined = typedMemory.createdAt;
const memoryListNamespace: string | undefined = listMemoriesView({ namespace: "types" }).memories[0]?.namespace;
const memoryListTitle: string | null | undefined = listMemoriesView({ namespace: "types" }).memories[0]?.title;
const memoryListAgent: string | null | undefined = listMemoriesView({ agent: "tester", tags: ["types"] }).memories[0]?.agent;
listTasksView().counts.totalTasks;
const filteredSwarmOwner: string | null | undefined = listSwarmsView({ status: "planned", topology: "bounded-local", owner: "leader" }).swarms[0]?.owner;
const detailedSwarmRecommended: string | undefined = listSwarmsView({ topology: "bounded-local" }, { detailed: true }).swarms[0]?.recommendedReason;
const detailedSwarmDerivedStatus: string | undefined = listSwarmsView({ owner: "leader" }, { detailed: true }).swarms[0]?.derivedStatus;
listSwarmsView({ status: "planned" }, { detailed: true }).counts.totalSwarms;
listMemoriesView({ namespace: "types" }).counts.totalMemories;
searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5);
stateFilePath();

const apiMetadataProduct: string = getApiPackageMetadata().product;
const packageMetadataViewKind: "package_metadata_view" = getPackageMetadataView().kind;
const packageMetadataViewMode: string = getPackageMetadataView().metadata.mode;
const productName: string = PRODUCT_NAME;
const packageVersion: string = PACKAGE_VERSION;
const rootCapabilityCatalogViewKind: "runtime_capabilities_view" = getCapabilityCatalogView().kind;
const rootAgentId: string | undefined = listAgentCatalog()[0]?.id;
const rootAgentRoleId: string | undefined = listAgentRoleIds()[0];
const rootSkillId: string | undefined = listSkillCatalog()[0]?.id;
const rootCatalogSource: string = getRuntimeCatalog().source;
const runtimeCatalogSource: string = getRuntimeCatalogPaths().source;
const resolvedSkillPath: string | null = resolveRuntimeCatalogPath("skills");
const rootRuntimeContractKind: "runtime_contract_view" = getRuntimeContractView().kind;
const rootRuntimeStatusProduct: string = getRuntimeStatus({ version: metadata.version, toolCount: listMcpTools().length }).product;
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
const queuedPlanKind: "queued_plan" = queueTasksFromPlan("typed queued plan", (tasks) => tasks as ReturnType<typeof addTask>[]).kind;
const memorySearchQuery: string = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).query;
const memorySearchScore: number | undefined = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).results[0]?.score;
const memorySearchNamespace: string | undefined = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).results[0]?.namespace;
