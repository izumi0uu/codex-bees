import { summarizeTaskDependencies } from "./core.js";

export function recommendTaskAction(task, dependencyTasks = []) {
  const dependencySummary = task.dependencySummary ?? summarizeTaskDependencies(task, dependencyTasks);
  if (task.queueStatus === "done") {
    if (task.swarmId) {
      return {
        actor: null,
        action: "swarm_closeout",
        commands: [`node ./src/index.js swarm:closeout --id ${task.swarmId}`]
      };
    }
    return {
      actor: null,
      action: "archive",
      commands: [`node ./src/index.js task:archive --id ${task.id}`]
    };
  }

  if (task.queueStatus === "ready_for_review") {
    return {
      actor: {
        type: "verifier_role",
        id: task.verifier,
        claimedBy: null
      },
      action: "review_and_decide",
      commands: [
        `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`,
        `node ./src/index.js task:reject --id ${task.id} --by ${task.verifier ?? "<verifier-role>"} --status claimed --notes "<changes requested>"`
      ]
    };
  }

  if (task.queueStatus === "queued" || task.queueStatus === "released") {
    if (!dependencySummary.ready) {
      return {
        actor: {
          type: "owner_role",
          id: task.owner,
          claimedBy: null
        },
        action: "wait_on_dependencies",
        commands: [`node ./src/index.js task:brief --id ${task.id}`]
      };
    }
    return {
      actor: {
        type: "owner_role",
        id: task.owner,
        claimedBy: null
      },
      action: "claim_and_execute",
      commands: [
        `node ./src/index.js task:claim --id ${task.id} --by <worker-id>`,
        `node ./src/index.js task:review --id ${task.id} --by <worker-id>`
      ]
    };
  }

  if (task.queueStatus === "claimed") {
    return {
      actor: {
        type: "claimed_worker",
        id: task.owner,
        claimedBy: task.claimedBy ?? null
      },
      action: "continue_execution_and_handoff",
      commands: [
        `node ./src/index.js task:review --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`,
        `node ./src/index.js task:block --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"} --notes "<blocker>"`
      ]
    };
  }

  return {
    actor: {
      type: "owner_role",
      id: task.owner,
      claimedBy: task.claimedBy ?? null
    },
    action: "resolve_blocker_and_requeue",
    commands: [
      `node ./src/index.js task:claim --id ${task.id} --by <worker-id>`,
      `node ./src/index.js task:release --id ${task.id} --by ${task.claimedBy ?? "<worker-id>"}`
    ]
  };
}
