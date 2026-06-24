import { taskAssignmentPickup, taskPickup } from "./state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import { requireRoleAndWorker } from "./state-mcp-runtime-tool-helpers.js";

export const TASK_TRANSITION_PICKUP_MCP_TOOL_HANDLERS = {
  task_pickup({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "task_pickup", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;

    const pickup = taskPickup({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode
    });

    return createSuccess(id, createNamedTextPayload("pickup", pickup));
  },

  task_assignment_pickup({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "task_assignment_pickup", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;

    const assignmentPickup = taskAssignmentPickup({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode,
      taskId: params.arguments.taskId
    });

    return createSuccess(id, createNamedTextPayload("assignmentPickup", assignmentPickup));
  }
};
