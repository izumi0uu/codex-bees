import {
  chooseDiscoveryScope,
  chooseDocumentationScope,
  choosePrimaryScope,
  chooseVerificationScope,
  inferPlannerIntent
} from "./planner-scope.js";
import {
  assignLaneIds,
  buildDiscoveryLane,
  buildDocumentationLane,
  buildExecutionLane,
  buildVerificationLane
} from "./planner-lane-builders.js";
import { buildPlannerDependencies } from "./planner-lane-dependencies.js";
import { derivePlannerStrategy } from "./planner-lane-strategy.js";

export function buildPlanLanes(task, plannerProfile) {
  const implementationScope = choosePrimaryScope(task);
  const intent = inferPlannerIntent(task, implementationScope);
  const strategy = derivePlannerStrategy(task, implementationScope, intent, plannerProfile);

  if (strategy.laneStrategy === "documentation") {
    return assignLaneIds([
      buildDocumentationLane(task, implementationScope)
    ]);
  }

  const lanes = [];
  if (strategy.needsDiscovery) {
    lanes.push(buildDiscoveryLane(task, chooseDiscoveryScope(implementationScope)));
  }
  lanes.push(buildExecutionLane(task, implementationScope));
  if (strategy.needsVerification) {
    lanes.push(buildVerificationLane(task, chooseVerificationScope(task, implementationScope)));
  }
  if (strategy.needsDocumentation) {
    lanes.push(buildDocumentationLane(task, chooseDocumentationScope(implementationScope)));
  }

  const assignedLanes = assignLaneIds(lanes);
  return buildPlannerDependencies(assignedLanes, plannerProfile, strategy);
}
