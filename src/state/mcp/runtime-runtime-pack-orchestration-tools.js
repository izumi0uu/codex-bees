import {
  runtimeCloseoutPack,
  runtimeControlPack,
  runtimeDispatchPack,
  runtimeHandoffPack,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeQueuePack,
  runtimeRecoveryPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeTriagePack,
  runtimeWorkspacePack
} from "../../state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";

export const RUNTIME_PACK_ORCHESTRATION_MCP_TOOL_HANDLERS = {
  runtime_closeout_pack({ id, args }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("closeoutPack", runtimeCloseoutPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds
      }))
    );
  },

  runtime_control_pack({ id, args }) {
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

  runtime_signal_pack({ id, args }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("signalPack", runtimeSignalPack({ limit: params.arguments?.limit }))
    );
  },

  runtime_handoff_pack({ id }) {
    return createSuccess(id, createNamedTextPayload("handoffPack", runtimeHandoffPack()));
  },

  runtime_triage_pack({ id }) {
    return createSuccess(id, createNamedTextPayload("triagePack", runtimeTriagePack()));
  },

  runtime_recovery_pack({ id }) {
    return createSuccess(id, createNamedTextPayload("recoveryPack", runtimeRecoveryPack()));
  },

  runtime_queue_pack({ id, args }) {
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

  runtime_workspace_pack({ id, args }) {
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

  runtime_leader_pack({ id, args }) {
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

  runtime_operator_pack({ id }) {
    return createSuccess(id, createNamedTextPayload("operatorPack", runtimeOperatorPack()));
  },

  runtime_summary_pack({ id, args }) {
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

  runtime_dispatch_pack({ id, args }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("dispatchPack", runtimeDispatchPack({
        workerId: params.arguments?.workerId,
        workerIds: params.arguments?.workerIds,
        detail: params.arguments?.detail
      }))
    );
  }
};
