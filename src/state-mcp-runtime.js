import { stdin, stdout, stderr } from "node:process";
import { getAgentCatalogEntryView, getAgentCatalogListView, getRuntimeCatalogView, getSkillCatalogEntryView, getSkillCatalogListView } from "./catalog.js";
import { getRuntimeDoctorView } from "./doctor.js";
import { getPackageMetadata, getPackageMetadataView } from "./metadata.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import { getRuntimeContractView } from "./runtime-contract.js";
import { getCoordinationOverviewView, getWorkerGuidelinesView } from "./runtime-guidance.js";
import { getRuntimeReadyView } from "./runtime-ready.js";
import { getCapabilityCatalogEntryView, getCapabilityCatalogView, getRuntimeStatusView } from "./runtime-status.js";
import { getCommandCatalogEntryView, getCommandCatalogView, getInitCommandCatalogEntryView, getInitCommandCatalogView } from "./state-command-core.js";
import { getCommandHelpView, getInitHelpView } from "./state-command-help.js";
import { getMcpCommandCatalogEntryView, getMcpCommandCatalogView, getMcpHelpView } from "./state-mcp-cli.js";
import { getMcpToolEntry, getMcpToolView, getToolCatalogView, toolCatalog } from "./state-mcp-tool-catalog.js";
import {
  activateSwarm,
  addTaskLifecycle,
  addTasks,
  annotateTaskMutation,
  approveTaskLifecycle,
  blockSwarm,
  blockTaskLifecycle,
  cancelSwarm,
  claimTaskLifecycle,
  completeSwarm,
  completeTaskLifecycle,
  dispatchSwarmLane,
  getMemoryView,
  getTaskView,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentDispatchPack,
  leaderAssignmentLaunchPlan,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace,
  listMemoriesView,
  listSwarmsView,
  listTasksView,
  markTaskReadyForReviewLifecycle,
  previewTaskAssignment,
  previewTaskPickup,
  queueSwarmTasks,
  rejectTaskLifecycle,
  releaseTaskLifecycle,
  runtimeActivity,
  runtimeAlerts,
  runtimeAssignmentPack,
  runtimeCloseout,
  runtimeCloseoutPack,
  runtimeControlPack,
  runtimeDashboard,
  runtimeDispatch,
  runtimeDispatchPack,
  runtimeExecutionPack,
  runtimeFocus,
  runtimeHandoffPack,
  runtimeHandoffs,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeQueuePack,
  runtimeRecovery,
  runtimeRecoveryPack,
  runtimeReview,
  runtimeReviewPack,
  runtimeRolePack,
  runtimeRoles,
  runtimeSessionPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeTriagePack,
  runtimeVerifierPack,
  runtimeWorkerPack,
  runtimeWorkspacePack,
  searchMemoriesView,
  storeMemoryMutation,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  syncSwarmStatus,
  taskAssignmentPickup,
  taskBrief,
  taskHistory,
  taskInbox,
  taskNext,
  taskPickup,
  taskReport,
  updateSwarmMutation,
  updateTaskMutation,
  validateSwarm,
  validateTask,
  verifierBundle,
  workerCloseout,
  workerHandoff,
  workerSession
} from "./state.js";

function createSuccess(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n";
}

function createError(id, code, message) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code, message }
  }) + "\n";
}

function createTextPayload(value) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }]
  };
}

function handleRequest(message) {
  const { id = null, method, params = {} } = message ?? {};
  const metadata = getPackageMetadata();

  if (method === "initialize") {
    return createSuccess(id, {
      serverInfo: {
        name: metadata.product,
        version: metadata.version
      },
      capabilities: {
        tools: { listChanged: false }
      }
    });
  }

  if (method === "tools/list") {
    return createSuccess(id, { tools: toolCatalog });
  }

  if (method === "tools/call") {
    const name = params.name;

    if (!getMcpToolEntry(name)) {
      return createError(id, -32602, `Unknown tool: ${name}`);
    }

    if (name === "coordination_overview") {
      return createSuccess(id, createTextPayload({ overview: getCoordinationOverviewView() }));
    }

    if (name === "package_metadata") {
      return createSuccess(id, createTextPayload({ metadata: getPackageMetadataView() }));
    }

    if (name === "runtime_doctor") {
      return createSuccess(id, createTextPayload({ doctor: getRuntimeDoctorView(import.meta.url) }));
    }

    if (name === "command_catalog") {
      return createSuccess(id, createTextPayload({ commands: getCommandCatalogView() }));
    }

    if (name === "command_catalog_entry") {
      if (!params.arguments?.command) {
        return createError(id, -32602, "command_catalog_entry requires arguments.command");
      }
      return createSuccess(id, createTextPayload({ command: getCommandCatalogEntryView(params.arguments.command) }));
    }

    if (name === "command_help") {
      if (!params.arguments?.command) {
        return createError(id, -32602, "command_help requires arguments.command");
      }
      return createSuccess(id, createTextPayload({ help: getCommandHelpView(params.arguments.command) }));
    }

    if (name === "init_command_catalog") {
      return createSuccess(id, createTextPayload({ options: getInitCommandCatalogView() }));
    }

    if (name === "init_command_option") {
      if (!params.arguments?.option) {
        return createError(id, -32602, "init_command_option requires arguments.option");
      }
      return createSuccess(id, createTextPayload({ option: getInitCommandCatalogEntryView(params.arguments.option) }));
    }

    if (name === "init_help") {
      if (!params.arguments?.option) {
        return createError(id, -32602, "init_help requires arguments.option");
      }
      return createSuccess(id, createTextPayload({ help: getInitHelpView(params.arguments.option) }));
    }

    if (name === "mcp_command_catalog") {
      return createSuccess(id, createTextPayload({ options: getMcpCommandCatalogView() }));
    }

    if (name === "mcp_command_option") {
      if (!params.arguments?.option) {
        return createError(id, -32602, "mcp_command_option requires arguments.option");
      }
      return createSuccess(id, createTextPayload({ option: getMcpCommandCatalogEntryView(params.arguments.option) }));
    }

    if (name === "mcp_help") {
      if (!params.arguments?.option) {
        return createError(id, -32602, "mcp_help requires arguments.option");
      }
      return createSuccess(id, createTextPayload({ help: getMcpHelpView(params.arguments.option) }));
    }

    if (name === "tool_catalog") {
      return createSuccess(id, createTextPayload({ tools: getToolCatalogView() }));
    }

    if (name === "tool_catalog_entry") {
      if (!params.arguments?.name) {
        return createError(id, -32602, "tool_catalog_entry requires arguments.name");
      }
      return createSuccess(id, createTextPayload({ tool: getMcpToolView(params.arguments.name) }));
    }

    if (name === "worker_guidelines") {
      return createSuccess(id, createTextPayload({ guidelines: getWorkerGuidelinesView() }));
    }

    if (name === "runtime_contract") {
      return createSuccess(id, createTextPayload({ contract: getRuntimeContractView() }));
    }

    if (name === "runtime_catalog") {
      return createSuccess(id, createTextPayload({ catalog: getRuntimeCatalogView() }));
    }

    if (name === "runtime_ready") {
      return createSuccess(id, createTextPayload({ ready: getRuntimeReadyView() }));
    }

    if (name === "runtime_catalog_agents") {
      return createSuccess(id, createTextPayload({ agents: getAgentCatalogListView() }));
    }

    if (name === "runtime_catalog_skills") {
      return createSuccess(id, createTextPayload({ skills: getSkillCatalogListView() }));
    }

    if (name === "runtime_catalog_agent") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "runtime_catalog_agent requires arguments.id");
      }
      return createSuccess(id, createTextPayload({ agent: getAgentCatalogEntryView(params.arguments.id) }));
    }

    if (name === "runtime_catalog_skill") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "runtime_catalog_skill requires arguments.id");
      }
      return createSuccess(id, createTextPayload({ skill: getSkillCatalogEntryView(params.arguments.id) }));
    }

    if (name === "runtime_status") {
      return createSuccess(
        id,
        createTextPayload({ status: getRuntimeStatusView({ version: metadata.version, toolCount: toolCatalog.length }) })
      );
    }

    if (name === "runtime_capabilities") {
      return createSuccess(id, createTextPayload({ capabilities: getCapabilityCatalogView() }));
    }

    if (name === "runtime_capability") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "runtime_capability requires arguments.id");
      }
      return createSuccess(id, createTextPayload({ capability: getCapabilityCatalogEntryView(params.arguments.id) }));
    }

    if (name === "runtime_activity") {
      return createSuccess(id, createTextPayload({ activity: runtimeActivity({ limit: params.arguments?.limit }) }));
    }

    if (name === "runtime_assignment_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_assignment_pack requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "runtime_assignment_pack requires arguments.workerId");
      }
      return createSuccess(
        id,
        createTextPayload({
          assignmentPack: runtimeAssignmentPack({
            role: params.arguments.role,
            workerId: params.arguments.workerId,
            mode: params.arguments.mode
          })
        })
      );
    }

    if (name === "runtime_closeout") {
      return createSuccess(id, createTextPayload({ closeout: runtimeCloseout() }));
    }

    if (name === "runtime_closeout_pack") {
      return createSuccess(id, createTextPayload({
        closeoutPack: runtimeCloseoutPack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      }));
    }

    if (name === "runtime_control_pack") {
      return createSuccess(id, createTextPayload({
        controlPack: runtimeControlPack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      }));
    }

    if (name === "runtime_signal_pack") {
      return createSuccess(id, createTextPayload({ signalPack: runtimeSignalPack({ limit: params.arguments?.limit }) }));
    }

    if (name === "runtime_handoff_pack") {
      return createSuccess(id, createTextPayload({ handoffPack: runtimeHandoffPack() }));
    }

    if (name === "runtime_triage_pack") {
      return createSuccess(id, createTextPayload({ triagePack: runtimeTriagePack() }));
    }

    if (name === "runtime_handoffs") {
      return createSuccess(id, createTextPayload({ handoffs: runtimeHandoffs() }));
    }

    if (name === "runtime_recovery_pack") {
      return createSuccess(id, createTextPayload({ recoveryPack: runtimeRecoveryPack() }));
    }

    if (name === "runtime_recovery") {
      return createSuccess(id, createTextPayload({ recovery: runtimeRecovery() }));
    }

    if (name === "runtime_review_pack") {
      return createSuccess(id, createTextPayload({
        reviewPack: runtimeReviewPack({
          role: params.arguments?.role,
          workerId: params.arguments?.workerId
        })
      }));
    }

    if (name === "runtime_session_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_session_pack requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "runtime_session_pack requires arguments.workerId");
      }
      return createSuccess(id, createTextPayload({
        sessionPack: runtimeSessionPack({
          role: params.arguments.role,
          workerId: params.arguments.workerId,
          mode: params.arguments.mode
        })
      }));
    }

    if (name === "runtime_queue_pack") {
      return createSuccess(id, createTextPayload({
        queuePack: runtimeQueuePack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      }));
    }

    if (name === "runtime_workspace_pack") {
      return createSuccess(id, createTextPayload({
        workspacePack: runtimeWorkspacePack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      }));
    }

    if (name === "runtime_leader_pack") {
      return createSuccess(
        id,
        createTextPayload({
          leaderPack: runtimeLeaderPack({
            status: params.arguments?.status,
            topology: params.arguments?.topology,
            owner: params.arguments?.owner,
            workerId: params.arguments?.workerId,
            workerIds: params.arguments?.workerIds
          })
        })
      );
    }

    if (name === "runtime_operator_pack") {
      return createSuccess(id, createTextPayload({ operatorPack: runtimeOperatorPack() }));
    }

    if (name === "runtime_owner_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_owner_pack requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "runtime_owner_pack requires arguments.workerId");
      }
      return createSuccess(
        id,
        createTextPayload({
          ownerPack: runtimeOwnerPack({
            role: params.arguments.role,
            workerId: params.arguments.workerId
          })
        })
      );
    }

    if (name === "runtime_pickup_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_pickup_pack requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "runtime_pickup_pack requires arguments.workerId");
      }
      return createSuccess(
        id,
        createTextPayload({
          pickupPack: runtimePickupPack({
            role: params.arguments.role,
            workerId: params.arguments.workerId,
            mode: params.arguments.mode
          })
        })
      );
    }

    if (name === "runtime_role_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_role_pack requires arguments.role");
      }
      return createSuccess(id, createTextPayload({
        rolePack: runtimeRolePack({
          role: params.arguments.role,
          workerId: params.arguments.workerId,
          mode: params.arguments.mode
        })
      }));
    }

    if (name === "runtime_summary_pack") {
      return createSuccess(id, createTextPayload({
        summaryPack: runtimeSummaryPack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      }));
    }

    if (name === "runtime_verifier_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_verifier_pack requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "runtime_verifier_pack requires arguments.workerId");
      }
      return createSuccess(
        id,
        createTextPayload({
          verifierPack: runtimeVerifierPack({
            role: params.arguments.role,
            workerId: params.arguments.workerId
          })
        })
      );
    }

    if (name === "runtime_worker_pack") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "runtime_worker_pack requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "runtime_worker_pack requires arguments.workerId");
      }
      return createSuccess(
        id,
        createTextPayload({
          workerPack: runtimeWorkerPack({
            role: params.arguments.role,
            workerId: params.arguments.workerId,
            mode: params.arguments.mode
          })
        })
      );
    }

    if (name === "runtime_dashboard") {
      return createSuccess(id, createTextPayload({ dashboard: runtimeDashboard() }));
    }

    if (name === "runtime_dispatch") {
      return createSuccess(id, createTextPayload({ dispatch: runtimeDispatch() }));
    }

    if (name === "runtime_dispatch_pack") {
      return createSuccess(
        id,
        createTextPayload({
          dispatchPack: runtimeDispatchPack({
            workerId: params.arguments?.workerId,
            workerIds: params.arguments?.workerIds
          })
        })
      );
    }

    if (name === "runtime_execution_pack") {
      return createSuccess(id, createTextPayload({
        executionPack: runtimeExecutionPack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      }));
    }

    if (name === "runtime_focus") {
      return createSuccess(id, createTextPayload({ focus: runtimeFocus() }));
    }

    if (name === "runtime_review") {
      return createSuccess(id, createTextPayload({ review: runtimeReview() }));
    }

    if (name === "runtime_alerts") {
      return createSuccess(id, createTextPayload({ alerts: runtimeAlerts() }));
    }

    if (name === "runtime_roles") {
      return createSuccess(id, createTextPayload({ roles: runtimeRoles({ limit: params.arguments?.limit }) }));
    }

    if (name === "task_list") {
      return createSuccess(id, createTextPayload({ tasks: listTasksView() }));
    }

    if (name === "task_add") {
      if (!params.arguments?.title) {
        return createError(id, -32602, "task_add requires arguments.title");
      }

      const task = addTaskLifecycle({
        title: params.arguments.title,
        status: params.arguments.status,
        owner: params.arguments.owner,
        verifier: params.arguments.verifier,
        objective: params.arguments.objective,
        lane: params.arguments.lane,
        swarmId: params.arguments.swarmId,
        scope: params.arguments.scope,
        acceptance: params.arguments.acceptance,
        verification: params.arguments.verification,
        notes: params.arguments.notes
      });

      return createSuccess(id, createTextPayload({ created: task }));
    }

    if (name === "task_get") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_get requires arguments.id");
      }

      const task = getTaskView(params.arguments.id);
      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ task }));
    }

    if (name === "task_history") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_history requires arguments.id");
      }

      const history = taskHistory(params.arguments.id);
      if (!history) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ history }));
    }

    if (name === "task_annotate") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_annotate requires arguments.id");
      }
      if (!params.arguments?.content) {
        return createError(id, -32602, "task_annotate requires arguments.content");
      }

      const annotated = annotateTaskMutation({
        id: params.arguments.id,
        actor: params.arguments.actor,
        kind: params.arguments.kind,
        content: params.arguments.content
      });
      if (!annotated) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (annotated.error) {
        return createError(id, -32602, annotated.error);
      }

      return createSuccess(id, createTextPayload({ annotated }));
    }

    if (name === "task_report") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_report requires arguments.id");
      }

      const report = taskReport(params.arguments.id);
      if (!report) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ report }));
    }

    if (name === "task_brief") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_brief requires arguments.id");
      }

      const brief = taskBrief(params.arguments.id);
      if (!brief) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ brief }));
    }

    if (name === "task_inbox") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "task_inbox requires arguments.role");
      }

      const inbox = taskInbox({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        limit: params.arguments.limit
      });

      return createSuccess(id, createTextPayload({ inbox }));
    }

    if (name === "task_next") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "task_next requires arguments.role");
      }

      const next = taskNext({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      });

      return createSuccess(id, createTextPayload({ next }));
    }

    if (name === "task_pickup") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "task_pickup requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "task_pickup requires arguments.workerId");
      }

      const pickup = taskPickup({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      });

      return createSuccess(id, createTextPayload({ pickup }));
    }

    if (name === "task_assignment_pickup") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "task_assignment_pickup requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "task_assignment_pickup requires arguments.workerId");
      }

      const assignmentPickup = taskAssignmentPickup({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode,
        taskId: params.arguments.taskId
      });

      return createSuccess(id, createTextPayload({ assignmentPickup }));
    }

    if (name === "task_assignment_preview") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "task_assignment_preview requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "task_assignment_preview requires arguments.workerId");
      }

      const assignmentPreview = previewTaskAssignment({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode,
        taskId: params.arguments.taskId
      });

      return createSuccess(id, createTextPayload({ assignmentPreview }));
    }

    if (name === "task_pickup_preview") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "task_pickup_preview requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "task_pickup_preview requires arguments.workerId");
      }

      const pickupPreview = previewTaskPickup({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      });

      return createSuccess(id, createTextPayload({ pickupPreview }));
    }

    if (name === "worker_session") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "worker_session requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "worker_session requires arguments.workerId");
      }

      const session = workerSession({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode,
        limit: params.arguments.limit
      });

      return createSuccess(id, createTextPayload({ session }));
    }

    if (name === "worker_handoff") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "worker_handoff requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "worker_handoff requires arguments.workerId");
      }

      const handoff = workerHandoff({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode,
        limit: params.arguments.limit
      });

      return createSuccess(id, createTextPayload({ handoff }));
    }

    if (name === "worker_closeout") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "worker_closeout requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "worker_closeout requires arguments.workerId");
      }

      const closeout = workerCloseout({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode,
        limit: params.arguments.limit
      });

      return createSuccess(id, createTextPayload({ closeout }));
    }

    if (name === "verifier_bundle") {
      if (!params.arguments?.role) {
        return createError(id, -32602, "verifier_bundle requires arguments.role");
      }
      if (!params.arguments?.workerId) {
        return createError(id, -32602, "verifier_bundle requires arguments.workerId");
      }

      const bundle = verifierBundle({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        limit: params.arguments.limit
      });

      return createSuccess(id, createTextPayload({ bundle }));
    }

    if (name === "leader_workspace") {
      const workspace = leaderWorkspace({
        status: params.arguments?.status,
        topology: params.arguments?.topology,
        owner: params.arguments?.owner
      });

      return createSuccess(id, createTextPayload({ workspace }));
    }

    if (name === "leader_queue") {
      const queue = leaderQueue({
        status: params.arguments?.status,
        topology: params.arguments?.topology,
        owner: params.arguments?.owner
      });

      return createSuccess(id, createTextPayload({ queue }));
    }

    if (name === "leader_assignments") {
      const assignments = leaderAssignments({
        status: params.arguments?.status,
        topology: params.arguments?.topology,
        owner: params.arguments?.owner
      });

      return createSuccess(id, createTextPayload({ assignments }));
    }

    if (name === "leader_assignment_dispatch") {
      const assignmentDispatch = leaderAssignmentDispatch({
        role: params.arguments?.role,
        owner: params.arguments?.owner,
        workerId: params.arguments?.workerId,
        taskId: params.arguments?.taskId,
        status: params.arguments?.status,
        topology: params.arguments?.topology
      });

      return createSuccess(id, createTextPayload({ assignmentDispatch }));
    }

    if (name === "leader_assignment_dispatch_pack") {
      const assignmentDispatchPack = leaderAssignmentDispatchPack({
        role: params.arguments?.role,
        owner: params.arguments?.owner,
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        taskId: params.arguments?.taskId,
        status: params.arguments?.status,
        topology: params.arguments?.topology
      });

      return createSuccess(id, createTextPayload({ assignmentDispatchPack }));
    }

    if (name === "leader_assignment_dispatch_bundle") {
      const assignmentDispatchBundle = leaderAssignmentDispatchBundle({
        role: params.arguments?.role,
        owner: params.arguments?.owner,
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        taskId: params.arguments?.taskId,
        status: params.arguments?.status,
        topology: params.arguments?.topology
      });

      return createSuccess(id, createTextPayload({ assignmentDispatchBundle }));
    }

    if (name === "leader_assignment_launch_plan") {
      const assignmentLaunchPlan = leaderAssignmentLaunchPlan({
        role: params.arguments?.role,
        owner: params.arguments?.owner,
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        taskId: params.arguments?.taskId,
        status: params.arguments?.status,
        topology: params.arguments?.topology
      });

      return createSuccess(id, createTextPayload({ assignmentLaunchPlan }));
    }

    if (name === "task_update") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_update requires arguments.id");
      }

      const task = updateTaskMutation({
        id: params.arguments.id,
        title: params.arguments.title,
        status: params.arguments.status,
        owner: params.arguments.owner,
        verifier: params.arguments.verifier,
        objective: params.arguments.objective,
        lane: params.arguments.lane,
        swarmId: params.arguments.swarmId,
        scope: params.arguments.scope,
        acceptance: params.arguments.acceptance,
        verification: params.arguments.verification,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ updated: task }));
    }

    if (name === "task_check") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_check requires arguments.id");
      }

      const validation = validateTask(params.arguments.id);
      if (!validation) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ validation }));
    }

    if (name === "task_claim") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_claim requires arguments.id");
      }
      if (!params.arguments?.claimedBy) {
        return createError(id, -32602, "task_claim requires arguments.claimedBy");
      }

      const task = claimTaskLifecycle({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ claimed: task }));
    }

    if (name === "task_block") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_block requires arguments.id");
      }

      const task = blockTaskLifecycle({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ blocked: task }));
    }

    if (name === "task_ready_for_review") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_ready_for_review requires arguments.id");
      }

      const task = markTaskReadyForReviewLifecycle({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy,
        notes: params.arguments.notes
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ readyForReview: task }));
    }

    if (name === "task_done") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_done requires arguments.id");
      }

      const task = completeTaskLifecycle({
        id: params.arguments.id,
        reviewedBy: params.arguments.reviewedBy ?? params.arguments.claimedBy,
        notes: params.arguments.notes,
        reviewEvidence: params.arguments.reviewEvidence
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ completed: task }));
    }

    if (name === "task_approve") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_approve requires arguments.id");
      }
      if (!params.arguments?.reviewedBy) {
        return createError(id, -32602, "task_approve requires arguments.reviewedBy");
      }

      const task = approveTaskLifecycle({
        id: params.arguments.id,
        reviewedBy: params.arguments.reviewedBy,
        notes: params.arguments.notes,
        reviewEvidence: params.arguments.reviewEvidence
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ approved: task }));
    }

    if (name === "task_reject") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_reject requires arguments.id");
      }
      if (!params.arguments?.reviewedBy) {
        return createError(id, -32602, "task_reject requires arguments.reviewedBy");
      }

      const task = rejectTaskLifecycle({
        id: params.arguments.id,
        reviewedBy: params.arguments.reviewedBy,
        nextQueueStatus: params.arguments.nextQueueStatus,
        notes: params.arguments.notes,
        reviewEvidence: params.arguments.reviewEvidence
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ rejected: task }));
    }

    if (name === "task_release") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "task_release requires arguments.id");
      }

      const task = releaseTaskLifecycle({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy
      });

      if (!task) {
        return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
      }
      if (task.error) {
        return createError(id, -32602, task.error);
      }

      return createSuccess(id, createTextPayload({ released: task }));
    }

    if (name === "swarm_list") {
      const filters = {
        status: params.arguments?.status,
        topology: params.arguments?.topology,
        owner: params.arguments?.owner
      };
      const swarms = listSwarmsView(filters, { detailed: params.arguments?.detailed === true });

      return createSuccess(id, createTextPayload({ swarms }));
    }

    if (name === "swarm_init") {
      if (!params.arguments?.objective) {
        return createError(id, -32602, "swarm_init requires arguments.objective");
      }

      const swarm = initSwarmMutation({
        objective: params.arguments.objective,
        topology: params.arguments.topology,
        maxWorkers: params.arguments.maxWorkers,
        owner: params.arguments.owner,
        laneSource: params.arguments.laneSource,
        notes: params.arguments.notes,
        lanes: params.arguments.lanes
      });

      return createSuccess(id, createTextPayload({ created: swarm }));
    }

    if (name === "swarm_get") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_get requires arguments.id");
      }

      const swarm = getSwarmView(params.arguments.id);
      if (!swarm) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ swarm }));
    }

    if (name === "swarm_bundle") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_bundle requires arguments.id");
      }

      const bundle = swarmBundle(params.arguments.id);
      if (!bundle) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ bundle }));
    }

    if (name === "swarm_blockers") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_blockers requires arguments.id");
      }

      const blockers = swarmBlockers(params.arguments.id);
      if (!blockers) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ blockers }));
    }

    if (name === "swarm_closeout") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_closeout requires arguments.id");
      }

      const closeout = swarmCloseout(params.arguments.id);
      if (!closeout) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ closeout }));
    }

    if (name === "swarm_dispatch_bundle") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_dispatch_bundle requires arguments.id");
      }

      const dispatchBundle = swarmDispatchBundle(params.arguments.id);
      if (!dispatchBundle) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ dispatchBundle }));
    }

    if (name === "swarm_brief") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_brief requires arguments.id");
      }

      const brief = swarmBrief(params.arguments.id);
      if (!brief) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ brief }));
    }

    if (name === "swarm_update") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_update requires arguments.id");
      }

      const swarm = updateSwarmMutation({
        id: params.arguments.id,
        objective: params.arguments.objective,
        topology: params.arguments.topology,
        maxWorkers: params.arguments.maxWorkers,
        owner: params.arguments.owner,
        laneSource: params.arguments.laneSource,
        notes: params.arguments.notes,
        lanes: params.arguments.lanes
      });

      if (!swarm) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (swarm.error) {
        return createError(id, -32602, swarm.error);
      }

      return createSuccess(id, createTextPayload({ updated: swarm }));
    }

    if (name === "swarm_check") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_check requires arguments.id");
      }

      const validation = validateSwarm(params.arguments.id);
      if (!validation) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ validation }));
    }

    if (name === "swarm_overview") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_overview requires arguments.id");
      }

      const overview = swarmOverview(params.arguments.id);
      if (!overview) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ overview }));
    }

    if (name === "swarm_dispatch") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_dispatch requires arguments.id");
      }
      if (!params.arguments?.claimedBy) {
        return createError(id, -32602, "swarm_dispatch requires arguments.claimedBy");
      }

      const result = dispatchSwarmLane({
        id: params.arguments.id,
        claimedBy: params.arguments.claimedBy,
        owner: params.arguments.owner
      });
      if (!result) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (result.error) {
        return createError(id, -32602, result.error);
      }

      return createSuccess(id, createTextPayload({ dispatched: result }));
    }

    if (name === "swarm_sync") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_sync requires arguments.id");
      }

      const result = syncSwarmStatus(params.arguments.id);
      if (!result) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ synced: result }));
    }

    if (name === "swarm_activate") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_activate requires arguments.id");
      }

      const swarm = activateSwarm({
        id: params.arguments.id,
        owner: params.arguments.owner,
        notes: params.arguments.notes
      });

      if (!swarm) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (swarm.error) {
        return createError(id, -32602, swarm.error);
      }

      return createSuccess(id, createTextPayload({ activated: swarm }));
    }

    if (name === "swarm_block") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_block requires arguments.id");
      }

      const swarm = blockSwarm({
        id: params.arguments.id,
        owner: params.arguments.owner,
        notes: params.arguments.notes
      });

      if (!swarm) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (swarm.error) {
        return createError(id, -32602, swarm.error);
      }

      return createSuccess(id, createTextPayload({ blocked: swarm }));
    }

    if (name === "swarm_done") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_done requires arguments.id");
      }

      const swarm = completeSwarm({
        id: params.arguments.id,
        owner: params.arguments.owner,
        notes: params.arguments.notes
      });

      if (!swarm) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (swarm.error) {
        return createError(id, -32602, swarm.error);
      }

      return createSuccess(id, createTextPayload({ completed: swarm }));
    }

    if (name === "swarm_cancel") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_cancel requires arguments.id");
      }

      const swarm = cancelSwarm({
        id: params.arguments.id,
        owner: params.arguments.owner,
        notes: params.arguments.notes
      });

      if (!swarm) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (swarm.error) {
        return createError(id, -32602, swarm.error);
      }

      return createSuccess(id, createTextPayload({ cancelled: swarm }));
    }

    if (name === "swarm_queue_tasks") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "swarm_queue_tasks requires arguments.id");
      }

      const result = queueSwarmTasks({ id: params.arguments.id });
      if (!result) {
        return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
      }
      if (result.error) {
        return createError(id, -32602, result.error);
      }

      return createSuccess(id, createTextPayload(result));
    }

    if (name === "plan_task") {
      if (!params.arguments?.task) {
        return createError(id, -32602, "plan_task requires arguments.task");
      }

      return createSuccess(id, createTextPayload(planTask(params.arguments.task)));
    }

    if (name === "queue_plan") {
      if (!params.arguments?.task) {
        return createError(id, -32602, "queue_plan requires arguments.task");
      }

      return createSuccess(
        id,
        createTextPayload(queueTasksFromPlan(params.arguments.task, addTasks))
      );
    }

    if (name === "plan_swarm") {
      if (!params.arguments?.task) {
        return createError(id, -32602, "plan_swarm requires arguments.task");
      }

      return createSuccess(id, createTextPayload(planSwarm(params.arguments.task)));
    }

    if (name === "queue_plan_swarm") {
      if (!params.arguments?.task) {
        return createError(id, -32602, "queue_plan_swarm requires arguments.task");
      }

      const planned = planSwarm(params.arguments.task);
      const swarm = initSwarm(planned.swarm);
      const queued = queueSwarmTasks({ id: swarm.id });
      if (!queued) {
        return createError(id, -32602, `Unknown swarm id: ${swarm.id}`);
      }
      if (queued.error) {
        return createError(id, -32602, queued.error);
      }

      return createSuccess(
        id,
        createTextPayload({
          kind: "queued_plan_swarm",
          recommendedReason: queued.created.length > 1 ? "multiple_swarm_lane_tasks_queued" : "single_swarm_lane_task_queued",
          objective: params.arguments.task,
          evidence: planned.evidence,
          swarm: queued.swarm,
          created: queued.created
        })
      );
    }

    if (name === "memory_store") {
      if (!params.arguments?.content) {
        return createError(id, -32602, "memory_store requires arguments.content");
      }

      const memory = storeMemoryMutation({
        content: params.arguments.content,
        namespace: params.arguments.namespace,
        kind: params.arguments.kind,
        title: params.arguments.title,
        agent: params.arguments.agent,
        tags: params.arguments.tags,
        notes: params.arguments.notes
      });

      return createSuccess(id, createTextPayload({ stored: memory }));
    }

    if (name === "memory_get") {
      if (!params.arguments?.id) {
        return createError(id, -32602, "memory_get requires arguments.id");
      }

      const memory = getMemoryView(params.arguments.id);
      if (!memory) {
        return createError(id, -32602, `Unknown memory id: ${params.arguments.id}`);
      }

      return createSuccess(id, createTextPayload({ memory }));
    }

    if (name === "memory_list") {
      const memories = listMemoriesView({
        namespace: params.arguments?.namespace,
        kind: params.arguments?.kind,
        agent: params.arguments?.agent,
        tags: params.arguments?.tags
      });

      return createSuccess(id, createTextPayload({ memories }));
    }

    if (name === "memory_search") {
      if (!params.arguments?.query) {
        return createError(id, -32602, "memory_search requires arguments.query");
      }

      const limit =
        Number.isFinite(Number(params.arguments.limit)) && Number(params.arguments.limit) > 0
          ? Number(params.arguments.limit)
          : 10;
      const results = searchMemoriesView(
        params.arguments.query,
        {
          namespace: params.arguments.namespace,
          kind: params.arguments.kind,
          agent: params.arguments.agent,
          tags: params.arguments.tags
        },
        limit
      );

      return createSuccess(id, createTextPayload(results));
    }
  }

  return createError(id, -32601, `Unsupported method: ${method}`);
}

export function handleMcpRequest(message) {
  return JSON.parse(handleRequest(message));
}

export function callMcpTool(name, args = {}) {
  const response = handleMcpRequest({
    jsonrpc: "2.0",
    id: null,
    method: "tools/call",
    params: {
      name,
      arguments: args
    }
  });

  if (response.error) {
    const error = new Error(response.error.message);
    error.code = response.error.code;
    throw error;
  }

  return response.result;
}

export function serializeMcpMessage(message) {
  return JSON.stringify(message) + "\n";
}

export async function startMcpServer() {
  stderr.write("[codex-bees:mcp] stdio runtime ready\n");

  let buffer = "";

  stdin.setEncoding("utf8");

  stdin.on("data", (chunk) => {
    buffer += chunk;

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line.length > 0) {
        try {
          const message = JSON.parse(line);
          stdout.write(handleRequest(message));
        } catch (error) {
          stdout.write(createError(null, -32700, `Invalid JSON input: ${error.message}`));
        }
      }

      newlineIndex = buffer.indexOf("\n");
    }
  });

  stdin.on("end", () => {
    stderr.write("[codex-bees:mcp] stdio runtime closed\n");
  });
}
