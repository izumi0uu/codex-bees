import { requireOption, write } from "./state-cli-helpers.js";
import { getPlannerProfileView, getPlannerProfilesView, planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import { addTasks } from "./state-runtime.js";
import { readPlannerOptions } from "./state-cli-plan-options.js";

export function handlePlanProfiles() {
  write(JSON.stringify({ profiles: getPlannerProfilesView(readPlannerOptions()) }, null, 2) + "\n");
}

export function handlePlanProfile() {
  const profile = requireOption("--profile");
  write(JSON.stringify({ profile: getPlannerProfileView(profile, readPlannerOptions()) }, null, 2) + "\n");
}

export function handlePlan() {
  const task = requireOption("--task");
  write(JSON.stringify(planTask(task, readPlannerOptions()), null, 2) + "\n");
}

export function handlePlanQueue() {
  const task = requireOption("--task");
  write(JSON.stringify(queueTasksFromPlan(task, addTasks, readPlannerOptions()), null, 2) + "\n");
}

export function handlePlanSwarm() {
  const task = requireOption("--task");
  write(JSON.stringify(planSwarm(task, readPlannerOptions()), null, 2) + "\n");
}
