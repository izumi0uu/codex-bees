import {
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentDispatchPack,
  leaderAssignmentLaunchPlan,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";

export const TASK_LEADER_MCP_TOOL_HANDLERS = {
  leader_workspace({ id, args, metadata }) {
    const params = { arguments: args };
    const workspace = leaderWorkspace({
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    });

    return createSuccess(id, createNamedTextPayload("workspace", workspace));
  },

  leader_queue({ id, args, metadata }) {
    const params = { arguments: args };
    const queue = leaderQueue({
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    });

    return createSuccess(id, createNamedTextPayload("queue", queue));
  },

  leader_assignments({ id, args, metadata }) {
    const params = { arguments: args };
    const assignments = leaderAssignments({
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    });

    return createSuccess(id, createNamedTextPayload("assignments", assignments));
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

    return createSuccess(id, createNamedTextPayload("assignmentDispatch", assignmentDispatch));
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

    return createSuccess(id, createNamedTextPayload("assignmentDispatchPack", assignmentDispatchPack));
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

    return createSuccess(id, createNamedTextPayload("assignmentDispatchBundle", assignmentDispatchBundle));
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

    return createSuccess(id, createNamedTextPayload("assignmentLaunchPlan", assignmentLaunchPlan));
  }
};
