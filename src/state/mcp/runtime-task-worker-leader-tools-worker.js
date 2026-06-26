import {
  workerCloseout,
  workerHandoff,
  workerSession,
  verifierBundle
} from "../../state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";
import { requireRoleAndWorker } from "./runtime-tool-helpers.js";

export const TASK_WORKER_MCP_TOOL_HANDLERS = {
  worker_session({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "worker_session", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;

    const session = workerSession({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode,
      limit: params.arguments.limit
    });

    return createSuccess(id, createNamedTextPayload("session", session));
  },

  worker_handoff({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "worker_handoff", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;

    const handoff = workerHandoff({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode,
      limit: params.arguments.limit
    });

    return createSuccess(id, createNamedTextPayload("handoff", handoff));
  },

  worker_closeout({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "worker_closeout", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;

    const closeout = workerCloseout({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode,
      limit: params.arguments.limit
    });

    return createSuccess(id, createNamedTextPayload("closeout", closeout));
  },

  verifier_bundle({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "verifier_bundle", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;

    const bundle = verifierBundle({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      limit: params.arguments.limit
    });

    return createSuccess(id, createNamedTextPayload("bundle", bundle));
  }
};
