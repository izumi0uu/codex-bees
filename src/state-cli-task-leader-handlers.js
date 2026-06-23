import { readJsonOption, readOption, write } from "./state-cli-helpers.js";
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
  write(JSON.stringify({ workspace }, null, 2) + "\n");
}

export function handleLeaderQueue() {
  const queue = leaderQueue(readLeaderSurfaceOptions());
  write(JSON.stringify({ queue }, null, 2) + "\n");
}

export function handleLeaderAssignments() {
  const assignments = leaderAssignments(readLeaderSurfaceOptions());
  write(JSON.stringify({ assignments }, null, 2) + "\n");
}

export function handleLeaderAssignmentDispatch() {
  const dispatch = leaderAssignmentDispatch(readLeaderAssignmentOptions());
  write(JSON.stringify({ assignmentDispatch: dispatch }, null, 2) + "\n");
}

export function handleLeaderAssignmentDispatchPack() {
  const dispatchPack = leaderAssignmentDispatchPack(readLeaderAssignmentOptions());
  write(JSON.stringify({ assignmentDispatchPack: dispatchPack }, null, 2) + "\n");
}

export function handleLeaderAssignmentDispatchBundle() {
  const dispatchBundle = leaderAssignmentDispatchBundle(readLeaderAssignmentOptions());
  write(JSON.stringify({ assignmentDispatchBundle: dispatchBundle }, null, 2) + "\n");
}

export function handleLeaderAssignmentLaunchPlan() {
  const launchPlan = leaderAssignmentLaunchPlan(readLeaderAssignmentOptions());
  write(JSON.stringify({ assignmentLaunchPlan: launchPlan }, null, 2) + "\n");
}
