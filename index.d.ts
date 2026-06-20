export interface PackageMetadata {
  product: string;
  version: string;
  description: string;
  license: string;
  homepage: string | null;
  bugsUrl: string | null;
  repositoryUrl: string | null;
  keywords: string[];
  mode: "codex-only";
}

export interface PackageMetadataView {
  kind: "package_metadata_view";
  recommendedReason: "package_metadata_loaded";
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
  recommendedReason: "command_catalog_loaded" | "command_catalog_empty";
  counts: {
    totalCommands: number;
  };
  commands: CommandCatalogEntry[];
}

export interface McpCommandCatalogView {
  kind: "mcp_command_catalog_view";
  recommendedReason: "mcp_command_catalog_loaded" | "mcp_command_catalog_empty";
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
  recommendedReason: "catalog_entries_loaded" | "catalog_empty";
  counts: {
    agents: number;
    skills: number;
    totalEntries: number;
  };
  catalog: RuntimeCatalog;
}

export interface RuntimeContractView {
  kind: "runtime_contract_view";
  recommendedReason: "contract_loaded";
  counts: Record<string, number>;
  contract: RuntimeContract;
}

export interface RuntimeDoctorView {
  kind: "runtime_doctor_view";
  recommendedReason: "doctor_ready" | "doctor_entry_missing";
  status: "ok";
  executable: boolean;
  entry: string;
  stateFile: string;
  catalog: RuntimeCatalogView;
  contract: RuntimeContractView;
}

export interface RuntimeReadyView {
  kind: "runtime_ready_view";
  recommendedReason: "runtime_entry_ready";
  status: "ready";
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
  recommendedReason: "coordination_model_loaded";
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
  recommendedReason: "worker_guidelines_loaded";
  counts: {
    ruleSections: number;
    validationSteps: number;
  };
  guidelines: WorkerGuidelines;
}

export interface RuntimeStatusView {
  kind: "runtime_status_view";
  recommendedReason: "runtime_state_visible" | "runtime_state_empty";
  counts: RuntimeStatusCounts & {
    trackedStateEntries: number;
  };
  status: RuntimeStatus;
}

export interface RuntimeCapabilitiesView {
  kind: "runtime_capabilities_view";
  recommendedReason: "capabilities_loaded" | "capabilities_empty";
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

export interface PlannerRoleFileEvidence {
  role: string;
  path: string;
}

export interface PlannerEvidence {
  task: string;
  repoSignals: {
    hasSrc: boolean;
    hasScripts: boolean;
    hasAgents: boolean;
    hasSkills: boolean;
  };
  roleFiles: PlannerRoleFileEvidence[];
}

export interface TaskPlan {
  kind: "task_plan";
  recommendedReason: "multi_lane_plan_ready" | "single_lane_plan_ready";
  objective: string;
  evidence: PlannerEvidence;
  lanes: TaskPlanLane[];
}

export interface PlannedSwarm {
  kind: "planned_swarm";
  recommendedReason: "multi_lane_swarm_ready" | "single_lane_swarm_ready";
  objective: string;
  evidence: PlannerEvidence;
  swarm: PlannedSwarmShape;
}

export interface QueuedPlan {
  kind: "queued_plan";
  recommendedReason: "multiple_plan_tasks_queued" | "single_plan_task_queued";
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
  topology: "bounded-local";
  maxWorkers: number;
  laneSource: "planner";
  lanes: TaskPlanLane[];
  notes: string;
}

export interface ToolCatalogEntry {
  name: string;
  description: string;
  inputSchema: JsonObject;
}

export interface ToolCatalogView {
  kind: "tool_catalog_view";
  recommendedReason: "tool_catalog_loaded" | "tool_catalog_empty";
  counts: {
    totalTools: number;
    groups: Record<string, number>;
  };
  tools: ToolCatalogEntry[];
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

export interface McpMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: JsonObject;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

export type TaskQueueStatus =
  | "queued"
  | "claimed"
  | "blocked"
  | "ready_for_review"
  | "released"
  | "done";

export type SwarmStatus =
  | "planned"
  | "active"
  | "blocked"
  | "completed"
  | "cancelled";

export type TaskReviewState =
  | "pending_verifier"
  | "approved"
  | "changes_requested"
  | "not_started";

export interface TaskHistoryEntry {
  id: string;
  at: string | null;
  type: string;
  fromQueueStatus: TaskQueueStatus | null;
  toQueueStatus: TaskQueueStatus | null;
  actor: string | null;
  notes: string | null;
  evidence: unknown[];
  outcome: string | null;
}

export interface TaskAnnotation {
  id: string;
  at: string | null;
  actor: string | null;
  kind: string;
  content: string;
}

export interface TaskRecord {
  id: string;
  title?: string;
  owner: string | null;
  verifier: string | null;
  status: string;
  queueStatus: TaskQueueStatus;
  objective: string | null;
  lane: string | null;
  swarmId: string | null;
  scope: string[] | null;
  acceptance: string[] | null;
  verification: string[] | null;
  claimedBy: string | null;
  notes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewOutcome: string | null;
  reviewNotes: string | null;
  reviewEvidence: unknown[] | null;
  annotations: TaskAnnotation[];
  history: TaskHistoryEntry[];
  createdAt: string | null;
  updatedAt: string | null;
  [key: string]: unknown;
}

export interface SwarmRecord {
  id: string;
  objective: string;
  status: SwarmStatus;
  topology: string;
  maxWorkers: number;
  owner: string | null;
  laneSource: string;
  lanes: SwarmLaneRecord[];
  queuedAt: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  [key: string]: unknown;
}

export interface SwarmLaneRecord {
  lane: string;
  summary: string;
  owner: string | null;
  verifier: string | null;
  scope: string[] | null;
  acceptance: string[] | null;
  verification: string[] | null;
  taskId: string | null;
}

export interface SwarmLaneSummary {
  lane: string;
  summary: string;
  owner: string | null;
  verifier: string | null;
  taskId: string | null;
  queueStatus: TaskQueueStatus | null;
  claimedBy: string | null;
  status: string | null;
  scope: string[] | null;
  ready: boolean;
  done: boolean;
}

export interface SwarmOverviewCounts {
  totalLanes: number;
  queued: number;
  claimed: number;
  blocked: number;
  readyForReview: number;
  released: number;
  done: number;
  unqueued: number;
}

export interface SwarmOverview {
  kind: "swarm_overview";
  recommendedReason: string;
  swarm: SwarmRecord;
  counts: SwarmOverviewCounts;
  lanes: SwarmLaneSummary[];
  tasks: TaskRecord[];
  nextLane: SwarmLaneSummary | null;
  derivedStatus: SwarmStatus;
  statusAligned: boolean;
  readyToComplete: boolean;
  dispatchableCount: number;
}

export interface MemoryRecord {
  id: string;
  title: string | null;
  content: string;
  namespace: string;
  kind: string;
  agent: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  [key: string]: unknown;
}

export interface TaskListView {
  kind: "task_view";
  recommendedReason: "task_list_has_results" | "task_list_empty";
  counts: {
    totalTasks: number;
  };
  tasks: TaskRecord[];
}

export interface TaskDetailView {
  kind: "task_detail";
  recommendedReason: "task_detail_loaded";
  metadata: TaskDetailMetadata;
  task: TaskRecord;
}

export interface SwarmListView {
  kind: "swarm_view";
  recommendedReason: "swarm_list_has_results" | "swarm_list_empty";
  detailed: false;
  counts: {
    totalSwarms: number;
  };
  swarms: SwarmRecord[];
}

export interface DetailedSwarmListView {
  kind: "swarm_view";
  recommendedReason: "swarm_list_has_results" | "swarm_list_empty";
  detailed: true;
  counts: {
    totalSwarms: number;
  };
  swarms: SwarmOverview[];
}

export interface SwarmFilters {
  status?: SwarmStatus;
  topology?: string;
  owner?: string;
}

export interface SwarmDetailView {
  kind: "swarm_detail";
  recommendedReason: string;
  metadata: SwarmDetailMetadata;
  swarm: SwarmRecord;
}

export interface TaskDetailMetadata {
  hasHistory: boolean;
  hasAnnotations: boolean;
  reviewState: TaskReviewState;
}

export interface SwarmDetailMetadata {
  derivedStatus: SwarmStatus;
  statusAligned: boolean;
  readyToComplete: boolean;
  dispatchableCount: number;
}

export interface MemoryListView {
  kind: "memory_view";
  recommendedReason: "memory_list_has_results" | "memory_list_empty";
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
  recommendedReason: "memory_search_has_results" | "memory_search_empty";
  counts: {
    totalResults: number;
  };
  query: string;
  results: MemorySearchResult[];
}

export interface MemoryFilters {
  namespace?: string;
  kind?: string;
  agent?: string;
  tags?: string[];
}

export interface MemoryInput {
  content: string;
  namespace?: string;
  kind?: string;
  title?: string | null;
  agent?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface TaskInput {
  title: string;
  status?: string;
  queueStatus?: TaskQueueStatus;
  owner?: string | null;
  verifier?: string | null;
  objective?: string | null;
  lane?: string | null;
  swarmId?: string | null;
  scope?: string[] | null;
  acceptance?: string[] | null;
  verification?: string[] | null;
  claimedBy?: string | null;
  notes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewOutcome?: string | null;
  reviewNotes?: string | null;
  reviewEvidence?: unknown[] | null;
  annotations?: unknown[];
}

export interface SwarmLaneInput {
  lane?: string;
  summary?: string;
  owner?: string | null;
  verifier?: string | null;
  scope?: string[] | null;
  acceptance?: string[] | null;
  verification?: string[] | null;
  taskId?: string | null;
}

export interface SwarmInput {
  objective: string;
  status?: SwarmStatus;
  topology?: string;
  maxWorkers?: number;
  owner?: string | null;
  laneSource?: string;
  lanes?: SwarmLaneInput[];
  queuedAt?: string | null;
  notes?: string | null;
}

export interface ValidationIssue {
  code: string;
  message: string;
  allowed?: string[];
}

export interface SwarmOverlapIssue extends ValidationIssue {
  lanes: string[];
  path: string;
}

export interface TaskValidationView {
  kind: "task_validation";
  recommendedReason: string;
  task: TaskRecord;
  ready: boolean;
  issues: ValidationIssue[];
  catalog: {
    agents: string[];
  };
}

export interface SwarmLaneValidation {
  lane: string;
  ready: boolean;
  issues: ValidationIssue[];
}

export interface SwarmValidationView {
  kind: "swarm_validation";
  recommendedReason: string;
  swarm: SwarmRecord;
  ready: boolean;
  issues: ValidationIssue[];
  lanes: SwarmLaneValidation[];
  overlaps: SwarmOverlapIssue[];
  catalog: {
    agents: string[];
  };
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
export declare function queueTasksFromPlan(task: string, addTasksFn?: (tasks: TaskInput[]) => TaskRecord[]): QueuedPlan;

export declare function listMcpTools(): ToolCatalogEntry[];
export declare function getToolCatalogView(): ToolCatalogView;
export declare function handleMcpRequest(message: McpMessage): McpResponse;
export declare function callMcpTool(name: string, args?: JsonObject): unknown;
export declare function serializeMcpMessage(message: McpMessage): string;
export declare function runMcpCli(args?: string[]): Promise<void>;
export declare function startMcpServer(): Promise<void>;

export declare function addTask(input: TaskInput): TaskRecord;
export declare function getTask(id: string): TaskRecord | null;
export declare function getTaskView(id: string): TaskDetailView | null;
export declare function initSwarm(input: SwarmInput): SwarmRecord;
export declare function getSwarm(id: string): SwarmRecord | null;
export declare function getSwarmView(id: string): SwarmDetailView | null;
export declare function listTasksView(): TaskListView;
export declare function listSwarmsView(filters?: SwarmFilters, options?: { detailed?: false }): SwarmListView;
export declare function listSwarmsView(filters: SwarmFilters | undefined, options: { detailed: true }): DetailedSwarmListView;
export declare function listMemoriesView(filters?: MemoryFilters): MemoryListView;
export declare function searchMemoriesView(query: string, filters?: MemoryFilters, limit?: number): MemorySearchView;
export declare function storeMemory(input: MemoryInput): MemoryRecord;
export declare function validateTask(id: string): TaskValidationView | null;
export declare function validateSwarm(id: string): SwarmValidationView | null;
export declare function stateFilePath(): string;
