import { argv, exit, readJsonOption, readListOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
import { getPlannerProfileView, getPlannerProfilesView, planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
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
} from "./state-runtime.js";

function readPlannerProfileOption() {
  return readOption("--profile");
}

function readPlannerProfileFileOption() {
  return readOption("--profile-file");
}

function readPlannerOptions() {
  return {
    profileId: readPlannerProfileOption(),
    profileFile: readPlannerProfileFileOption()
  };
}

function handlePlanProfiles() {
  write(JSON.stringify({ profiles: getPlannerProfilesView(readPlannerOptions()) }, null, 2) + "\n");
}

function handlePlanProfile() {
  const profile = requireOption("--profile");
  write(JSON.stringify({ profile: getPlannerProfileView(profile, readPlannerOptions()) }, null, 2) + "\n");
}

function handlePlan() {
  const task = requireOption("--task");
  write(JSON.stringify(planTask(task, readPlannerOptions()), null, 2) + "\n");
}

function handlePlanQueue() {
  const task = requireOption("--task");
  write(JSON.stringify(queueTasksFromPlan(task, addTasks, readPlannerOptions()), null, 2) + "\n");
}

function handlePlanSwarm() {
  const task = requireOption("--task");
  write(JSON.stringify(planSwarm(task, readPlannerOptions()), null, 2) + "\n");
}

function handlePlanSwarmQueue() {
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

export {
  handlePlan,
  handlePlanProfile,
  handlePlanProfiles,
  handlePlanQueue,
  handlePlanSwarm,
  handlePlanSwarmQueue
};
