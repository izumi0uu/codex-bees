import {
  runtimeAssignmentPack,
  runtimeCloseoutPack,
  runtimeControlPack,
  runtimeDispatchPack,
  runtimeExecutionPack,
  runtimeHandoffPack,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeQueuePack,
  runtimeRecoveryPack,
  runtimeReviewPack,
  runtimeRolePack,
  runtimeSessionPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeTriagePack,
  runtimeVerifierPack,
  runtimeWorkerPack,
  runtimeWorkspacePack
} from "./state-runtime.js";
import { createError, createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";

const RUNTIME_PACK_MCP_TOOL_HANDLERS = {
  runtime_assignment_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_assignment_pack requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "runtime_assignment_pack requires arguments.workerId");
    }
    return createSuccess(
      id,
      createNamedTextPayload("assignmentPack", runtimeAssignmentPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_closeout_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("closeoutPack", runtimeCloseoutPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      }))
    );
  },

  runtime_control_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("controlPack", runtimeControlPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  },

  runtime_signal_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("signalPack", runtimeSignalPack({ limit: params.arguments?.limit }))
    );
  },

  runtime_handoff_pack({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("handoffPack", runtimeHandoffPack()));
  },

  runtime_triage_pack({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("triagePack", runtimeTriagePack()));
  },

  runtime_recovery_pack({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("recoveryPack", runtimeRecoveryPack()));
  },

  runtime_review_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("reviewPack", runtimeReviewPack({
        role: params.arguments?.role,
        workerId: params.arguments?.workerId
      }))
    );
  },

  runtime_session_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_session_pack requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "runtime_session_pack requires arguments.workerId");
    }
    return createSuccess(
      id,
      createNamedTextPayload("sessionPack", runtimeSessionPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_queue_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("queuePack", runtimeQueuePack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  },

  runtime_workspace_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("workspacePack", runtimeWorkspacePack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  },

  runtime_leader_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("leaderPack", runtimeLeaderPack({
        status: params.arguments?.status,
        topology: params.arguments?.topology,
        owner: params.arguments?.owner,
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  },

  runtime_operator_pack({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("operatorPack", runtimeOperatorPack()));
  },

  runtime_owner_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_owner_pack requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "runtime_owner_pack requires arguments.workerId");
    }
    return createSuccess(
      id,
      createNamedTextPayload("ownerPack", runtimeOwnerPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId
      }))
    );
  },

  runtime_pickup_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_pickup_pack requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "runtime_pickup_pack requires arguments.workerId");
    }
    return createSuccess(
      id,
      createNamedTextPayload("pickupPack", runtimePickupPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_role_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_role_pack requires arguments.role");
    }
    return createSuccess(
      id,
      createNamedTextPayload("rolePack", runtimeRolePack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_summary_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("summaryPack", runtimeSummaryPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  },

  runtime_verifier_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_verifier_pack requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "runtime_verifier_pack requires arguments.workerId");
    }
    return createSuccess(
      id,
      createNamedTextPayload("verifierPack", runtimeVerifierPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId
      }))
    );
  },

  runtime_worker_pack({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "runtime_worker_pack requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "runtime_worker_pack requires arguments.workerId");
    }
    return createSuccess(
      id,
      createNamedTextPayload("workerPack", runtimeWorkerPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_dispatch_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("dispatchPack", runtimeDispatchPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  },

  runtime_execution_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("executionPack", runtimeExecutionPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  }
};

function handleRuntimePackMcpTool(id, name, args = {}, metadata) {
  const handler = RUNTIME_PACK_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { RUNTIME_PACK_MCP_TOOL_HANDLERS, handleRuntimePackMcpTool };
