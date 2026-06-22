import {
  addTaskLifecycle,
  annotateTaskMutation,
  approveTaskLifecycle,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  getTaskView,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentDispatchPack,
  leaderAssignmentLaunchPlan,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace,
  listTasksView,
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

const TASK_WORKER_LEADER_MCP_TOOL_HANDLERS = {
  worker_session({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  worker_handoff({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  worker_closeout({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  verifier_bundle({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  leader_workspace({ id, args, metadata }) {
    const params = { arguments: args };
    const workspace = leaderWorkspace({
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    });
    
    return createSuccess(id, createTextPayload({ workspace }));
  },

  leader_queue({ id, args, metadata }) {
    const params = { arguments: args };
    const queue = leaderQueue({
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    });
    
    return createSuccess(id, createTextPayload({ queue }));
  },

  leader_assignments({ id, args, metadata }) {
    const params = { arguments: args };
    const assignments = leaderAssignments({
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    });
    
    return createSuccess(id, createTextPayload({ assignments }));
  },

  leader_assignment_dispatch({ id, args, metadata }) {
    const params = { arguments: args };
    const assignmentDispatch = leaderAssignmentDispatch({
      role: params.arguments?.role,
      owner: params.arguments?.owner,
      workerId: params.arguments?.workerId,
      taskId: params.arguments?.taskId,
      status: params.arguments?.status,
      topology: params.arguments?.topology
    });
    
    return createSuccess(id, createTextPayload({ assignmentDispatch }));
  },

  leader_assignment_dispatch_pack({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  leader_assignment_dispatch_bundle({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  leader_assignment_launch_plan({ id, args, metadata }) {
    const params = { arguments: args };
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
};

function handleTaskWorkerLeaderMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_WORKER_LEADER_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_WORKER_LEADER_MCP_TOOL_HANDLERS, handleTaskWorkerLeaderMcpTool };
