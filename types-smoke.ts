import {
  PACKAGE_VERSION,
  PRODUCT_NAME,
  getCommandCatalog,
  getCommandCatalogEntry,
  getCommandHelpView,
  getCommandCatalogView,
  getInitCommandCatalog,
  getInitCommandCatalogEntry,
  getInitHelpView,
  getCoordinationOverview,
  getCoordinationOverviewView,
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogView,
  getMcpHelpView,
  getMcpToolEntry,
  getMcpToolView,
  getPackageMetadata,
  getPackageMetadataView,
  handleMcpRequest,
  getCapabilityCatalog,
  getCapabilityCatalogEntry,
  getCapabilityCatalogEntryView,
  getCapabilityCatalogView,
  getAgentCatalogEntry,
  getAgentCatalogEntryView,
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
  renderCommandHelpText,
  renderInitHelpText,
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
  getSkillCatalogEntry,
  validateSwarm,
  validateTask,
  type TaskReviewState,
  type SwarmStatus
} from "codex-bees";

import { renderHelpText as renderHelpTextCommands } from "codex-bees/commands";
import { initWorkspace as initWorkspaceSubpath, previewWorkspaceInit as previewWorkspaceInitSubpath } from "codex-bees/init";
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
const commandCatalogReason: "command_catalog_loaded" | "command_catalog_empty" = getCommandCatalogView().recommendedReason;
const initCatalogEntry: string | undefined = getCommandCatalogEntry("init")?.command;
const initCommandHelpReason: "command_help_loaded" | "command_help_fallback_loaded" = getCommandHelpView("init").recommendedReason;
const initCommandHelpMatched: string | null = getCommandHelpView("init").matchedCommand;
const initOptionEntry: string | undefined = getInitCommandCatalogEntry("--preview")?.option;
const initCommandOptions: string | undefined = getInitCommandCatalog()[0]?.option;
const initHelpReason: "init_help_loaded" | "init_help_fallback_loaded" = getInitHelpView("--preview").recommendedReason;
const initHelpMatched: string | null = getInitHelpView("--preview").matchedOption;
const rootCommandName: string | undefined = getCommandCatalog()[0]?.command;
const initHelpTextByCommand: string = renderCommandHelpText("init");
const rootHelpTextDirect: string = renderHelpTextRoot();
const initHelpText: string = renderInitHelpText();
const initPreviewSubpathReason: "init_changes_required" | "init_already_applied" = previewWorkspaceInitSubpath({ targetDirectory: "typed-init-preview" }).recommendedReason;
const initAppliedSubpathKind: "workspace_init_result" = initWorkspaceSubpath({ targetDirectory: "typed-init-apply" }).kind;
const initPreviewSummaryHasChanges: boolean = previewWorkspaceInitSubpath({ targetDirectory: "typed-init-preview-2" }).summary.hasChanges;
const initResultSummaryCreated: number = initWorkspaceSubpath({ targetDirectory: "typed-init-apply-2" }).summary.created;
const rootHelpText: string = renderHelpTextCommands();
const rootExecutionModel: "local bounded multi-agent coordination" = getCoordinationOverview().executionModel;
const rootDeliveryBoundary: "codex-only runtime" = getCoordinationOverview().deliveryBoundary;
const rootChangeModel: "small reversible steps" = getCoordinationOverview().changeModel;
const rootCoordinationViewKind: "coordination_overview_view" = getCoordinationOverviewView().kind;
const coordinationViewReason: "coordination_model_loaded" = getCoordinationOverviewView().recommendedReason;
const rootWorkerGuideline: "one active writer per file" = getWorkerGuidelines().fileOwnership;
const rootWorkerParallelism: "parallelize only with disjoint ownership" = getWorkerGuidelines().parallelism;
const rootWorkerValidationStep:
  | "targeted verification"
  | "fresh evidence"
  | "handoff discipline"
  | undefined = getWorkerGuidelines().validation[0];
const rootWorkerGuidelinesKind: "worker_guidelines_view" = getWorkerGuidelinesView().kind;
const workerGuidelinesReason: "worker_guidelines_loaded" = getWorkerGuidelinesView().recommendedReason;
renderHelpTextCommands();
getMcpCommandCatalog()[0]?.option;
const mcpCatalogEntry: string | undefined = getMcpCommandCatalogEntry("--tools")?.option;
getMcpCommandCatalogView().options[0]?.option;
const mcpCommandCatalogReason: "mcp_command_catalog_loaded" | "mcp_command_catalog_empty" = getMcpCommandCatalogView().recommendedReason;
const mcpHelpReason: "mcp_help_loaded" | "mcp_help_fallback_loaded" = getMcpHelpView("--tools").recommendedReason;
const mcpHelpMatched: string | null = getMcpHelpView("--tools").matchedOption;
renderMcpHelpText();
getRuntimeCatalogView().catalog.paths.codexDir;
const runtimeCatalogReason: "catalog_entries_loaded" | "catalog_empty" = getRuntimeCatalogView().recommendedReason;
getRuntimeDoctorView().contract.kind;
const runtimeDoctorReason: "doctor_ready" | "doctor_entry_missing" = getRuntimeDoctorView().recommendedReason;
const runtimeDoctorStatus: "ok" = getRuntimeDoctorView().status;
const runtimeReadyReason: "runtime_entry_ready" = getRuntimeReadyView().recommendedReason;
const runtimeReadyStatus: "ready" = getRuntimeReadyView().status;
getRuntimeReadyView().next[0];
getRuntimeStatusView({ version: metadata.version, toolCount: listMcpTools().length }).kind;
const runtimeStatusReason: "runtime_state_visible" | "runtime_state_empty" = getRuntimeStatusView({ version: metadata.version, toolCount: listMcpTools().length }).recommendedReason;
getToolCatalogView().tools[0]?.name;
const toolCatalogReason: "tool_catalog_loaded" | "tool_catalog_empty" = getToolCatalogView().recommendedReason;
const rootMcpToolEntryName: string | undefined = getMcpToolEntry("runtime_contract")?.name;
const rootMcpToolViewReason: "mcp_tool_loaded" | "mcp_tool_missing" = getMcpToolView("runtime_contract").recommendedReason;
const rootMcpToolViewMatched: string | null = getMcpToolView("runtime_contract").matchedTool;
const rootToolName: string | undefined = toolCatalog[0]?.name;
const rootToolSchemaType: string | undefined = getToolCatalogView().tools[0]?.inputSchema.type as string | undefined;
const plannedSwarmReason: "multi_lane_swarm_ready" | "single_lane_swarm_ready" = planSwarm("typed root swarm").recommendedReason;
const rootSwarmPlanWorkers: number = planSwarm("typed root swarm").swarm.maxWorkers;
const rootSwarmPlanTopology: "bounded-local" = planSwarm("typed root swarm").swarm.topology;
const rootSwarmPlanLaneSource: "planner" = planSwarm("typed root swarm").swarm.laneSource;
const serializedMcpMessage: string = serializeMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" });
const rootRunMcpCli: (args?: string[]) => Promise<void> = runMcpCli;
const rootStartMcpServer: () => Promise<void> = startMcpServer;
const taskPlanReason: "multi_lane_plan_ready" | "single_lane_plan_ready" = planTask("typed smoke").recommendedReason;
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
const taskCreatedAt: string | null | undefined = task.createdAt;
const taskUpdatedAt: string | null | undefined = task.updatedAt;
const taskHistoryType: string | undefined = task.history?.[0]?.type;
const taskAnnotationKind: string | undefined = task.annotations?.[0]?.kind;
const taskDetailReason: "task_detail_loaded" | undefined = getTaskView(task.id)?.recommendedReason;
getTaskView(task.id)?.task.id;
const taskHasHistory: boolean | undefined = getTaskView(task.id)?.metadata.hasHistory;
const taskReviewState: TaskReviewState | undefined = getTaskView(task.id)?.metadata.reviewState;
const taskValidationReason:
  | "task_ready_to_claim"
  | "task_role_validation_issues_present"
  | "claimed_task_metadata_incomplete"
  | "task_validation_issues_present"
  | "task_validation_visible"
  | undefined = validateTask(task.id)?.recommendedReason;
const taskValidationReady: boolean | undefined = validateTask(task.id)?.ready;
const taskValidationIssueCode: string | undefined = validateTask(task.id)?.issues[0]?.code;

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
const swarmStatus: SwarmStatus | undefined = getSwarm(swarm.id)?.status;
const swarmOwner: string | null | undefined = swarm.owner;
const swarmTopology: string | undefined = swarm.topology;
const swarmLaneSummary: string | undefined = swarm.lanes?.[0]?.summary;
const swarmLaneTaskId: string | null | undefined = swarm.lanes?.[0]?.taskId;
const swarmMaxWorkers: number | undefined = swarm.maxWorkers;
const swarmCreatedAt: string | null | undefined = swarm.createdAt;
const swarmUpdatedAt: string | null | undefined = swarm.updatedAt;
getSwarmView(swarm.id)?.swarm.id;
const swarmDetailReason: "swarm_detail_loaded" | undefined = getSwarmView(swarm.id)?.recommendedReason;
const swarmDerivedStatus: SwarmStatus | undefined = getSwarmView(swarm.id)?.metadata.derivedStatus;
const swarmReadyToComplete: boolean | undefined = getSwarmView(swarm.id)?.metadata.readyToComplete;
const swarmValidationReason:
  | "swarm_ready_to_queue"
  | "swarm_scope_overlap_detected"
  | "lane_validation_issues_present"
  | "swarm_validation_issues_present"
  | "swarm_validation_visible"
  | undefined = validateSwarm(swarm.id)?.recommendedReason;
const swarmValidationReady: boolean | undefined = validateSwarm(swarm.id)?.ready;
const swarmValidationLane: string | undefined = validateSwarm(swarm.id)?.lanes[0]?.lane;
const swarmValidationOverlapPath: string | undefined = validateSwarm(swarm.id)?.overlaps[0]?.path;

const typedMemory = storeMemory({ content: "typed memory", namespace: "types", kind: "note", title: "typed", tags: ["types"], agent: "tester" });
typedMemory.id;
const typedMemoryNamespace: string | undefined = typedMemory.namespace;
const typedMemoryTitle: string | null | undefined = typedMemory.title;
const typedMemoryAgent: string | null | undefined = typedMemory.agent;
const typedMemoryTag: string | undefined = typedMemory.tags?.[0];
const typedMemoryCreatedAt: string | null | undefined = typedMemory.createdAt;
const typedMemoryUpdatedAt: string | null | undefined = typedMemory.updatedAt;
const memoryListNamespace: string | undefined = listMemoriesView({ namespace: "types" }).memories[0]?.namespace;
const memoryListTitle: string | null | undefined = listMemoriesView({ namespace: "types" }).memories[0]?.title;
const memoryListAgent: string | null | undefined = listMemoriesView({ agent: "tester", tags: ["types"] }).memories[0]?.agent;
const memoryListReason: "memory_list_has_results" | "memory_list_empty" = listMemoriesView({ namespace: "types" }).recommendedReason;
const taskListReason: "task_list_has_results" | "task_list_empty" = listTasksView().recommendedReason;
listTasksView().counts.totalTasks;
const filteredSwarmOwner: string | null | undefined = listSwarmsView({ status: "planned", topology: "bounded-local", owner: "leader" }).swarms[0]?.owner;
const swarmListReason: "swarm_list_has_results" | "swarm_list_empty" = listSwarmsView({ status: "planned" }).recommendedReason;
const detailedSwarmRecommended:
  | "swarm_ready_to_complete"
  | "review_lane_waiting"
  | "blocked_lanes_present"
  | "dispatch_lane_ready"
  | "claimed_lane_active"
  | "planned_lanes_unqueued"
  | "swarm_state_visible"
  | undefined = listSwarmsView({ topology: "bounded-local" }, { detailed: true }).swarms[0]?.recommendedReason;
const detailedSwarmDerivedStatus: SwarmStatus | undefined = listSwarmsView({ owner: "leader" }, { detailed: true }).swarms[0]?.derivedStatus;
listSwarmsView({ status: "planned" }, { detailed: true }).counts.totalSwarms;
listMemoriesView({ namespace: "types" }).counts.totalMemories;
searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5);
stateFilePath();

const apiMetadataProduct: "codex-bees" = getApiPackageMetadata().product;
const apiMetadataMode: "codex-only" = getApiPackageMetadata().mode;
const apiMetadataVersion: "0.1.0" = getApiPackageMetadata().version;
const apiMetadataLicense: "MIT" = getApiPackageMetadata().license;
const apiMetadataDescription: "Codex-native multi-agent runtime for explicit local orchestration." = getApiPackageMetadata().description;
const apiMetadataHomepage: "https://github.com/izumi0uu/codex-bees#readme" = getApiPackageMetadata().homepage;
const apiMetadataBugsUrl: "https://github.com/izumi0uu/codex-bees/issues" = getApiPackageMetadata().bugsUrl;
const packageMetadataViewKind: "package_metadata_view" = getPackageMetadataView().kind;
const packageMetadataReason: "package_metadata_loaded" = getPackageMetadataView().recommendedReason;
const packageMetadataViewMode: string = getPackageMetadataView().metadata.mode;
const productName: "codex-bees" = PRODUCT_NAME;
const packageVersion: "0.1.0" = PACKAGE_VERSION;
const rootCapabilityCatalogViewKind: "runtime_capabilities_view" = getCapabilityCatalogView().kind;
const runtimeCapabilitiesReason: "capabilities_loaded" | "capabilities_empty" = getCapabilityCatalogView().recommendedReason;
const rootCapabilityEntryId: string | undefined = getCapabilityCatalogEntry("runtime_catalog")?.id;
const rootCapabilityViewReason: "runtime_capability_loaded" | "runtime_capability_missing" = getCapabilityCatalogEntryView("runtime_catalog").recommendedReason;
const rootCapabilityViewMatched: string | null = getCapabilityCatalogEntryView("runtime_catalog").matchedCapability;
const rootAgentId: string | undefined = listAgentCatalog()[0]?.id;
const rootAgentEntryId: string | undefined = getAgentCatalogEntry("executor")?.id;
const rootAgentViewReason: "catalog_entry_loaded" | "catalog_entry_missing" = getAgentCatalogEntryView("executor").recommendedReason;
const rootAgentViewMatched: string | null = getAgentCatalogEntryView("executor").matchedId;
const rootAgentRoleId: string | undefined = listAgentRoleIds()[0];
const rootSkillId: string | undefined = listSkillCatalog()[0]?.id;
const rootSkillEntryId: string | undefined = getSkillCatalogEntry("project-development")?.id;
const rootCatalogSource: "workspace" | "bundled" | "missing" = getRuntimeCatalog().source;
const runtimeCatalogSource: "workspace" | "bundled" | "missing" = getRuntimeCatalogPaths().source;
const resolvedSkillPath: string | null = resolveRuntimeCatalogPath("skills");
const rootRuntimeContractKind: "runtime_contract_view" = getRuntimeContractView().kind;
const runtimeContractReason: "contract_loaded" = getRuntimeContractView().recommendedReason;
const rootRuntimeContractProduct: "codex-bees" = getRuntimeContractView().contract.product;
const rootRuntimeContractMode: "codex-only" = getRuntimeContractView().contract.mode;
const rootRuntimeContractBoundary: "codex-only runtime" = getRuntimeContractView().contract.deliveryBoundary;
const rootRuntimeContractCliTransport: "stdio" = getRuntimeContractView().contract.transport.cli;
const rootRuntimeContractMcpTransport: "stdio-jsonrpc" = getRuntimeContractView().contract.transport.mcp;
const rootRuntimeStatusMode: "codex-only" = getRuntimeStatus({ version: metadata.version, toolCount: listMcpTools().length }).mode;
const rootRuntimeStatusProduct: "codex-bees" = getRuntimeStatus({ version: metadata.version, toolCount: listMcpTools().length }).product;
const apiReadyKind: "runtime_ready_view" = getApiRuntimeReadyView().kind;
const apiToolName: string | undefined = getApiToolCatalogView().tools[0]?.name;
const catalogSource: "workspace" | "bundled" | "missing" = getCatalogSubpathView().catalog.source;
const catalogSubpathKind: "runtime_catalog_view" = getCatalogSubpathView().kind;
const catalogSubpathReason: "catalog_entries_loaded" | "catalog_empty" = getCatalogSubpathView().recommendedReason;
const contractSubpathKind: "runtime_contract_view" = getContractSubpathView().kind;
const contractProduct: "codex-bees" = getContractSubpathView().contract.product;
const contractArchitectureLayer:
  | "cli"
  | "mcp"
  | "skills"
  | "agents"
  | "docs"
  | undefined = getContractSubpathView().contract.architecture[0];
const contractBoundary: "codex-only runtime" = getContractSubpathView().contract.deliveryBoundary;
const contractMode: "codex-only" = getContractSubpathView().contract.mode;
const capabilityId:
  | "cli_runtime"
  | "mcp_runtime"
  | "planning"
  | "task_coordination"
  | "verifier_review"
  | "leader_orchestration"
  | "swarm_coordination"
  | "memory"
  | "runtime_catalog"
  | undefined = getCapabilityCatalog()[0]?.id;
const capabilityCliEntry:
  | "leader:assignment-launch-plan"
  | "leader:assignment-dispatch-bundle"
  | "leader:workspace"
  | "status"
  | "capabilities"
  | "runtime:summary-pack"
  | "runtime:queue-pack"
  | undefined = getCapabilityCatalog()[0]?.preferredEntryPoints.cli[0];
const capabilityMcpEntry:
  | "leader_assignment_launch_plan"
  | "leader_assignment_dispatch_bundle"
  | "leader_workspace"
  | "runtime_status"
  | "runtime_capabilities"
  | "runtime_summary_pack"
  | "runtime_queue_pack"
  | undefined = getCapabilityCatalog()[0]?.preferredEntryPoints.mcp[0];
const capabilityCategory: "runtime" | "planning" | "coordination" | "memory" | "introspection" = getCapabilityCatalog()[0]?.category ?? "runtime";
const statusSubpathKind: "runtime_status_view" = getStatusSubpathView().kind;
const statusSubpathReason: "runtime_state_visible" | "runtime_state_empty" = getStatusSubpathView().recommendedReason;
const statusProduct: "codex-bees" = getStatusSubpathView().status.product;
const statusMode: "codex-only" = getStatusSubpathView().status.mode;
const statusCapabilityId:
  | "cli_runtime"
  | "mcp_runtime"
  | "planning"
  | "task_coordination"
  | "verifier_review"
  | "leader_orchestration"
  | "swarm_coordination"
  | "memory"
  | "runtime_catalog"
  | undefined = getStatusSubpathView().status.capabilities[0]?.id;
const statusCliEntry:
  | "leader:assignment-launch-plan"
  | "leader:assignment-dispatch-bundle"
  | "leader:workspace"
  | "status"
  | "capabilities"
  | "runtime:summary-pack"
  | "runtime:queue-pack"
  | undefined = getStatusSubpathView().status.recommendedEntryPoints.cli[0];
const plannerLane: string | undefined = planTaskSubpath("typed downstream planner").lanes[0]?.lane;
const swarmLane: string | undefined = planSwarmSubpath("typed downstream swarm").swarm.lanes[0]?.lane;
const swarmWorkers: number = planSwarmSubpath("typed downstream swarm").swarm.maxWorkers;
const plannedSwarmTopology: "bounded-local" = planSwarmSubpath("typed downstream swarm").swarm.topology;
const plannedSwarmLaneSource: "planner" = planSwarmSubpath("typed downstream swarm").swarm.laneSource;
const queuedPlanKind: "queued_plan" = queueTasksFromPlan("typed queued plan", (tasks) => tasks as ReturnType<typeof addTask>[]).kind;
const queuedPlanReason: "multiple_plan_tasks_queued" | "single_plan_task_queued" = queueTasksFromPlan("typed queued plan", (tasks) => tasks as ReturnType<typeof addTask>[]).recommendedReason;
const memorySearchReason: "memory_search_has_results" | "memory_search_empty" = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).recommendedReason;
const memorySearchQuery: string = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).query;
const memorySearchScore: number | undefined = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).results[0]?.score;
const memorySearchNamespace: string | undefined = searchMemoriesView("typed", { namespace: "types", agent: "tester", tags: ["types"] }, 5).results[0]?.namespace;
