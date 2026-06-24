import {
  runtimeAssignmentPack,
  runtimeExecutionPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeReviewPack,
  runtimeRolePack,
  runtimeSessionPack,
  runtimeVerifierPack,
  runtimeWorkerPack
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import { requireArgument, requireRoleAndWorker } from "./state-mcp-runtime-tool-helpers.js";

export const RUNTIME_PACK_SESSION_MCP_TOOL_HANDLERS = {
  runtime_assignment_pack({ id, args }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "runtime_assignment_pack", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    return createSuccess(
      id,
      createNamedTextPayload("assignmentPack", runtimeAssignmentPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_review_pack({ id, args }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("reviewPack", runtimeReviewPack({
        role: params.arguments?.role,
        workerId: params.arguments?.workerId
      }))
    );
  },

  runtime_session_pack({ id, args }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "runtime_session_pack", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    return createSuccess(
      id,
      createNamedTextPayload("sessionPack", runtimeSessionPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_owner_pack({ id, args }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "runtime_owner_pack", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    return createSuccess(
      id,
      createNamedTextPayload("ownerPack", runtimeOwnerPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId
      }))
    );
  },

  runtime_pickup_pack({ id, args }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "runtime_pickup_pack", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    return createSuccess(
      id,
      createNamedTextPayload("pickupPack", runtimePickupPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_role_pack({ id, args }) {
    const params = { arguments: args };
    const roleRequired = requireArgument(id, "runtime_role_pack", params.arguments, "role");
    if (roleRequired) return roleRequired;
    return createSuccess(
      id,
      createNamedTextPayload("rolePack", runtimeRolePack({
        role: params.arguments.role,
        workerId: params.arguments?.workerId,
        mode: params.arguments?.mode
      }))
    );
  },

  runtime_verifier_pack({ id, args }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "runtime_verifier_pack", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    return createSuccess(
      id,
      createNamedTextPayload("verifierPack", runtimeVerifierPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId
      }))
    );
  },

  runtime_worker_pack({ id, args }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "runtime_worker_pack", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    return createSuccess(
      id,
      createNamedTextPayload("workerPack", runtimeWorkerPack({
        role: params.arguments.role,
        workerId: params.arguments.workerId,
        mode: params.arguments.mode
      }))
    );
  },

  runtime_execution_pack({ id, args }) {
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
