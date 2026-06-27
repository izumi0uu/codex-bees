export interface PackageMetadata {
  product: "codex-bees";
  version: "0.1.0";
  description: "Codex-native local bounded orchestration kernel for explicit multi-agent work.";
  license: "MIT";
  homepage: "https://github.com/izumi0uu/codex-bees#readme";
  bugsUrl: "https://github.com/izumi0uu/codex-bees/issues";
  repositoryUrl: string | null;
  keywords: string[];
  mode: "codex-only";
}

export interface PackageMetadataView {
  kind: "package_metadata_view";
  recommendedReason: "package_metadata_loaded";
  metadata: PackageMetadata;
}

export interface CommandOptionCatalogEntry {
  option: string;
  description: string;
}

export interface CommandCatalogEntry {
  command: string;
  description: string;
  usage?: string[];
  aliases?: string[];
  options?: CommandOptionCatalogEntry[];
  notes?: string[];
}

export interface McpCommandCatalogEntry extends CommandOptionCatalogEntry {}

export interface CommandCatalogView {
  kind: "command_catalog_view";
  recommendedReason: "command_catalog_loaded" | "command_catalog_empty";
  counts: {
    totalCommands: number;
  };
  commands: CommandCatalogEntry[];
}

export interface CommandCatalogEntryView {
  kind: "command_catalog_entry_view";
  recommendedReason: "command_catalog_entry_loaded" | "command_catalog_entry_missing";
  command: string | null;
  matchedCommand: string | null;
  entry: CommandCatalogEntry | null;
}

export interface InitCommandCatalogView {
  kind: "init_command_catalog_view";
  recommendedReason: "init_command_catalog_loaded" | "init_command_catalog_empty";
  counts: {
    totalOptions: number;
  };
  options: CommandOptionCatalogEntry[];
}

export interface CommandHelpView {
  kind: "command_help_view";
  recommendedReason: "command_help_loaded" | "command_help_fallback_loaded";
  command: string | null;
  matchedCommand: string | null;
  text: string;
  entry: CommandCatalogEntry | null;
}

export interface InitHelpView {
  kind: "init_help_view";
  recommendedReason: "init_help_loaded" | "init_help_fallback_loaded";
  option: string | null;
  matchedOption: string | null;
  text: string;
  entry: CommandOptionCatalogEntry | null;
}

export interface InitCommandOptionView {
  kind: "init_command_option_view";
  recommendedReason: "init_command_option_loaded" | "init_command_option_missing";
  option: string | null;
  matchedOption: string | null;
  entry: CommandOptionCatalogEntry | null;
}

export interface McpCommandCatalogView {
  kind: "mcp_command_catalog_view";
  recommendedReason: "mcp_command_catalog_loaded" | "mcp_command_catalog_empty";
  counts: {
    totalOptions: number;
  };
  options: McpCommandCatalogEntry[];
}

export interface McpCommandOptionView {
  kind: "mcp_command_option_view";
  recommendedReason: "mcp_command_option_loaded" | "mcp_command_option_missing";
  option: string | null;
  matchedOption: string | null;
  entry: McpCommandCatalogEntry | null;
}

export interface McpHelpView {
  kind: "mcp_help_view";
  recommendedReason: "mcp_help_loaded" | "mcp_help_fallback_loaded";
  option: string | null;
  matchedOption: string | null;
  text: string;
  entry: McpCommandCatalogEntry | null;
}

export interface RuntimeCatalogEntry {
  id: string;
  name: string;
  description: string | null;
  path: string;
  source: "workspace" | "bundled" | "missing";
}

export interface RuntimeCatalogDocumentSection {
  title: string;
  slug: string;
  depth: number;
  path: string[];
  content: string;
  items: string[];
}

export interface RuntimeCatalogDocument {
  entry: RuntimeCatalogEntry;
  title: string | null;
  summary: string | null;
  frontmatter: Record<string, string>;
  counts: {
    totalLines: number;
    totalSections: number;
    totalItems: number;
    frontmatterFields: number;
  };
  sections: RuntimeCatalogDocumentSection[];
}

export interface RuntimeCatalogPaths {
  source: "workspace" | "bundled" | "missing";
  workingDirectory: string;
  packageRoot: string;
  codexDir: string;
  agentDir: string;
  skillDir: string;
}

export interface RuntimeCatalog {
  source: "workspace" | "bundled" | "missing";
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

export interface RuntimeCatalogEntryView {
  kind: "runtime_catalog_entry_view";
  recommendedReason: "catalog_entry_loaded" | "catalog_entry_missing";
  entryType: "agent" | "skill";
  id: string | null;
  matchedId: string | null;
  entry: RuntimeCatalogEntry | null;
}

export interface RuntimeCatalogLaneView {
  kind: "runtime_catalog_lane_view";
  recommendedReason: "catalog_lane_loaded" | "catalog_lane_empty";
  entryType: "agent" | "skill";
  counts: {
    totalEntries: number;
  };
  entries: RuntimeCatalogEntry[];
}

export interface RuntimeCatalogDocumentView {
  kind: "runtime_catalog_document_view";
  recommendedReason: "catalog_document_loaded" | "catalog_document_missing";
  entryType: "agent" | "skill";
  id: string | null;
  matchedId: string | null;
  document: RuntimeCatalogDocument | null;
}

export interface RuntimeCatalogRoleContractSummary {
  title: string | null;
  summary: string | null;
  boundaries: string[];
  workingRules: string[];
  handoffExpectations: string[];
  verificationFocus: string[];
  stopAndEscalate: string[];
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
  guideMode:
    | "onboarding"
    | "review"
    | "recovery"
    | "swarm-queue"
    | "dispatch"
    | "active"
    | "closeout"
    | "steady-state";
  summary: string;
  stateCounts: {
    tasks: number;
    swarms: number;
    memories: number;
    readyForReview: number;
    blockedTasks: number;
    queuedTasks: number;
    activeTasks: number;
    plannedSwarms: number;
    activeSwarms: number;
    blockedSwarms: number;
    closedSwarms: number;
  };
  suggestedCommands: RuntimeSuggestedCommand[];
  next: string[];
}

export interface RuntimeTuiSection {
  id: "summary" | "dashboard" | "focus" | "handoffs" | "recovery" | "status";
  label: string;
  shortcut: string;
  description: string;
}

export interface RuntimeTuiKeybinding {
  key: string;
  action: string;
}

export interface RuntimeTuiCommandPaletteEntry {
  kind: "command" | "action" | "section";
  actionId: string | null;
  targetSection: RuntimeTuiSection["id"] | null;
  command: string;
  displayCommand: string;
  description: string;
  groupLabel: string;
  usage: string | null;
  recommended: boolean;
  selected: boolean;
  preview: string[];
}

export interface RuntimeTuiEvent {
  id: string;
  at: string | null;
  timeLabel: string;
  level: "info" | "warn" | "success";
  source: "session" | "runtime_alert" | "runtime_activity";
  message: string;
}

export interface RuntimeTuiLayout {
  mode: "stacked" | "split-pane";
  sidebarWidth: number;
  contentWidth: number;
}

export interface RuntimeTuiLiveRefresh {
  enabled: boolean;
  intervalMs: number;
  tick: number;
  lastRefreshedAt: string | null;
  lastRefreshedAtLabel: string;
}

export interface RuntimeTuiSignals {
  guideMode: string;
  tasks: number;
  swarms: number;
  memories: number;
  recommendedSurface: string | null;
  recommendedSection: RuntimeTuiSection["id"];
  alerts: {
    total: number;
    high: number;
    medium: number;
    topSummary: string | null;
  };
  activity: {
    totalEntries: number;
    nextSummary: string | null;
  };
}

export interface RuntimeTuiQuickAction {
  id: string;
  label: string;
  hint: string;
  description: string;
}

export interface RuntimeTuiRecentAction {
  id: string;
  label: string;
  kind: "command" | "action" | "section";
  command: string | null;
  at: string | null;
  timeLabel: string;
}

export interface RuntimeTuiSnapshot {
  kind: "runtime_tui_snapshot";
  recommendedReason: "tui_snapshot_rendered";
  activeSection: RuntimeTuiSection["id"];
  recommendedSection: RuntimeTuiSection["id"];
  sections: RuntimeTuiSection[];
  keymap: RuntimeTuiKeybinding[];
  header: {
    title: string;
    subtitle: string;
    stateSummary: string;
  };
  panel: {
    id: RuntimeTuiSection["id"];
    title: string;
    description: string;
    summary: string;
    lines: string[];
  };
  commandPalette: {
    visible: boolean;
    input: string;
    selectedIndex: number;
    entries: RuntimeTuiCommandPaletteEntry[];
  } | null;
  layout: RuntimeTuiLayout;
  liveRefresh: RuntimeTuiLiveRefresh;
  signals: RuntimeTuiSignals;
  quickActions: RuntimeTuiQuickAction[];
  recentActions: RuntimeTuiRecentAction[];
  statusline: {
    segments: string[];
  };
  eventStream: {
    total: number;
    entries: RuntimeTuiEvent[];
  };
  counts: {
    sections: number;
    renderedLines: number;
    suggestedCommands: number;
    commandPaletteEntries: number;
    eventStreamEntries: number;
    width: number;
    height: number;
  };
  text: string;
}

export interface WorkspaceInitOptions {
  targetDirectory?: string;
  force?: boolean;
}

export interface WorkspaceInitEntry {
  type: "file";
  path: string;
  action: "create" | "update" | "skip";
  reason: string;
}

export interface WorkspaceInitPreviewSummary {
  hasChanges: boolean;
  targetDirectory: string;
  force: boolean;
  totalEntries: number;
  create: number;
  update: number;
  skip: number;
}

export interface WorkspaceInitResultSummary {
  hasChanges: boolean;
  targetDirectory: string;
  force: boolean;
  totalEntries: number;
  created: number;
  updated: number;
  skipped: number;
}

export interface WorkspaceInitPreview {
  kind: "workspace_init_preview";
  recommendedReason: "init_changes_required" | "init_already_applied";
  targetDirectory: string;
  force: boolean;
  summary: WorkspaceInitPreviewSummary;
  counts: {
    totalEntries: number;
    create: number;
    update: number;
    skip: number;
  };
  entries: WorkspaceInitEntry[];
  next: string[];
}

export interface WorkspaceInitResult {
  kind: "workspace_init_result";
  recommendedReason: "init_applied" | "init_no_changes";
  targetDirectory: string;
  force: boolean;
  summary: WorkspaceInitResultSummary;
  counts: {
    created: number;
    updated: number;
    skipped: number;
    totalEntries: number;
  };
  created: string[];
  updated: string[];
  skipped: string[];
  next: string[];
}

export interface CoordinationOverview {
  executionModel: "local bounded multi-agent coordination";
  deliveryBoundary: "codex-only runtime";
  changeModel: "small reversible steps";
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
  fileOwnership: "one active writer per file";
  parallelism: "parallelize only with disjoint ownership";
  validation: Array<"targeted verification" | "fresh evidence" | "handoff discipline">;
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

export interface RuntimeCapabilityView {
  kind: "runtime_capability_view";
  recommendedReason: "runtime_capability_loaded" | "runtime_capability_missing";
  id: string | null;
  matchedCapability: string | null;
  capability: RuntimeCapability | null;
}

export type TaskPlanLanePurpose =
  | "discovery"
  | "implementation"
  | "verification"
  | "documentation";

export type PlannerTaskClass =
  | "docs-only"
  | "docs-runtime"
  | "coordination-kernel"
  | "catalog-contract"
  | "runtime-surface"
  | "build-verification"
  | "general";

export type PlannerLaneStrategy =
  | "documentation"
  | "implement-verify"
  | "implement-verify-docs"
  | "discover-implement-verify"
  | "discover-implement-verify-docs";

export type PlannerAssessmentBand = "low" | "medium" | "high";
export type PlannerAssessmentExecutionPressure = "steady" | "elevated" | "parallel";
export type PlannerAssessmentDispatchBias =
  | "serial-handoff"
  | "parallelize-by-owner"
  | "parallelize-by-lane"
  | "single-owner";

export interface TaskPlanLane {
  lane: string;
  purpose: TaskPlanLanePurpose;
  owner: string;
  verifier: string;
  summary: string;
  scope: string[];
  dependsOn?: string[];
  acceptance: string[];
  verification: string[];
}

export interface PlannerIntent {
  docs: boolean;
  docsOnly: boolean;
  runtime: boolean;
  coordination: boolean;
  build: boolean;
  catalog: boolean;
  verificationHeavy: boolean;
  additionalDocsLane: boolean;
}

export interface PlannerScopeHints {
  primary: string[];
  discovery: string[];
  verification: string[];
  documentation: string[];
}

export interface PlannerRoleFileEvidence {
  role: string;
  path: string;
}

export interface PlannerStrategyEvidence {
  taskClass: PlannerTaskClass;
  laneStrategy: PlannerLaneStrategy;
  publicSurface: boolean;
  needsDiscovery: boolean;
  needsVerification: boolean;
  needsDocumentation: boolean;
}

export interface PlannerEvidence {
  task: string;
  intent: PlannerIntent;
  strategy: PlannerStrategyEvidence;
  repoSignals: {
    hasSrc: boolean;
    hasScripts: boolean;
    hasAgents: boolean;
    hasSkills: boolean;
  };
  scopeHints: PlannerScopeHints;
  roleFiles: PlannerRoleFileEvidence[];
}

export interface PlannerAssessment {
  complexity: PlannerAssessmentBand;
  coordinationIntensity: PlannerAssessmentBand;
  publicSurfaceRisk: PlannerAssessmentBand;
  verificationPressure: PlannerAssessmentBand;
  executionPressure: PlannerAssessmentExecutionPressure;
  dispatchBias: PlannerAssessmentDispatchBias;
  recommendedParallelism: number;
  scoreHints: {
    complexity: number;
    coordinationIntensity: number;
    publicSurfaceRisk: number;
    verificationPressure: number;
  };
  signals: {
    taskClass: PlannerTaskClass;
    laneStrategy: PlannerLaneStrategy;
    intentTags: string[];
    primaryScopeCount: number;
    discoveryScopeCount: number;
    verificationScopeCount: number;
    documentationScopeCount: number;
    laneCount: number;
    waveCount: number;
    peakParallelOwners: number;
    peakParallelLanes: number;
    discoveryLaneCount: number;
    implementationLaneCount: number;
    verificationLaneCount: number;
    documentationLaneCount: number;
  };
  summary: string;
}

export interface PlannerProfileSelectionHints {
  keywords: string[];
  taskClasses: string[];
  intentTags: string[];
  excludeIntentTags: string[];
  scopePrefixes: string[];
  priority: number;
}

export interface PlannerProfilePlanningHints {
  documentationMode: "serial" | "discovery-sidecar";
  coordinationBias: boolean;
}

export interface PlannerProfileDefinition {
  id: string;
  extends?: string;
  description?: string;
  topology?: string;
  laneSource?: string;
  adaptive?: boolean;
  laneModel?: string;
  executionModel?: string;
  roles?: string[];
  constraints?: string[];
  selectionHints?: Partial<PlannerProfileSelectionHints>;
  planningHints?: Partial<PlannerProfilePlanningHints>;
}

export interface PlannerProfile {
  id: string;
  description: string;
  topology: string;
  laneSource: string;
  adaptive: boolean;
  laneModel: string;
  executionModel: string;
  roles: string[];
  constraints: string[];
  selectionHints: PlannerProfileSelectionHints;
  planningHints: PlannerProfilePlanningHints;
  sourceKind: string;
  sourcePath: string | null;
}

export interface PlannerProfileListView {
  kind: "planner_profile_list_view";
  recommendedReason: "planner_profiles_loaded" | "planner_profiles_empty";
  counts: {
    totalProfiles: number;
  };
  defaultProfile: string;
  profiles: PlannerProfile[];
}

export interface PlannerProfileView {
  kind: "planner_profile_view";
  recommendedReason: "planner_profile_loaded" | "planner_profile_missing";
  id: string | null;
  matchedProfile: string | null;
  profile: PlannerProfile | null;
}

export interface PlannerSelection {
  inputProfile: string | null;
  requestedProfile: string;
  resolvedProfile: string;
  usedDefaultProfile: boolean;
  selectionMode: "explicit" | "fallback" | "heuristic";
  reason:
    | "explicit_profile_requested"
    | "missing_profile_fallback"
    | "coordination_profile_inferred"
    | "default_profile_inferred"
    | "profile_hint_inferred";
  resolvedSourceKind?: string | null;
  defaultProfile?: string | null;
  availableProfiles?: string[];
  profileFiles?: string[];
  selectionContext?: {
    taskClass: PlannerTaskClass;
    laneStrategy: PlannerLaneStrategy;
    implementationScope: string[];
    intentTags: string[];
  };
  matchedSignals?: {
    keywords: string[];
    taskClasses: string[];
    intentTags: string[];
    scopePrefixes: string[];
    coordinationBias: boolean;
  };
  selectionScore?: number;
  selectionScoreBreakdown?: Record<string, number>;
  matchedSignalCount?: number;
  heuristicMatches?: PlannerProfileRankingEntry[];
}

export interface PlannerProfileRankingEntry {
  rank: number;
  profileId: string;
  sourceKind: string;
  selectionScore: number;
  scoreBreakdown: Record<string, number>;
  matchedSignalCount: number;
  matchedKeywords: string[];
  matchedTaskClasses: string[];
  matchedIntentTags: string[];
  matchedScopePrefixes: string[];
  matchedCoordinationBias: boolean;
}

export interface PlannerProfileRankingView {
  kind: "planner_profile_ranking_view";
  recommendedReason: string;
  task: string;
  counts: {
    totalCandidates: number;
    matchedSignalCount: number;
  };
  inputProfile: string | null;
  requestedProfile: string | null;
  resolvedProfile: string | null;
  resolvedSourceKind: string | null;
  defaultProfile: string | null;
  availableProfiles: string[];
  profileFiles: string[];
  selectionMode: string | null;
  usedDefaultProfile: boolean;
  selectionContext: {
    taskClass: PlannerTaskClass | null;
    laneStrategy: PlannerLaneStrategy | null;
    implementationScope: string[];
    intentTags: string[];
  };
  matchedSignals: {
    keywords: string[];
    taskClasses: string[];
    intentTags: string[];
    scopePrefixes: string[];
    coordinationBias: boolean;
  };
  selectionScore: number;
  selectionScoreBreakdown: Record<string, number>;
  profiles: PlannerProfileRankingEntry[];
  summary: string;
}

export type PlannerExecutionShape =
  | "solo-lane"
  | "serial-handoff"
  | "parallel-handoff";

export interface PlannerWaveLane {
  lane: string;
  purpose: TaskPlanLanePurpose;
  owner: string;
  verifier: string;
  dependsOn: string[];
}

export interface PlannerWave {
  wave: number;
  parallelizable: boolean;
  blocked: boolean;
  laneCount: number;
  ownerCount: number;
  purposes: TaskPlanLanePurpose[];
  owners: string[];
  lanes: PlannerWaveLane[];
}

export interface PlannerOrchestration {
  executionShape: PlannerExecutionShape;
  waveCount: number;
  peakParallelLanes: number;
  peakParallelOwners: number;
  maxWorkers: number;
  waves: PlannerWave[];
}

export interface TaskPlan {
  kind: "task_plan";
  recommendedReason: "multi_lane_plan_ready" | "single_lane_plan_ready";
  objective: string;
  requestedProfile: string;
  planner: PlannerProfile;
  plannerSelection: PlannerSelection;
  evidence: PlannerEvidence;
  assessment: PlannerAssessment;
  orchestration: PlannerOrchestration;
  lanes: TaskPlanLane[];
}

export interface PlannedSwarm {
  kind: "planned_swarm";
  recommendedReason: "multi_lane_swarm_ready" | "single_lane_swarm_ready";
  objective: string;
  requestedProfile: string;
  planner: PlannerProfile;
  plannerSelection: PlannerSelection;
  evidence: PlannerEvidence;
  assessment: PlannerAssessment;
  orchestration: PlannerOrchestration;
  swarm: PlannedSwarmShape;
}

export interface QueuedPlan {
  kind: "queued_plan";
  recommendedReason: "multiple_plan_tasks_queued" | "single_plan_task_queued";
  objective: string;
  requestedProfile: string;
  planner: PlannerProfile;
  plannerSelection: PlannerSelection;
  assessment: PlannerAssessment;
  orchestration: PlannerOrchestration;
  lanes: TaskPlanLane[];
  created: TaskRecord[];
}

export interface RuntimeContract {
  product: "codex-bees";
  mode: "codex-only";
  deliveryBoundary: "codex-only runtime";
  workingDirectory: string;
  node: string;
  architecture: Array<"cli" | "mcp" | "skills" | "agents" | "docs">;
  transport: {
    cli: "stdio";
    mcp: "stdio-jsonrpc";
  };
  responsibilities: string[];
  exclusions: string[];
}

export interface RuntimeCapabilitySummary {
  id:
    | "cli_runtime"
    | "mcp_runtime"
    | "planning"
    | "task_coordination"
    | "verifier_review"
    | "leader_orchestration"
    | "swarm_coordination"
    | "memory"
    | "runtime_catalog";
  category: "runtime" | "planning" | "coordination" | "memory" | "introspection";
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
  id:
    | "cli_runtime"
    | "mcp_runtime"
    | "planning"
    | "task_coordination"
    | "verifier_review"
    | "leader_orchestration"
    | "swarm_coordination"
    | "memory"
    | "runtime_catalog";
  category: "runtime" | "planning" | "coordination" | "memory" | "introspection";
  description: string;
  cliCommands: string[];
  mcpTools: string[];
  highlights: string[];
  preferredEntryPoints: {
    cli: Array<
      | "leader:assignment-launch-plan"
      | "leader:assignment-dispatch-bundle"
      | "leader:workspace"
      | "status"
      | "capabilities"
      | "runtime:summary-pack"
      | "runtime:queue-pack"
    >;
    mcp: Array<
      | "leader_assignment_launch_plan"
      | "leader_assignment_dispatch_bundle"
      | "leader_workspace"
      | "runtime_status"
      | "runtime_capabilities"
      | "runtime_summary_pack"
      | "runtime_queue_pack"
    >;
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

export interface RuntimeSuggestedCommand {
  command: string;
  reason: string;
}

export interface RuntimeStatus {
  product: "codex-bees";
  version: string;
  mode: "codex-only";
  guideMode:
    | "onboarding"
    | "review"
    | "recovery"
    | "swarm-queue"
    | "dispatch"
    | "active"
    | "closeout"
    | "steady-state";
  summary: string;
  counts: RuntimeStatusCounts;
  state: {
    taskQueueStatuses: Record<string, number>;
    swarmStatuses: Record<string, number>;
    memoryNamespaces: Record<string, number>;
  };
  highlights: string[];
  recommendedEntryPoints: {
    cli: Array<
      | "leader:assignment-launch-plan"
      | "leader:assignment-dispatch-bundle"
      | "leader:workspace"
      | "status"
      | "capabilities"
      | "runtime:summary-pack"
      | "runtime:queue-pack"
    >;
    mcp: Array<
      | "leader_assignment_launch_plan"
      | "leader_assignment_dispatch_bundle"
      | "leader_workspace"
      | "runtime_status"
      | "runtime_capabilities"
      | "runtime_summary_pack"
      | "runtime_queue_pack"
    >;
  };
  suggestedCommands: RuntimeSuggestedCommand[];
  useCases: string[];
  catalog: RuntimeCatalog;
  capabilities: RuntimeCapabilitySummary[];
}

export interface PlannedSwarmShape {
  objective: string;
  topology: "bounded-local";
  maxWorkers: number;
  executionShape: PlannerExecutionShape;
  waveCount: number;
  waves: PlannerWave[];
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

export interface McpToolView {
  kind: "mcp_tool_view";
  recommendedReason: "mcp_tool_loaded" | "mcp_tool_missing";
  name: string | null;
  matchedTool: string | null;
  tool: ToolCatalogEntry | null;
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

export interface SwarmHistoryEntry {
  id: string;
  at: string | null;
  type: string;
  fromStatus: SwarmStatus | null;
  toStatus: SwarmStatus | null;
  actor: string | null;
  lane: string | null;
  taskId: string | null;
  notes: string | null;
  outcome: string | null;
}

export interface TaskDependencySummary {
  refs: string[];
  ready: boolean;
  unresolvedRefs: string[];
  blockingTaskIds: string[];
  blockingLanes: string[];
  blockingOwners: string[];
  blockingStatuses: string[];
  blocking: TaskRecord[];
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
  lanePurpose?: TaskPlanLanePurpose | null;
  swarmId: string | null;
  scope: string[] | null;
  dependsOn: string[] | null;
  acceptance: string[] | null;
  verification: string[] | null;
  claimedBy: string | null;
  notes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewOutcome: string | null;
  reviewNotes: string | null;
  reviewEvidence: unknown[] | null;
  archivedAt: string | null;
  archivedBy: string | null;
  archiveReason: string | null;
  dependencyReady?: boolean;
  dependencySummary?: TaskDependencySummary;
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
  executionShape?: PlannerExecutionShape | null;
  waveCount?: number | null;
  waves?: PlannerWave[] | null;
  owner: string | null;
  laneSource: string;
  lanes: SwarmLaneRecord[];
  history: SwarmHistoryEntry[];
  queuedAt: string | null;
  notes: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
  archiveReason: string | null;
  archivedTaskIds: string[];
  archivedTaskCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  [key: string]: unknown;
}

export interface SwarmLaneRecord {
  lane: string;
  purpose: TaskPlanLanePurpose | null;
  summary: string;
  owner: string | null;
  verifier: string | null;
  scope: string[] | null;
  dependsOn: string[] | null;
  acceptance: string[] | null;
  verification: string[] | null;
  taskId: string | null;
}

export interface SwarmLaneSummary {
  lane: string;
  purpose: TaskPlanLanePurpose | null;
  summary: string;
  owner: string | null;
  verifier: string | null;
  taskId: string | null;
  queueStatus: TaskQueueStatus | null;
  claimedBy: string | null;
  status: string | null;
  scope: string[] | null;
  dependsOn: string[];
  dependencyReady: boolean;
  dependencySummary: TaskDependencySummary | null;
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
  waitingOnDependencies: number;
  done: number;
  unqueued: number;
}

export interface SwarmOverview {
  kind: "swarm_overview";
  recommendedReason:
    | "swarm_ready_to_complete"
    | "review_lane_waiting"
    | "blocked_lanes_present"
    | "dependency_lane_waiting"
    | "dispatch_lane_ready"
    | "claimed_lane_active"
    | "planned_lanes_unqueued"
    | "swarm_state_visible";
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

export interface TaskArchiveListView {
  kind: "task_archive_view";
  recommendedReason: "task_archive_list_has_results" | "task_archive_list_empty";
  counts: {
    totalArchivedTasks: number;
  };
  tasks: TaskRecord[];
}

export interface TaskDetailView {
  kind: "task_detail";
  recommendedReason: "task_detail_loaded";
  metadata: TaskDetailMetadata;
  task: TaskRecord;
}

export interface TaskArchiveDetailView {
  kind: "task_archive_detail";
  recommendedReason: "task_archive_loaded";
  metadata: {
    archivedAt: string | null;
    archivedBy: string | null;
    hasArchiveReason: boolean;
    restoreCommand: string;
  };
  task: TaskRecord;
  summary: string;
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

export interface SwarmArchiveListView {
  kind: "swarm_archive_view";
  recommendedReason: "swarm_archive_list_has_results" | "swarm_archive_list_empty";
  counts: {
    totalArchivedSwarms: number;
    totalArchivedTasks: number;
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
  recommendedReason: "swarm_detail_loaded";
  metadata: SwarmDetailMetadata;
  swarm: SwarmRecord;
}

export interface SwarmArchiveDetailView {
  kind: "swarm_archive_detail";
  recommendedReason: "swarm_archive_loaded";
  swarm: SwarmRecord;
  tasks: TaskRecord[];
  counts: {
    archivedTasks: number;
  };
  metadata: {
    archivedAt: string | null;
    archivedBy: string | null;
    hasArchiveReason: boolean;
    restoreCommand: string;
  };
  summary: string;
}

export interface TaskDetailMetadata {
  hasHistory: boolean;
  hasAnnotations: boolean;
  reviewState: TaskReviewState;
}

export interface TaskHistoryView {
  kind: "task_history";
  recommendedReason:
    | "approved_event_latest"
    | "changes_requested_event_latest"
    | "ready_for_review_event_latest"
    | "blocked_event_latest"
    | "claimed_event_latest"
    | "created_event_latest"
    | "history_visible";
  taskId: string;
  title: string | undefined;
  queueStatus: TaskQueueStatus;
  counts: {
    totalHistoryEntries: number;
  };
  history: TaskHistoryEntry[];
}

export interface RuntimeCatalogRoleReference {
  id: string | null;
  exists: boolean;
  name: string | null;
  description: string | null;
  promptPath: string | null;
  source: "workspace" | "bundled" | "missing";
  contract: RuntimeCatalogRoleContractSummary | null;
}

export interface TaskRecommendedActor {
  type: string;
  id: string | null;
  claimedBy?: string | null;
}

export interface TaskNextGate {
  action: string;
  command: string | null;
}

export interface TaskExecutionBrief {
  kind: "task_execution_brief";
  recommendedReason:
    | "completed_task_brief"
    | "verifier_decision_brief"
    | "claimed_execution_brief"
    | "blocked_recovery_brief"
    | "dependency_waiting_brief"
    | "released_repickup_brief"
    | "claimable_execution_brief"
    | "queued_execution_brief";
  task: TaskRecord;
  objective: string | undefined;
  roles: {
    owner: RuntimeCatalogRoleReference;
    verifier: RuntimeCatalogRoleReference;
  };
  coordination: {
    swarmId: string | null;
    lane: string | null;
    lanePurpose: TaskPlanLanePurpose | null;
    queueStatus: TaskQueueStatus;
    claimedBy: string | null;
    notes: string | null;
    dependsOn: string[];
  };
  counts: {
    scopeEntries: number;
    acceptanceItems: number;
    verificationSteps: number;
    dependencyRefs: number;
    blockingDependencies: number;
    reviewEvidenceEntries: number;
    historyEntries: number;
    annotationEntries: number;
  };
  execution: {
    scope: string[];
    acceptance: string[];
    verification: string[];
    dependsOn: string[];
  };
  dependencies: TaskDependencySummary;
  review: {
    state: TaskReviewState;
    reviewedBy: string | null;
    reviewedAt: string | null;
    outcome: string | null;
    notes: string | null;
    evidence: unknown[];
  };
  history: {
    count: number;
    entries: TaskHistoryEntry[];
  };
  annotations: {
    count: number;
    entries: TaskAnnotation[];
  };
  validation: TaskValidationView;
  recommendedNextActor: TaskRecommendedActor | null;
  recommendedNextAction: string;
  recommendedCommands: string[];
}

export interface TaskReportView {
  kind: "task_report";
  recommendedReason:
    | "approved_closure_ready"
    | "review_decision_pending"
    | "changes_requested_rework"
    | "dependency_waiting_report"
    | "active_execution_report"
    | "blocked_recovery_report"
    | "queued_execution_report";
  task: {
    id: string;
    title?: string;
    objective: string | null;
    queueStatus: TaskQueueStatus;
    owner: string | null;
    verifier: string | null;
    claimedBy: string | null;
    swarmId: string | null;
    lane: string | null;
    lanePurpose: TaskPlanLanePurpose | null;
  };
  closure: {
    reviewState: TaskReviewState;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewOutcome: string | null;
    reviewNotes: string | null;
    closureReady: boolean;
    nextGate: TaskNextGate;
  };
  counts: {
    acceptanceItems: number;
    verificationSteps: number;
    reviewEvidenceEntries: number;
    annotationEntries: number;
    recentHistoryEntries: number;
  };
  acceptance: Array<{
    item: string;
    status: "verified" | "pending";
  }>;
  verification: string[];
  evidence: {
    reviewEvidence: unknown[];
    annotations: TaskAnnotation[];
    recentHistory: TaskHistoryEntry[];
  };
  brief: TaskExecutionBrief | null;
}

export interface SwarmDetailMetadata {
  derivedStatus: SwarmStatus;
  statusAligned: boolean;
  readyToComplete: boolean;
  dispatchableCount: number;
  hasHistory: boolean;
  historyEntries: number;
}

export interface MemoryDetailMetadata {
  hasTitle: boolean;
  hasNotes: boolean;
  tagCount: number;
}

export interface MemoryListView {
  kind: "memory_view";
  recommendedReason: "memory_list_has_results" | "memory_list_empty";
  counts: {
    totalMemories: number;
  };
  memories: MemoryRecord[];
}

export interface MemoryDetailView {
  kind: "memory_detail";
  recommendedReason: "memory_detail_loaded";
  metadata: MemoryDetailMetadata;
  memory: MemoryRecord;
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

export interface LeaderAssignmentRankingEntry {
  rank: number;
  swarmId: string;
  lane: string;
  taskId: string | null;
  owner: unknown;
  purpose: TaskPlanLanePurpose | null;
  wave: number | string | null;
  dispatchScore: number;
  dispatchScoreBreakdown: Record<string, number>;
  plannerAssessment: PlannerAssessment | null;
  summary: string;
}

export interface LeaderAssignmentRankingView {
  kind: "leader_assignment_ranking_view";
  recommendedReason: string;
  filters: Record<string, string | null>;
  counts: {
    totalAssignments: number;
    ownerGroups: number;
  };
  next: unknown | null;
  assignments: LeaderAssignmentRankingEntry[];
  summary: string;
}

export interface RuntimeDispatchRankingEntry {
  rank: number;
  swarmId: string;
  lane: string;
  taskId: string | null;
  purpose: TaskPlanLanePurpose | null;
  dispatchScore: number;
  dispatchScoreBreakdown: Record<string, number>;
  plannerAssessment: PlannerAssessment | null;
  summary: string;
}

export interface RuntimeDispatchRankingView {
  kind: "runtime_dispatch_ranking_view";
  recommendedReason: string;
  counts: {
    ownerGroups: number;
    totalAssignments: number;
  };
  next: unknown | null;
  assignments: RuntimeDispatchRankingEntry[];
  summary: string;
}

export interface RuntimeFocusCandidateEntry {
  rank?: number;
  key: string;
  score?: number;
  summary?: string | null;
  recommendedReason?: string;
  focus?: unknown;
  priorityScore?: number;
  priorityScoreBreakdown?: Record<string, number>;
  scoreBreakdown?: Record<string, number>;
}

export interface RuntimeFocusCandidatesView {
  kind: "runtime_focus_candidates_view";
  recommendedReason: string;
  counts: {
    totalCandidates: number;
  };
  focus: unknown | null;
  priorityScore: number;
  priorityScoreBreakdown: Record<string, number>;
  candidates: RuntimeFocusCandidateEntry[];
  summary: string;
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
  lanePurpose?: TaskPlanLanePurpose | null;
  swarmId?: string | null;
  scope?: string[] | null;
  dependsOn?: string[] | null;
  acceptance?: string[] | null;
  verification?: string[] | null;
  claimedBy?: string | null;
  notes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewOutcome?: string | null;
  reviewNotes?: string | null;
  reviewEvidence?: unknown[] | null;
  archivedAt?: string | null;
  archivedBy?: string | null;
  archiveReason?: string | null;
  annotations?: unknown[];
}

export interface SwarmLaneInput {
  lane?: string;
  purpose?: TaskPlanLanePurpose | null;
  summary?: string;
  owner?: string | null;
  verifier?: string | null;
  scope?: string[] | null;
  dependsOn?: string[] | null;
  acceptance?: string[] | null;
  verification?: string[] | null;
  taskId?: string | null;
}

export interface SwarmInput {
  objective: string;
  status?: SwarmStatus;
  topology?: string;
  maxWorkers?: number;
  executionShape?: PlannerExecutionShape | null;
  waveCount?: number | null;
  waves?: PlannerWave[] | null;
  owner?: string | null;
  laneSource?: string;
  lanes?: SwarmLaneInput[];
  queuedAt?: string | null;
  notes?: string | null;
  archivedAt?: string | null;
  archivedBy?: string | null;
  archiveReason?: string | null;
  archivedTaskIds?: string[];
  archivedTaskCount?: number;
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
  recommendedReason:
    | "task_ready_to_claim"
    | "task_dependency_waiting"
    | "task_role_validation_issues_present"
    | "claimed_task_metadata_incomplete"
    | "task_validation_issues_present"
    | "task_validation_visible";
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
  recommendedReason:
    | "swarm_ready_to_queue"
    | "swarm_scope_overlap_detected"
    | "lane_validation_issues_present"
    | "swarm_validation_issues_present"
    | "swarm_validation_visible";
  swarm: SwarmRecord;
  ready: boolean;
  issues: ValidationIssue[];
  lanes: SwarmLaneValidation[];
  overlaps: SwarmOverlapIssue[];
  catalog: {
    agents: string[];
  };
}

export declare const PRODUCT_NAME: "codex-bees";
export declare const PACKAGE_VERSION: "0.1.0";
export declare const toolCatalog: ToolCatalogEntry[];

export declare function getPackageMetadata(): PackageMetadata;
export declare function getPackageMetadataView(): PackageMetadataView;

export declare function getCommandCatalog(): CommandCatalogEntry[];
export declare function getCommandCatalogEntry(command: string): CommandCatalogEntry | undefined;
export declare function getCommandCatalogEntryView(command?: string): CommandCatalogEntryView;
export declare function getCommandHelpView(command?: string): CommandHelpView;
export declare function getCommandCatalogView(): CommandCatalogView;
export declare function getInitCommandCatalog(): CommandOptionCatalogEntry[];
export declare function getInitCommandCatalogView(): InitCommandCatalogView;
export declare function getInitCommandCatalogEntry(option: string): CommandOptionCatalogEntry | undefined;
export declare function getInitCommandCatalogEntryView(option?: string): InitCommandOptionView;
export declare function getInitHelpView(option?: string): InitHelpView;
export declare function renderCommandHelpText(command: string): string;
export declare function renderHelpText(): string;
export declare function renderInitHelpText(): string;
export declare function getMcpCommandCatalog(): McpCommandCatalogEntry[];
export declare function getMcpCommandCatalogEntry(option: string): McpCommandCatalogEntry | undefined;
export declare function getMcpCommandCatalogEntryView(option?: string): McpCommandOptionView;
export declare function getMcpCommandCatalogView(): McpCommandCatalogView;
export declare function getMcpHelpView(option?: string): McpHelpView;
export declare function renderMcpHelpText(): string;

export declare function previewWorkspaceInit(options?: WorkspaceInitOptions): WorkspaceInitPreview;
export declare function initWorkspace(options?: WorkspaceInitOptions): WorkspaceInitResult;

export declare function getRuntimeCatalogPaths(): RuntimeCatalogPaths;
export declare function getBundledRuntimeCatalogPaths(): RuntimeCatalogPaths;
export declare function resolveRuntimeCatalogPath(relativePath: string): string | null;
export declare function listAgentCatalog(): RuntimeCatalogEntry[];
export declare function getAgentCatalogEntry(id: string): RuntimeCatalogEntry | undefined;
export declare function getAgentCatalogListView(): RuntimeCatalogLaneView;
export declare function getAgentCatalogEntryView(id?: string): RuntimeCatalogEntryView;
export declare function getAgentCatalogDocumentView(id?: string): RuntimeCatalogDocumentView;
export declare function listAgentRoleIds(): string[];
export declare function listSkillCatalog(): RuntimeCatalogEntry[];
export declare function getSkillCatalogEntry(id: string): RuntimeCatalogEntry | undefined;
export declare function getSkillCatalogListView(): RuntimeCatalogLaneView;
export declare function getSkillCatalogEntryView(id?: string): RuntimeCatalogEntryView;
export declare function getSkillCatalogDocumentView(id?: string): RuntimeCatalogDocumentView;
export declare function getRuntimeCatalog(): RuntimeCatalog;
export declare function getRuntimeCatalogView(): RuntimeCatalogView;

export declare function getRuntimeContractView(): RuntimeContractView;
export declare function getRuntimeDoctorView(entryUrl?: string): RuntimeDoctorView;
export declare function getRuntimeReadyView(): RuntimeReadyView;
export declare function getRuntimeTuiSnapshot(input?: {
  section?: RuntimeTuiSection["id"];
  width?: number;
  height?: number;
  showHelp?: boolean;
  commandMode?: boolean;
  commandInput?: string;
  selectedCommandIndex?: number;
  eventStream?: Partial<RuntimeTuiEvent>[];
  recentActions?: Partial<RuntimeTuiRecentAction>[];
  liveRefresh?: Partial<RuntimeTuiLiveRefresh>;
  flashMessage?: string | null;
}): RuntimeTuiSnapshot;
export declare function runInteractiveRuntimeTui(input?: {
  section?: RuntimeTuiSection["id"];
  snapshot?: boolean;
}): Promise<void>;

export declare function getCoordinationOverview(): CoordinationOverview;
export declare function getCoordinationOverviewView(): CoordinationOverviewView;
export declare function getWorkerGuidelines(): WorkerGuidelines;
export declare function getWorkerGuidelinesView(): WorkerGuidelinesView;

export declare function getCapabilityCatalog(): RuntimeCapability[];
export declare function getCapabilityCatalogEntry(id: string): RuntimeCapability | undefined;
export declare function getCapabilityCatalogEntryView(id?: string): RuntimeCapabilityView;
export declare function getCapabilityCatalogView(): RuntimeCapabilitiesView;
export declare function getRuntimeStatus(input?: { version?: string; toolCount?: number }): RuntimeStatus;
export declare function getRuntimeStatusView(input?: { version?: string; toolCount?: number }): RuntimeStatusView;

export declare function getPlannerProfiles(): PlannerProfile[];
export declare function getPlannerProfilesView(): PlannerProfileListView;
export declare function getPlannerProfile(id?: string): PlannerProfile | undefined;
export declare function getPlannerProfileView(id?: string): PlannerProfileView;
export declare function getPlannerProfileRankingView(task: string, options?: { profileId?: string; profileFile?: string }): PlannerProfileRankingView;
export declare function registerPlannerProfile(profile: PlannerProfileDefinition, options?: { defaultProfileId?: string; makeDefault?: boolean }): PlannerProfileDefinition;
export declare function registerPlannerProfiles(profiles?: PlannerProfileDefinition[], options?: { defaultProfileId?: string; makeDefault?: boolean }): PlannerProfileDefinition[];
export declare function resetPlannerProfiles(): void;
export declare function planTask(task: string, options?: { profileId?: string }): TaskPlan;
export declare function planSwarm(task: string, options?: { profileId?: string }): PlannedSwarm;
export declare function queueTasksFromPlan(task: string, addTasksFn: (tasks: TaskInput[]) => TaskRecord[], options?: { profileId?: string }): QueuedPlan;

export declare function listMcpTools(): ToolCatalogEntry[];
export declare function getMcpToolEntry(name: string): ToolCatalogEntry | undefined;
export declare function getMcpToolView(name?: string): McpToolView;
export declare function getToolCatalogView(): ToolCatalogView;
export declare function handleMcpRequest(message: McpMessage): McpResponse;
export declare function callMcpTool(name: string, args?: JsonObject): unknown;
export declare function serializeMcpMessage(message: McpMessage): string;
export declare function runMcpCli(args?: string[]): Promise<void>;
export declare function startMcpServer(): Promise<void>;

export declare function addTask(input: TaskInput): TaskRecord;
export declare function getTask(id: string): TaskRecord | null;
export declare function getTaskView(id: string): TaskDetailView | null;
export declare function listArchivedTasks(): TaskRecord[];
export declare function getArchivedTask(id: string): TaskRecord | null;
export declare function listArchivedTasksView(): TaskArchiveListView;
export declare function getArchivedTaskView(id: string): TaskArchiveDetailView | null;
export declare function taskHistory(id: string): TaskHistoryView | null;
export declare function taskBrief(id: string): TaskExecutionBrief | null;
export declare function taskReport(id: string): TaskReportView | null;
export declare function initSwarm(input: SwarmInput): SwarmRecord;
export declare function getSwarm(id: string): SwarmRecord | null;
export declare function getSwarmView(id: string): SwarmDetailView | null;
export declare function listArchivedSwarms(): SwarmRecord[];
export declare function getArchivedSwarm(id: string): SwarmRecord | null;
export declare function listArchivedSwarmsView(): SwarmArchiveListView;
export declare function getArchivedSwarmView(id: string): SwarmArchiveDetailView | null;
export declare function archiveTask(input: { id: string; archivedBy?: string | null; notes?: string | null }): TaskRecord | { error: string };
export declare function restoreTask(input: { id: string; restoredBy?: string | null; notes?: string | null }): TaskRecord | { error: string };
export declare function reopenTask(input: { id: string; reopenedBy?: string | null; notes?: string | null }): TaskRecord | { error: string };
export declare function archiveSwarm(input: { id: string; archivedBy?: string | null; notes?: string | null }): SwarmRecord | { error: string };
export declare function restoreSwarm(input: { id: string; restoredBy?: string | null; notes?: string | null }): SwarmRecord | { error: string };
export declare function reopenSwarm(input: { id: string; reopenedBy?: string | null; notes?: string | null }): SwarmRecord | { error: string };
export declare function getMemory(id: string): MemoryRecord | null;
export declare function getMemoryView(id: string): MemoryDetailView | null;
export declare function listTasksView(): TaskListView;
export declare function listSwarmsView(filters?: SwarmFilters, options?: { detailed?: false }): SwarmListView;
export declare function listSwarmsView(filters: SwarmFilters | undefined, options: { detailed: true }): DetailedSwarmListView;
export declare function listMemoriesView(filters?: MemoryFilters): MemoryListView;
export declare function leaderAssignmentRanking(input?: { status?: string; topology?: string; owner?: string }): LeaderAssignmentRankingView;
export declare function leaderAssignments(input?: { status?: string; topology?: string; owner?: string }): unknown;
export declare function leaderAssignmentDispatch(input?: JsonObject): unknown;
export declare function leaderAssignmentDispatchBundle(input?: JsonObject): unknown;
export declare function leaderAssignmentLaunchPlan(input?: JsonObject): unknown;
export declare function leaderQueue(input?: { status?: string; topology?: string; owner?: string }): unknown;
export declare function leaderWorkspace(input?: { status?: string; topology?: string; owner?: string }): unknown;
export declare function runtimeActivity(input?: { limit?: number }): unknown;
export declare function runtimeAlerts(): unknown;
export declare function runtimeCloseout(): unknown;
export declare function runtimeDashboard(): unknown;
export declare function runtimeDispatch(): unknown;
export declare function runtimeDispatchRanking(): RuntimeDispatchRankingView;
export declare function runtimeFocus(): unknown;
export declare function runtimeFocusCandidates(): RuntimeFocusCandidatesView;
export declare function runtimeHandoffs(): unknown;
export declare function runtimeRecovery(): unknown;
export declare function runtimeReview(): unknown;
export declare function runtimeRoles(input?: { limit?: number }): unknown;
export declare function searchMemoriesView(query: string, filters?: MemoryFilters, limit?: number): MemorySearchView;
export declare function storeMemory(input: MemoryInput): MemoryRecord;
export declare function validateTask(id: string): TaskValidationView | null;
export declare function validateSwarm(id: string): SwarmValidationView | null;
export declare function stateFilePath(): string;
