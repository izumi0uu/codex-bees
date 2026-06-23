import { exit, requireOption, write, writeErr } from "./state-cli-helpers.js";
import { planSwarm } from "./planner.js";
import { initSwarm, queueSwarmTasks } from "./state-runtime.js";
import { readPlannerOptions } from "./state-cli-plan-options.js";

export function handlePlanSwarmQueue() {
  const task = requireOption("--task");
  const planned = planSwarm(task, readPlannerOptions());
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
        requestedProfile: planned.requestedProfile,
        planner: planned.planner,
        plannerSelection: planned.plannerSelection,
        evidence: planned.evidence,
        orchestration: planned.orchestration,
        swarm: queued.swarm,
        created: queued.created
      },
      null,
      2
    ) + "\n"
  );
}
