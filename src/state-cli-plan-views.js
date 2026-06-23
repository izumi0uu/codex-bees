import { requireOption } from "./state-cli-helpers.js";
import { getPlannerProfileView, getPlannerProfilesView, planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import { addTasks } from "./state-runtime.js";
import { readPlannerOptions } from "./state-cli-plan-options.js";
import { writeNamedView, writeView } from "./state-cli-view-writers.js";

export function handlePlanProfiles() {
  writeNamedView("profiles", getPlannerProfilesView(readPlannerOptions()));
}

export function handlePlanProfile() {
  const profile = requireOption("--profile");
  writeNamedView("profile", getPlannerProfileView(profile, readPlannerOptions()));
}

export function handlePlan() {
  const task = requireOption("--task");
  writeView(planTask(task, readPlannerOptions()));
}

export function handlePlanQueue() {
  const task = requireOption("--task");
  writeView(queueTasksFromPlan(task, addTasks, readPlannerOptions()));
}

export function handlePlanSwarm() {
  const task = requireOption("--task");
  writeView(planSwarm(task, readPlannerOptions()));
}
