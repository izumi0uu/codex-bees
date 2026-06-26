import { recommendTaskAction } from "./core-views.js";
import { pickPriorityEntry } from "../../state/queue/views.js";

export function recommendLaneAction(laneSummary, task, tasks = [], recommendTaskActionFn = recommendTaskAction) {
  if (!task) {
    return {
      actor: {
        type: "swarm_owner",
        id: laneSummary.owner
      },
      action: "queue_lane_task",
      commands: []
    };
  }

  return recommendTaskActionFn(task, tasks);
}

export function recommendSwarmAction(overview, lanes) {
  const pendingReviewLane = pickPriorityEntry(lanes, (lane) => lane.taskQueueStatus === "ready_for_review");
  if (pendingReviewLane) {
    return {
      actor: pendingReviewLane.recommendedNextActor,
      action: `review_lane:${pendingReviewLane.lane}`,
      commands: pendingReviewLane.recommendedCommands
    };
  }

  const runnableLane = pickPriorityEntry(lanes, (lane) => lane.ready === true);
  if (runnableLane) {
    return {
      actor: runnableLane.recommendedNextActor,
      action: `dispatch_lane:${runnableLane.lane}`,
      commands: [
        `node ./src/index.js swarm:dispatch --id ${overview.swarm.id} --by <worker-id> --owner ${runnableLane.owner.id ?? "<owner-role>"}`
      ]
    };
  }

  const claimedLane = pickPriorityEntry(lanes, (lane) => lane.taskQueueStatus === "claimed");
  if (claimedLane) {
    return {
      actor: claimedLane.recommendedNextActor,
      action: `continue_lane:${claimedLane.lane}`,
      commands: claimedLane.recommendedCommands
    };
  }

  const blockedLane = pickPriorityEntry(lanes, (lane) => lane.taskQueueStatus === "blocked");
  if (blockedLane) {
    return {
      actor: blockedLane.recommendedNextActor,
      action: `unblock_lane:${blockedLane.lane}`,
      commands: blockedLane.recommendedCommands
    };
  }

  const dependencyWaitingLane = pickPriorityEntry(
    lanes,
    (lane) =>
      (lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released") &&
      lane.dependencyReady === false
  );
  if (dependencyWaitingLane) {
    return {
      actor: dependencyWaitingLane.recommendedNextActor,
      action: `wait_on_dependencies:${dependencyWaitingLane.lane}`,
      commands: dependencyWaitingLane.recommendedCommands
    };
  }

  if (overview.counts.unqueued > 0) {
    return {
      actor: {
        type: "swarm_owner",
        id: overview.swarm.owner,
        claimedBy: null
      },
      action: "queue_swarm_lanes",
      commands: [`node ./src/index.js swarm:queue --id ${overview.swarm.id}`]
    };
  }

  return {
    actor: null,
    action: "complete",
    commands: []
  };
}

export function buildSwarmHandoff(overview, recommended, orchestration = null) {
  if (recommended.action === "complete") {
    return `Swarm ${overview.swarm.id} is complete; all ${overview.counts.totalLanes} lanes are done.`;
  }
  if (recommended.action.startsWith("dispatch_lane:")) {
    if ((orchestration?.nextWave?.wave ?? null) && (orchestration?.nextWave?.readyCount ?? 0) > 1) {
      return `Swarm ${overview.swarm.id} has wave ${orchestration.nextWave.wave}/${orchestration.waveCount} ready; ${orchestration.nextWave.readyCount} lanes can start in parallel.`;
    }
    if (orchestration?.nextWave?.wave) {
      return `Swarm ${overview.swarm.id} has wave ${orchestration.nextWave.wave}/${orchestration.waveCount} ready; dispatch the next owner-scoped task.`;
    }
    return `Swarm ${overview.swarm.id} has a runnable lane; dispatch the next owner-scoped task.`;
  }
  if (recommended.action.startsWith("review_lane:")) {
    return `Swarm ${overview.swarm.id} is waiting on verifier review before the lane can close.`;
  }
  if (recommended.action.startsWith("continue_lane:")) {
    return `Swarm ${overview.swarm.id} already has an active worker; continue execution inside the claimed lane scope.`;
  }
  if (recommended.action.startsWith("unblock_lane:")) {
    return `Swarm ${overview.swarm.id} is blocked in at least one lane and needs unblock ownership.`;
  }
  if (recommended.action.startsWith("wait_on_dependencies:")) {
    return `Swarm ${overview.swarm.id} has queued lanes waiting on dependency completion before dispatch.`;
  }
  if (recommended.action === "queue_swarm_lanes") {
    if (orchestration?.waveCount > 0) {
      return `Swarm ${overview.swarm.id} has ${orchestration.waveCount} planned wave${orchestration.waveCount === 1 ? "" : "s"} but no queued tasks yet.`;
    }
    return `Swarm ${overview.swarm.id} has planned lanes but no queued tasks yet.`;
  }
  return `Swarm ${overview.swarm.id} is active with bounded local coordination state.`;
}

export function deriveSwarmCloseoutCommand(overview, brief) {
  if (["completed", "cancelled"].includes(overview?.swarm?.status)) {
    return `node ./src/index.js swarm:archive --id ${overview.swarm.id}`;
  }
  if (overview.readyToComplete) {
    return `node ./src/index.js swarm:done --id ${overview.swarm.id}`;
  }

  return brief?.recommendedCommands?.[0] ?? null;
}
