import {
  chooseDiscoveryScope,
  chooseDocumentationScope,
  choosePrimaryScope,
  chooseVerificationScope,
  inferPlannerIntent
} from "../scope/index.js";
import {
  assignLaneIds,
  buildDiscoveryLane,
  buildDocumentationLane,
  buildExecutionLane,
  buildVerificationLane
} from "./builders.js";
import { buildPlannerDependencies } from "./dependencies.js";
import { derivePlannerStrategy } from "./strategy.js";

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
