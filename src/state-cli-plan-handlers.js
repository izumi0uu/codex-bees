import { argv, exit, readJsonOption, readListOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import {
  activateSwarm,
  addTasks,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  getMemoryView,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
  listMemoriesView,
  listSwarmsView,
  queueSwarmTasks,
  searchMemoriesView,
  storeMemoryMutation,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  syncSwarmStatus,
  updateSwarmMutation,
  validateSwarm
} from "./state.js";

function handlePlan() {
  const task = requireOption("--task");
  write(JSON.stringify(planTask(task), null, 2) + "\n");
}

function handlePlanQueue() {
  const task = requireOption("--task");
  write(JSON.stringify(queueTasksFromPlan(task, addTasks), null, 2) + "\n");
}

function handlePlanSwarm() {
  const task = requireOption("--task");
  write(JSON.stringify(planSwarm(task), null, 2) + "\n");
}

function handlePlanSwarmQueue() {
  const task = requireOption("--task");
  const planned = planSwarm(task);
  const created = initSwarm(planned.swarm);
  const queued = queueSwarmTasks({ id: created.id });
  if (!queued) {
    writeErr(`Unable to queue planned swarm: ${created.id}\n`);
    exit(1);
  }
  if (queued.error) {
    writeErr(`${queued.error}\n`);
    exit(1);
  }
  write(
    JSON.stringify(
      {
        kind: "queued_plan_swarm",
        recommendedReason: queued.created.length > 1 ? "multiple_swarm_lane_tasks_queued" : "single_swarm_lane_task_queued",
        objective: task,
        evidence: planned.evidence,
        swarm: queued.swarm,
        created: queued.created
      },
      null,
      2
    ) + "\n"
  );
}

export {
  handlePlan,
  handlePlanQueue,
  handlePlanSwarm,
  handlePlanSwarmQueue
};
