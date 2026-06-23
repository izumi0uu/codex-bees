import { exit, requireOption, writeErr } from "./state-cli-helpers.js";
import { queueSwarmFromPlan } from "./planner.js";
import { initSwarm, queueSwarmTasks } from "./state-runtime.js";
import { readPlannerOptions } from "./state-cli-plan-options.js";
import { writeView } from "./state-cli-view-writers.js";

export function handlePlanSwarmQueue() {
  const task = requireOption("--task");
  const queued = queueSwarmFromPlan(task, { initSwarm, queueSwarmTasks }, readPlannerOptions());
  if (!queued) {
    writeErr(`Unable to queue planned swarm for task: ${task}\n`);
    exit(1);
  }
  if (queued.error) {
    writeErr(`${queued.error}\n`);
    exit(1);
  }
  writeView(queued);
}
