import { readJsonOption, readOption } from "./state-cli-helpers.js";
import { writeNamedView } from "./state-cli-view-writers.js";
import {
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentDispatchPack,
  leaderAssignmentLaunchPlan,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace
} from "./state-runtime.js";

function readLeaderSurfaceOptions() {
  return {
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  };
}

function readLeaderAssignmentOptions() {
  return {
    role: readOption("--role") ?? readOption("--owner"),
    workerId: readOption("--worker"),
    workerIds: readJsonOption("--workers"),
    taskId: readOption("--task"),
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  };
}

export function handleLeaderWorkspace() {
  const workspace = leaderWorkspace(readLeaderSurfaceOptions());
  writeNamedView("workspace", workspace);
}

export function handleLeaderQueue() {
  const queue = leaderQueue(readLeaderSurfaceOptions());
  writeNamedView("queue", queue);
}

export function handleLeaderAssignments() {
  const assignments = leaderAssignments(readLeaderSurfaceOptions());
  writeNamedView("assignments", assignments);
}

export function handleLeaderAssignmentDispatch() {
  const dispatch = leaderAssignmentDispatch(readLeaderAssignmentOptions());
  writeNamedView("assignmentDispatch", dispatch);
}

export function handleLeaderAssignmentDispatchPack() {
  const dispatchPack = leaderAssignmentDispatchPack(readLeaderAssignmentOptions());
  writeNamedView("assignmentDispatchPack", dispatchPack);
}

export function handleLeaderAssignmentDispatchBundle() {
  const dispatchBundle = leaderAssignmentDispatchBundle(readLeaderAssignmentOptions());
  writeNamedView("assignmentDispatchBundle", dispatchBundle);
}

export function handleLeaderAssignmentLaunchPlan() {
  const launchPlan = leaderAssignmentLaunchPlan(readLeaderAssignmentOptions());
  writeNamedView("assignmentLaunchPlan", launchPlan);
}
