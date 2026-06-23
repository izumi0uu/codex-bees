#!/usr/bin/env node

import { argv, env, exit } from "node:process";
import { fileURLToPath } from "node:url";
import { PACKAGE_VERSION } from "./metadata.js";
import { runMcpCli } from "./mcp.js";
import { isCliEntrypoint, write, writeErr } from "./state-cli-helpers.js";
import { handleInit } from "./state-cli-init.js";
import {
  printCapabilities,
  printCapabilityView,
  printCatalog,
  printCatalogAgentView,
  printCatalogAgentDocumentView,
  printCatalogAgentsView,
  printCatalogSkillView,
  printCatalogSkillDocumentView,
  printCatalogSkillsView,
  printCommandHelpView,
  printCommandsView,
  printCommandView,
  printContractView,
  printDoctor,
  printGuidanceOverviewView,
  printGuidanceWorkerView,
  printHelp,
  printInitHelpView,
  printInitOptionView,
  printInitOptionsView,
  printMcpHelpView,
  printMcpOptionView,
  printMcpOptionsView,
  printMetadata,
  printReadyView,
  printRunSurface,
  printStatus,
  printToolView,
  printToolsView
} from "./state-cli-core-views.js";
import {
  printRuntimeActivity,
  printRuntimeAlerts,
  printRuntimeAssignmentPack,
  printRuntimeCloseout,
  printRuntimeCloseoutPack,
  printRuntimeControlPack,
  printRuntimeDashboard,
  printRuntimeDispatch,
  printRuntimeDispatchPack,
  printRuntimeExecutionPack,
  printRuntimeFocus,
  printRuntimeHandoffPack,
  printRuntimeHandoffs,
  printRuntimeLeaderPack,
  printRuntimeOperatorPack,
  printRuntimeOwnerPack,
  printRuntimePickupPack,
  printRuntimeQueuePack,
  printRuntimeRecovery,
  printRuntimeRecoveryPack,
  printRuntimeReview,
  printRuntimeReviewPack,
  printRuntimeRolePack,
  printRuntimeRoles,
  printRuntimeSessionPack,
  printRuntimeSignalPack,
  printRuntimeSummaryPack,
  printRuntimeTriagePack,
  printRuntimeVerifierPack,
  printRuntimeWorkerPack,
  printRuntimeWorkspacePack
} from "./state-cli-runtime-views.js";
import {
  handleLeaderAssignmentDispatch,
  handleLeaderAssignmentDispatchBundle,
  handleLeaderAssignmentDispatchPack,
  handleLeaderAssignmentLaunchPlan,
  handleLeaderAssignments,
  handleLeaderQueue,
  handleLeaderWorkspace,
  handleTaskAdd,
  handleTaskAnnotate,
  handleTaskApprove,
  handleTaskArchive,
  handleTaskArchiveGet,
  handleTaskArchiveList,
  handleTaskAssignmentPickup,
  handleTaskAssignmentPreview,
  handleTaskBlock,
  handleTaskBrief,
  handleTaskCheck,
  handleTaskClaim,
  handleTaskDone,
  handleTaskGet,
  handleTaskHistory,
  handleTaskInbox,
  handleTaskNext,
  handleTaskPickup,
  handleTaskPickupPreview,
  handleTaskReopen,
  handleTaskReject,
  handleTaskRelease,
  handleTaskReport,
  handleTaskReview,
  handleTaskRestore,
  handleTaskUpdate,
  handleVerifierBundle,
  handleWorkerCloseout,
  handleWorkerHandoff,
  handleWorkerSession,
  printTasks
} from "./state-cli-task-handlers.js";
import {
  handleMemoryGet,
  handleMemoryList,
  handleMemorySearch,
  handleMemoryStore,
  handlePlan,
  handlePlanProfile,
  handlePlanProfiles,
  handlePlanQueue,
  handlePlanSwarm,
  handlePlanSwarmQueue,
  handleSwarmArchive,
  handleSwarmArchiveGet,
  handleSwarmArchiveList,
  handleSwarmBlock,
  handleSwarmBlockers,
  handleSwarmBrief,
  handleSwarmBundle,
  handleSwarmCancel,
  handleSwarmCheck,
  handleSwarmCloseout,
  handleSwarmDispatch,
  handleSwarmDispatchBundle,
  handleSwarmDone,
  handleSwarmGet,
  handleSwarmInit,
  handleSwarmOverview,
  handleSwarmQueue,
  handleSwarmReopen,
  handleSwarmRestore,
  handleSwarmStart,
  handleSwarmSync,
  handleSwarmUpdate,
  printSwarms
} from "./state-cli-plan-swarm-memory.js";

const MODULE_PATH = fileURLToPath(import.meta.url);
const MCP_CLI_USAGE_ERROR_CODE = "CODEX_BEES_MCP_USAGE";

async function runCommand(command) {
  switch (command) {
    case undefined:
    case "run":
      printRunSurface();
      return;
    case "ready":
      printReadyView();
      return;
    case "commands":
      printCommandsView();
      return;
    case "command:get":
      printCommandView();
      return;
    case "command:help":
      printCommandHelpView();
      return;
    case "mcp":
      await runMcpCli(argv.slice(3));
      return;
    case "mcp:options":
      printMcpOptionsView();
      return;
    case "mcp:option":
      printMcpOptionView();
      return;
    case "mcp:help":
      printMcpHelpView();
      return;
    case "init":
      handleInit();
      return;
    case "init:options":
      printInitOptionsView();
      return;
    case "init:option":
      printInitOptionView();
      return;
    case "init:help":
      printInitHelpView();
      return;
    case "tools":
      printToolsView();
      return;
    case "tools:get":
      printToolView();
      return;
    case "doctor":
      printDoctor();
      return;
    case "catalog":
      printCatalog();
      return;
    case "catalog:agents":
      printCatalogAgentsView();
      return;
    case "catalog:agent":
      printCatalogAgentView();
      return;
    case "catalog:agent-doc":
      printCatalogAgentDocumentView();
      return;
    case "catalog:skills":
      printCatalogSkillsView();
      return;
    case "catalog:skill":
      printCatalogSkillView();
      return;
    case "catalog:skill-doc":
      printCatalogSkillDocumentView();
      return;
    case "guidance:overview":
      printGuidanceOverviewView();
      return;
    case "guidance:worker":
      printGuidanceWorkerView();
      return;
    case "contract":
      printContractView();
      return;
    case "metadata":
      printMetadata();
      return;
    case "status":
      printStatus();
      return;
    case "capabilities":
      printCapabilities();
      return;
    case "capabilities:get":
      printCapabilityView();
      return;
    case "runtime:activity":
      printRuntimeActivity();
      return;
    case "runtime:assignment-pack":
      printRuntimeAssignmentPack();
      return;
    case "runtime:closeout":
      printRuntimeCloseout();
      return;
    case "runtime:closeout-pack":
      printRuntimeCloseoutPack();
      return;
    case "runtime:control-pack":
      printRuntimeControlPack();
      return;
    case "runtime:signal-pack":
      printRuntimeSignalPack();
      return;
    case "runtime:execution-pack":
      printRuntimeExecutionPack();
      return;
    case "runtime:handoff-pack":
      printRuntimeHandoffPack();
      return;
    case "runtime:pickup-pack":
      printRuntimePickupPack();
      return;
    case "runtime:triage-pack":
      printRuntimeTriagePack();
      return;
    case "runtime:handoffs":
      printRuntimeHandoffs();
      return;
    case "runtime:leader-pack":
      printRuntimeLeaderPack();
      return;
    case "runtime:operator-pack":
      printRuntimeOperatorPack();
      return;
    case "runtime:recovery-pack":
      printRuntimeRecoveryPack();
      return;
    case "runtime:review-pack":
      printRuntimeReviewPack();
      return;
    case "runtime:session-pack":
      printRuntimeSessionPack();
      return;
    case "runtime:queue-pack":
      printRuntimeQueuePack();
      return;
    case "runtime:workspace-pack":
      printRuntimeWorkspacePack();
      return;
    case "runtime:owner-pack":
      printRuntimeOwnerPack();
      return;
    case "runtime:role-pack":
      printRuntimeRolePack();
      return;
    case "runtime:verifier-pack":
      printRuntimeVerifierPack();
      return;
    case "runtime:worker-pack":
      printRuntimeWorkerPack();
      return;
    case "runtime:recovery":
      printRuntimeRecovery();
      return;
    case "runtime:summary-pack":
      printRuntimeSummaryPack();
      return;
    case "runtime:dashboard":
      printRuntimeDashboard();
      return;
    case "runtime:dispatch":
      printRuntimeDispatch();
      return;
    case "runtime:dispatch-pack":
      printRuntimeDispatchPack();
      return;
    case "runtime:focus":
      printRuntimeFocus();
      return;
    case "runtime:review":
      printRuntimeReview();
      return;
    case "runtime:alerts":
      printRuntimeAlerts();
      return;
    case "runtime:roles":
      printRuntimeRoles();
      return;
    case "plan:profiles":
      handlePlanProfiles();
      return;
    case "plan:profile":
      handlePlanProfile();
      return;
    case "plan":
      handlePlan();
      return;
    case "plan:queue":
      handlePlanQueue();
      return;
    case "plan:swarm":
      handlePlanSwarm();
      return;
    case "plan:swarm:queue":
      handlePlanSwarmQueue();
      return;
    case "task:list":
      printTasks();
      return;
    case "task:add":
      handleTaskAdd();
      return;
    case "task:get":
      handleTaskGet();
      return;
    case "task:archive:list":
      handleTaskArchiveList();
      return;
    case "task:archive:get":
      handleTaskArchiveGet();
      return;
    case "task:history":
      handleTaskHistory();
      return;
    case "task:annotate":
      handleTaskAnnotate();
      return;
    case "task:report":
      handleTaskReport();
      return;
    case "task:brief":
      handleTaskBrief();
      return;
    case "task:inbox":
      handleTaskInbox();
      return;
    case "task:next":
      handleTaskNext();
      return;
    case "task:assignment-preview":
      handleTaskAssignmentPreview();
      return;
    case "task:assignment-pickup":
      handleTaskAssignmentPickup();
      return;
    case "task:pickup-preview":
      handleTaskPickupPreview();
      return;
    case "task:pickup":
      handleTaskPickup();
      return;
    case "worker:session":
      handleWorkerSession();
      return;
    case "worker:handoff":
      handleWorkerHandoff();
      return;
    case "worker:closeout":
      handleWorkerCloseout();
      return;
    case "verifier:bundle":
      handleVerifierBundle();
      return;
    case "leader:workspace":
      handleLeaderWorkspace();
      return;
    case "leader:queue":
      handleLeaderQueue();
      return;
    case "leader:assignments":
      handleLeaderAssignments();
      return;
    case "leader:assignment-dispatch":
      handleLeaderAssignmentDispatch();
      return;
    case "leader:assignment-dispatch-bundle":
      handleLeaderAssignmentDispatchBundle();
      return;
    case "leader:assignment-launch-plan":
      handleLeaderAssignmentLaunchPlan();
      return;
    case "leader:assignment-dispatch-pack":
      handleLeaderAssignmentDispatchPack();
      return;
    case "task:claim":
      handleTaskClaim();
      return;
    case "task:block":
      handleTaskBlock();
      return;
    case "task:review":
      handleTaskReview();
      return;
    case "task:approve":
      handleTaskApprove();
      return;
    case "task:reject":
      handleTaskReject();
      return;
    case "task:done":
      handleTaskDone();
      return;
    case "task:archive":
      handleTaskArchive();
      return;
    case "task:restore":
      handleTaskRestore();
      return;
    case "task:reopen":
      handleTaskReopen();
      return;
    case "task:release":
      handleTaskRelease();
      return;
    case "task:update":
      handleTaskUpdate();
      return;
    case "task:check":
      handleTaskCheck();
      return;
    case "swarm:init":
      handleSwarmInit();
      return;
    case "swarm:list":
      printSwarms();
      return;
    case "swarm:get":
      handleSwarmGet();
      return;
    case "swarm:archive:list":
      handleSwarmArchiveList();
      return;
    case "swarm:archive:get":
      handleSwarmArchiveGet();
      return;
    case "swarm:brief":
      handleSwarmBrief();
      return;
    case "swarm:bundle":
      handleSwarmBundle();
      return;
    case "swarm:blockers":
      handleSwarmBlockers();
      return;
    case "swarm:closeout":
      handleSwarmCloseout();
      return;
    case "swarm:archive":
      handleSwarmArchive();
      return;
    case "swarm:restore":
      handleSwarmRestore();
      return;
    case "swarm:reopen":
      handleSwarmReopen();
      return;
    case "swarm:dispatch-bundle":
      handleSwarmDispatchBundle();
      return;
    case "swarm:update":
      handleSwarmUpdate();
      return;
    case "swarm:check":
      handleSwarmCheck();
      return;
    case "swarm:overview":
      handleSwarmOverview();
      return;
    case "swarm:dispatch":
      handleSwarmDispatch();
      return;
    case "swarm:sync":
      handleSwarmSync();
      return;
    case "swarm:start":
      handleSwarmStart();
      return;
    case "swarm:block":
      handleSwarmBlock();
      return;
    case "swarm:done":
      handleSwarmDone();
      return;
    case "swarm:cancel":
      handleSwarmCancel();
      return;
    case "swarm:queue":
      handleSwarmQueue();
      return;
    case "memory:store":
      handleMemoryStore();
      return;
    case "memory:get":
      handleMemoryGet();
      return;
    case "memory:list":
      handleMemoryList();
      return;
    case "memory:search":
      handleMemorySearch();
      return;
    case "--help":
    case "help":
      printHelp();
      return;
    case "--version":
    case "version":
      write(`${PACKAGE_VERSION}\n`);
      return;
    default:
      writeErr(`Unknown command: ${command}\n\n`);
      printHelp();
      exit(1);
  }
}

if (isCliEntrypoint(MODULE_PATH)) {
  if (env.CODEX_BEES_CLI_TRACE === "1") {
    writeErr(`[codex-bees] argv=${JSON.stringify(argv.slice(2))}
`);
  }

  runCommand(argv[2]).catch((error) => {
    writeErr(`${error?.code === MCP_CLI_USAGE_ERROR_CODE ? error.message : error.stack || error.message}
`);
    exit(1);
  });
}
