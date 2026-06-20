export interface PackageMetadata {
  product: string;
  version: string;
  description: string;
  license: string;
  homepage: string | null;
  bugsUrl: string | null;
  repositoryUrl: string | null;
  keywords: string[];
  mode: string;
}

export interface PackageMetadataView {
  kind: "package_metadata_view";
  recommendedReason: string;
  metadata: PackageMetadata;
}

export interface CommandCatalogEntry {
  command: string;
  description: string;
  options?: McpCommandCatalogEntry[];
}

export interface McpCommandCatalogEntry {
  option: string;
  description: string;
}

export interface CommandCatalogView {
  kind: "command_catalog_view";
  recommendedReason: string;
  counts: {
    totalCommands: number;
  };
  commands: CommandCatalogEntry[];
}

export interface McpCommandCatalogView {
  kind: "mcp_command_catalog_view";
  recommendedReason: string;
  counts: {
    totalOptions: number;
  };
  options: McpCommandCatalogEntry[];
}

export interface RuntimeCatalogEntry {
  id: string;
  name: string;
  description: string | null;
  path: string;
  source: string;
}

export interface RuntimeCatalogPaths {
  source: string;
  workingDirectory: string;
  packageRoot: string;
  codexDir: string;
  agentDir: string;
  skillDir: string;
}

export interface RuntimeCatalog {
  source: string;
  paths: {
    codexDir: string;
    agentDir: string;
    skillDir: string;
  };
  agents: RuntimeCatalogEntry[];
  skills: RuntimeCatalogEntry[];
}

export interface RuntimeCatalogView {
  kind: "runtime_catalog_view";
  recommendedReason: string;
  counts: {
    agents: number;
    skills: number;
    totalEntries: number;
  };
  catalog: RuntimeCatalog;
}

export interface RuntimeContractView {
  kind: "runtime_contract_view";
  recommendedReason: string;
  counts: Record<string, number>;
  contract: RuntimeContract;
}

export interface RuntimeDoctorView {
  kind: "runtime_doctor_view";
  recommendedReason: string;
  status: string;
  executable: boolean;
  entry: string;
  stateFile: string;
  catalog: RuntimeCatalogView;
  contract: RuntimeContractView;
}

export interface RuntimeReadyView {
  kind: "runtime_ready_view";
  recommendedReason: string;
  status: string;
  counts: {
    nextSteps: number;
  };
  contract: RuntimeContractView;
  next: string[];
}

export interface CoordinationOverview {
  executionModel: string;
  deliveryBoundary: string;
  changeModel: string;
}

export interface CoordinationOverviewView {
  kind: "coordination_overview_view";
  recommendedReason: string;
  counts: {
    facets: number;
  };
  overview: CoordinationOverview;
}

export interface WorkerGuidelines {
  fileOwnership: string;
  parallelism: string;
  validation: string[];
}

export interface WorkerGuidelinesView {
  kind: "worker_guidelines_view";
  recommendedReason: string;
  counts: {
    ruleSections: number;
    validationSteps: number;
  };
  guidelines: WorkerGuidelines;
}

export interface RuntimeStatusView {
  kind: "runtime_status_view";
  recommendedReason: string;
  counts: RuntimeStatusCounts & {
    trackedStateEntries: number;
  };
  status: RuntimeStatus;
}

export interface RuntimeCapabilitiesView {
  kind: "runtime_capabilities_view";
  recommendedReason: string;
  counts: {
    totalCapabilities: number;
    categories: Record<string, number>;
  };
  capabilities: RuntimeCapabilitySummary[];
}

export interface TaskPlanLane {
  lane: string;
  owner: string;
  verifier: string;
  summary: string;
  scope: string[];
  acceptance: string[];
  verification: string[];
}

export interface TaskPlan {
  kind: "task_plan";
  recommendedReason: string;
  objective: string;
  evidence: Record<string, unknown>;
  lanes: TaskPlanLane[];
}

export interface PlannedSwarm {
  kind: "planned_swarm";
  recommendedReason: string;
  objective: string;
  evidence: Record<string, unknown>;
  swarm: PlannedSwarmShape;
}

export interface QueuedPlan {
  kind: "queued_plan";
  recommendedReason: string;
  objective: string;
  lanes: TaskPlanLane[];
  created: TaskRecord[];
}

export interface RuntimeContract {
  product: string;
  mode: string;
  deliveryBoundary: string;
  workingDirectory: string;
  node: string;
  architecture: string[];
  transport: {
    cli: string;
    mcp: string;
  };
  responsibilities: string[];
  exclusions: string[];
}

export interface RuntimeCapabilitySummary {
  id: string;
  category: string;
  cliCommandCount: number;
  mcpToolCount: number;
  highlights: string[];
  preferredEntryPoints: {
    cli: string[];
    mcp: string[];
  };
  useCases: string[];
}

export interface RuntimeCapability {
  id: string;
  category: string;
  description: string;
  cliCommands: string[];
  mcpTools: string[];
  highlights: string[];
  preferredEntryPoints: {
    cli: string[];
    mcp: string[];
  };
  useCases: string[];
}

export interface RuntimeStatusCounts {
  tools: number;
  agents: number;
  skills: number;
  capabilities: number;
  tasks: number;
  swarms: number;
  memories: number;
}

export interface RuntimeStatus {
  product: string;
  version: string;
  mode: string;
  counts: RuntimeStatusCounts;
  state: {
    taskQueueStatuses: Record<string, number>;
    swarmStatuses: Record<string, number>;
    memoryNamespaces: Record<string, number>;
  };
  highlights: string[];
  recommendedEntryPoints: {
    cli: string[];
    mcp: string[];
  };
  useCases: string[];
  catalog: RuntimeCatalog;
  capabilities: RuntimeCapabilitySummary[];
}

export interface PlannedSwarmShape {
  objective: string;
  topology: string;
  maxWorkers: number;
  laneSource: string;
  lanes: TaskPlanLane[];
  notes: string;
}

export interface ToolCatalogEntry {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCatalogView {
  kind: "tool_catalog_view";
  recommendedReason: string;
  counts: {
    totalTools: number;
    groups: Record<string, number>;
  };
  tools: ToolCatalogEntry[];
}

export interface McpMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface TaskRecord {
  id: string;
  title?: string;
  owner?: string | null;
  verifier?: string | null;
  status?: string;
  queueStatus?: string;
  [key: string]: unknown;
}

export interface SwarmRecord {
  id: string;
  objective?: string;
  status?: string;
  [key: string]: unknown;
}

export interface MemoryRecord {
  id: string;
  title?: string | null;
  content?: string;
  namespace?: string;
  kind?: string;
  agent?: string | null;
  tags?: string[];
  notes?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface TaskListView {
  kind: "task_view";
  recommendedReason: string;
  counts: {
    totalTasks: number;
  };
  tasks: TaskRecord[];
}

export interface TaskDetailView {
  kind: "task_detail";
  recommendedReason: string;
  metadata: Record<string, unknown>;
  task: TaskRecord;
}

export interface SwarmListView {
  kind: "swarm_view";
  recommendedReason: string;
  detailed?: boolean;
  counts: {
    totalSwarms: number;
  };
  swarms: SwarmRecord[];
}

export interface SwarmDetailView {
  kind: "swarm_detail";
  recommendedReason: string;
  metadata: Record<string, unknown>;
  swarm: SwarmRecord;
}

export interface MemoryListView {
  kind: "memory_view";
  recommendedReason: string;
  counts: {
    totalMemories: number;
  };
  memories: MemoryRecord[];
}

export interface MemorySearchResult extends MemoryRecord {
  score: number;
}

export interface MemorySearchView {
  kind: "memory_search_view";
  recommendedReason: string;
  counts: {
    totalResults: number;
  };
  query: string;
  results: MemorySearchResult[];
}

export interface ValidationView {
  ready?: boolean;
  recommendedReason?: string;
  [key: string]: unknown;
}

export declare const PRODUCT_NAME: string;
export declare const PACKAGE_VERSION: string;
export declare const toolCatalog: ToolCatalogEntry[];

export declare function getPackageMetadata(): PackageMetadata;
export declare function getPackageMetadataView(): PackageMetadataView;

export declare function getCommandCatalog(): CommandCatalogEntry[];
export declare function getCommandCatalogView(): CommandCatalogView;
export declare function renderHelpText(): string;
export declare function getMcpCommandCatalog(): McpCommandCatalogEntry[];
export declare function getMcpCommandCatalogView(): McpCommandCatalogView;
export declare function renderMcpHelpText(): string;

export declare function getRuntimeCatalogPaths(): RuntimeCatalogPaths;
export declare function resolveRuntimeCatalogPath(relativePath: string): string | null;
export declare function listAgentCatalog(): RuntimeCatalogEntry[];
export declare function listAgentRoleIds(): string[];
export declare function listSkillCatalog(): RuntimeCatalogEntry[];
export declare function getRuntimeCatalog(): RuntimeCatalog;
export declare function getRuntimeCatalogView(): RuntimeCatalogView;

export declare function getRuntimeContractView(): RuntimeContractView;
export declare function getRuntimeDoctorView(entryUrl?: string): RuntimeDoctorView;
export declare function getRuntimeReadyView(): RuntimeReadyView;

export declare function getCoordinationOverview(): CoordinationOverview;
export declare function getCoordinationOverviewView(): CoordinationOverviewView;
export declare function getWorkerGuidelines(): WorkerGuidelines;
export declare function getWorkerGuidelinesView(): WorkerGuidelinesView;

export declare function getCapabilityCatalog(): RuntimeCapability[];
export declare function getCapabilityCatalogView(): RuntimeCapabilitiesView;
export declare function getRuntimeStatus(input?: { version?: string; toolCount?: number }): RuntimeStatus;
export declare function getRuntimeStatusView(input?: { version?: string; toolCount?: number }): RuntimeStatusView;

export declare function planTask(task: string): TaskPlan;
export declare function planSwarm(task: string): PlannedSwarm;
export declare function queueTasksFromPlan(task: string, addTasksFn?: (...args: any[]) => any): QueuedPlan;

export declare function listMcpTools(): ToolCatalogEntry[];
export declare function getToolCatalogView(): ToolCatalogView;
export declare function handleMcpRequest(message: McpMessage): McpResponse;
export declare function callMcpTool(name: string, args?: Record<string, unknown>): any;
export declare function serializeMcpMessage(message: Record<string, unknown>): string;
export declare function runMcpCli(args?: string[]): Promise<void>;
export declare function startMcpServer(): Promise<void>;

export declare function addTask(input: Record<string, unknown>): TaskRecord;
export declare function getTask(id: string): TaskRecord | null;
export declare function getTaskView(id: string): TaskDetailView | null;
export declare function initSwarm(input: Record<string, unknown>): SwarmRecord;
export declare function getSwarm(id: string): SwarmRecord | null;
export declare function getSwarmView(id: string): SwarmDetailView | null;
export declare function listTasksView(): TaskListView;
export declare function listSwarmsView(filters?: Record<string, unknown>, options?: Record<string, unknown>): SwarmListView;
export declare function listMemoriesView(filters?: Record<string, unknown>): MemoryListView;
export declare function searchMemoriesView(query: string, filters?: Record<string, unknown>, limit?: number): MemorySearchView;
export declare function storeMemory(input: Record<string, unknown>): MemoryRecord;
export declare function validateTask(id: string): ValidationView;
export declare function validateSwarm(id: string): ValidationView;
export declare function stateFilePath(): string;
