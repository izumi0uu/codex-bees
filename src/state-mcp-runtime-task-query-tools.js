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
} from "./state.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const TASK_QUERY_MCP_TOOL_HANDLERS = {
  task_list({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ tasks: listTasksView() }));
  },

  task_archive_list({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ archivedTasks: listArchivedTasksView() }));
  },

  task_get({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_get requires arguments.id");
    }
    
    const task = getTaskView(params.arguments.id);
    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ task }));
  },

  task_archive_get({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_archive_get requires arguments.id");
    }
    
    const archivedTask = getArchivedTaskView(params.arguments.id);
    if (!archivedTask) {
      return createError(id, -32602, `Unknown archived task id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ archivedTask }));
  },

  task_history({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_history requires arguments.id");
    }
    
    const history = taskHistory(params.arguments.id);
    if (!history) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ history }));
  },

  task_report({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_report requires arguments.id");
    }
    
    const report = taskReport(params.arguments.id);
    if (!report) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ report }));
  },

  task_brief({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_brief requires arguments.id");
    }
    
    const brief = taskBrief(params.arguments.id);
    if (!brief) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ brief }));
  },

  task_inbox({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "task_inbox requires arguments.role");
    }
    
    const inbox = taskInbox({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      limit: params.arguments.limit
    });
    
    return createSuccess(id, createTextPayload({ inbox }));
  },

  task_next({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "task_next requires arguments.role");
    }
    
    const next = taskNext({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode
    });
    
    return createSuccess(id, createTextPayload({ next }));
  },

  task_assignment_preview({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_pickup_preview({ id, args, metadata }) {
    const params = { arguments: args };
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
};

function handleTaskQueryMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_QUERY_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_QUERY_MCP_TOOL_HANDLERS, handleTaskQueryMcpTool };
