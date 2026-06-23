import {
  addTaskLifecycle,
  annotateTaskMutation,
  approveTaskLifecycle,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  getTaskView,
  getArchivedTaskView,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentDispatchPack,
  leaderAssignmentLaunchPlan,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace,
  listTasksView,
  listArchivedTasksView,
  markTaskReadyForReviewLifecycle,
  previewTaskAssignment,
  previewTaskPickup,
  rejectTaskLifecycle,
  releaseTaskLifecycle,
  taskAssignmentPickup,
  taskBrief,
  taskHistory,
  taskInbox,
  taskNext,
  taskPickup,
  taskReport,
  updateTaskMutation,
  validateTask,
  verifierBundle,
  workerCloseout,
  workerHandoff,
  workerSession
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import {
  createUnknownEntityError,
  requireArgument,
  requireRoleAndWorker
} from "./state-mcp-runtime-tool-helpers.js";

const TASK_QUERY_MCP_TOOL_HANDLERS = {
  task_list({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("tasks", listTasksView()));
  },

  task_archive_list({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("archivedTasks", listArchivedTasksView()));
  },

  task_get({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_get", params.arguments, "id");
    if (idRequired) return idRequired;
    
    const task = getTaskView(params.arguments.id);
    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    
    return createSuccess(id, createNamedTextPayload("task", task));
  },

  task_archive_get({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_archive_get", params.arguments, "id");
    if (idRequired) return idRequired;
    
    const archivedTask = getArchivedTaskView(params.arguments.id);
    if (!archivedTask) {
      return createUnknownEntityError(id, "task", params.arguments.id, { archived: true });
    }
    
    return createSuccess(id, createNamedTextPayload("archivedTask", archivedTask));
  },

  task_history({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_history", params.arguments, "id");
    if (idRequired) return idRequired;
    
    const history = taskHistory(params.arguments.id);
    if (!history) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    
    return createSuccess(id, createNamedTextPayload("history", history));
  },

  task_report({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_report", params.arguments, "id");
    if (idRequired) return idRequired;
    
    const report = taskReport(params.arguments.id);
    if (!report) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    
    return createSuccess(id, createNamedTextPayload("report", report));
  },

  task_brief({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_brief", params.arguments, "id");
    if (idRequired) return idRequired;
    
    const brief = taskBrief(params.arguments.id);
    if (!brief) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    
    return createSuccess(id, createNamedTextPayload("brief", brief));
  },

  task_inbox({ id, args, metadata }) {
    const params = { arguments: args };
    const roleRequired = requireArgument(id, "task_inbox", params.arguments, "role");
    if (roleRequired) return roleRequired;
    
    const inbox = taskInbox({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      limit: params.arguments.limit
    });
    
    return createSuccess(id, createNamedTextPayload("inbox", inbox));
  },

  task_next({ id, args, metadata }) {
    const params = { arguments: args };
    const roleRequired = requireArgument(id, "task_next", params.arguments, "role");
    if (roleRequired) return roleRequired;
    
    const next = taskNext({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode
    });
    
    return createSuccess(id, createNamedTextPayload("next", next));
  },

  task_assignment_preview({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "task_assignment_preview", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    
    const assignmentPreview = previewTaskAssignment({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode,
      taskId: params.arguments.taskId
    });
    
    return createSuccess(id, createNamedTextPayload("assignmentPreview", assignmentPreview));
  },

  task_pickup_preview({ id, args, metadata }) {
    const params = { arguments: args };
    const roleAndWorkerRequired = requireRoleAndWorker(id, "task_pickup_preview", params.arguments);
    if (roleAndWorkerRequired) return roleAndWorkerRequired;
    
    const pickupPreview = previewTaskPickup({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode
    });
    
    return createSuccess(id, createNamedTextPayload("pickupPreview", pickupPreview));
  }
};

function handleTaskQueryMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_QUERY_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_QUERY_MCP_TOOL_HANDLERS, handleTaskQueryMcpTool };
