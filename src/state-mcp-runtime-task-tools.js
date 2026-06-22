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

const TASK_MCP_TOOL_HANDLERS = {
  task_list({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ tasks: listTasksView() }));
  },

  task_add({ id, args, metadata }) {
    const params = { arguments: args };
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

  task_annotate({ id, args, metadata }) {
    const params = { arguments: args };
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

  task_pickup({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_assignment_pickup({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

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
  },

  task_update({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_check({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_check requires arguments.id");
    }
    
    const validation = validateTask(params.arguments.id);
    if (!validation) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ validation }));
  },

  task_claim({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_block({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_ready_for_review({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_done({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_approve({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_reject({ id, args, metadata }) {
    const params = { arguments: args };
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
  },

  task_release({ id, args, metadata }) {
    const params = { arguments: args };
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
};

function handleTaskMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_MCP_TOOL_HANDLERS, handleTaskMcpTool };
