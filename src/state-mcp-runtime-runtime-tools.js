import {
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
  runtimeWorkspacePack
} from "./state.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const RUNTIME_MCP_TOOL_HANDLERS = {
  runtime_activity({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ activity: runtimeActivity({ limit: params.arguments?.limit }) }));
  },

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
      createTextPayload({
        assignmentPack: runtimeAssignmentPack({
          role: params.arguments.role,
          workerId: params.arguments.workerId,
          mode: params.arguments.mode
        })
      })
    );
  },

  runtime_closeout({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ closeout: runtimeCloseout() }));
  },

  runtime_closeout_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      closeoutPack: runtimeCloseoutPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      })
    }));
  },

  runtime_control_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      controlPack: runtimeControlPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      })
    }));
  },

  runtime_signal_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ signalPack: runtimeSignalPack({ limit: params.arguments?.limit }) }));
  },

  runtime_handoff_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ handoffPack: runtimeHandoffPack() }));
  },

  runtime_triage_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ triagePack: runtimeTriagePack() }));
  },

  runtime_handoffs({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ handoffs: runtimeHandoffs() }));
  },

  runtime_recovery_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ recoveryPack: runtimeRecoveryPack() }));
  },

  runtime_recovery({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ recovery: runtimeRecovery() }));
  },

  runtime_review_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      reviewPack: runtimeReviewPack({
        role: params.arguments?.role,
        workerId: params.arguments?.workerId
      })
    }));
  },

  runtime_session_pack({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  runtime_queue_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      queuePack: runtimeQueuePack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      })
    }));
  },

  runtime_workspace_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      workspacePack: runtimeWorkspacePack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      })
    }));
  },

  runtime_leader_pack({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  runtime_operator_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ operatorPack: runtimeOperatorPack() }));
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
      createTextPayload({
        ownerPack: runtimeOwnerPack({
          role: params.arguments.role,
          workerId: params.arguments.workerId
        })
      })
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
      createTextPayload({
        pickupPack: runtimePickupPack({
          role: params.arguments.role,
          workerId: params.arguments.workerId,
          mode: params.arguments.mode
        })
      })
    );
  },

  runtime_role_pack({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  runtime_summary_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      summaryPack: runtimeSummaryPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      })
    }));
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
      createTextPayload({
        verifierPack: runtimeVerifierPack({
          role: params.arguments.role,
          workerId: params.arguments.workerId
        })
      })
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
      createTextPayload({
        workerPack: runtimeWorkerPack({
          role: params.arguments.role,
          workerId: params.arguments.workerId,
          mode: params.arguments.mode
        })
      })
    );
  },

  runtime_dashboard({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ dashboard: runtimeDashboard() }));
  },

  runtime_dispatch({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ dispatch: runtimeDispatch() }));
  },

  runtime_dispatch_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createTextPayload({
        dispatchPack: runtimeDispatchPack({
          workerId: params.arguments?.workerId,
          workerIds: params.arguments?.workerIds
        })
      })
    );
  },

  runtime_execution_pack({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({
      executionPack: runtimeExecutionPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      })
    }));
  },

  runtime_focus({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ focus: runtimeFocus() }));
  },

  runtime_review({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ review: runtimeReview() }));
  },

  runtime_alerts({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ alerts: runtimeAlerts() }));
  },

  runtime_roles({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ roles: runtimeRoles({ limit: params.arguments?.limit }) }));
  }
};

function handleRuntimeMcpTool(id, name, args = {}, metadata) {
  const handler = RUNTIME_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { RUNTIME_MCP_TOOL_HANDLERS, handleRuntimeMcpTool };
