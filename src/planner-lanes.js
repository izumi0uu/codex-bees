import { buildDependencyWaves, deriveExecutionShapeFromWaves, laneDependsOnList } from "./orchestration-waves.js";
import {
  chooseDiscoveryScope,
  chooseDocumentationScope,
  choosePrimaryScope,
  chooseVerificationScope,
  inferPlannerIntent,
  touchesPublicRuntime
} from "./planner-scope.js";

export function derivePlannerTaskClass(intent) {
  if (intent.docsOnly) {
    return "docs-only";
  }
  if (intent.docs) {
    return "docs-runtime";
  }
  if (intent.coordination) {
    return "coordination-kernel";
  }
  if (intent.catalog) {
    return "catalog-contract";
  }
  if (intent.runtime) {
    return "runtime-surface";
  }
  if (intent.build) {
    return "build-verification";
  }
  return "general";
}

export function derivePlannerStrategy(task, implementationScope, intent = inferPlannerIntent(task, implementationScope), plannerProfile = null) {
  const publicSurface = intent.publicRuntime || intent.catalog || touchesPublicRuntime(implementationScope);
  const needsDiscovery = !intent.docsOnly && (
    intent.coordination ||
    (intent.catalog && implementationScope.length > 1) ||
    (intent.build && implementationScope.length > 2) ||
    implementationScope.length > 3
  );
  const needsVerification = !intent.docsOnly && intent.verificationHeavy;
  const coordinationDocumentationSidecar =
    plannerProfile?.planningHints?.documentationMode === "discovery-sidecar" && intent.coordination;
  const needsDocumentation = !intent.docsOnly && (
    intent.docs ||
    intent.publicRuntime ||
    intent.catalog ||
    coordinationDocumentationSidecar
  );

  let laneStrategy = "implement-verify";
  if (intent.docsOnly) {
    laneStrategy = "documentation";
  } else if (needsDiscovery && needsDocumentation) {
    laneStrategy = "discover-implement-verify-docs";
  } else if (needsDiscovery) {
    laneStrategy = "discover-implement-verify";
  } else if (needsDocumentation) {
    laneStrategy = "implement-verify-docs";
  }

  return {
    taskClass: derivePlannerTaskClass(intent),
    laneStrategy,
    publicSurface,
    needsDiscovery,
    needsVerification,
    needsDocumentation
  };
}

function buildDiscoveryLane(task, discoveryScope) {
  return {
    purpose: "discovery",
    owner: "explore",
    verifier: "reviewer",
    summary: `Map scope and verification for: ${task}`,
    scope: discoveryScope,
    acceptance: [
      "scope paths exist in the repository",
      "the plan maps the task brief to concrete files",
      "follow-up implementation can claim files without overlap"
    ],
    verification: ["inspect scope paths", "confirm role files exist"]
  };
}

function buildExecutionLane(task, implementationScope) {
  return {
    purpose: "implementation",
    owner: "executor",
    verifier: "tester",
    summary: `Implement the bounded repo change for: ${task}`,
    scope: implementationScope,
    acceptance: [
      "the targeted files can be updated without crossing unrelated surfaces",
      "the change remains bounded to the selected scope",
      "the resulting behavior is verifiable from CLI, MCP, or file output"
    ],
    verification: ["targeted command check", "smoke check when applicable"]
  };
}

function buildVerificationLane(task, verificationScope, dependsOn = []) {
  return {
    purpose: "verification",
    owner: "tester",
    verifier: "reviewer",
    summary: `Verify the bounded contract for: ${task}`,
    scope: verificationScope,
    ...(dependsOn.length > 0 ? { dependsOn } : {}),
    acceptance: [
      "the planned scope has fresh verification evidence",
      "the bounded change is exercised from shipped command or script surfaces",
      "follow-up reviewers can inspect one verification-focused lane without reopening implementation ownership"
    ],
    verification: ["run targeted command checks", "run build or smoke verification when applicable"]
  };
}

function buildDocumentationLane(task, documentationScope, dependsOn = []) {
  return {
    purpose: "documentation",
    owner: "reviewer",
    verifier: "tester",
    summary: `Document the operator-facing contract for: ${task}`,
    scope: documentationScope,
    ...(dependsOn.length > 0 ? { dependsOn } : {}),
    acceptance: [
      "public-facing docs or examples match the bounded change",
      "the documented scope stays limited to shipped product surfaces",
      "operators can discover the change without tracker-only residue"
    ],
    verification: ["inspect README or shipped examples", "run documentation-linked example when applicable"]
  };
}

function assignLaneIds(lanes) {
  return lanes.map((lane, index) => ({
    ...lane,
    lane: `lane-${index + 1}`
  }));
}

function buildPlannerWaveLaneView(lane) {
  return {
    lane: lane.lane,
    purpose: lane.purpose,
    owner: lane.owner,
    verifier: lane.verifier,
    dependsOn: laneDependsOnList(lane)
  };
}

export function buildPlannerOrchestration(lanes) {
  const waves = buildDependencyWaves(lanes, buildPlannerWaveLaneView);
  const peakParallelLanes = Math.max(...waves.map((wave) => wave.laneCount), 0);
  const peakParallelOwners = Math.max(...waves.map((wave) => wave.ownerCount), 0);

  return {
    executionShape: deriveExecutionShapeFromWaves(null, lanes, waves),
    waveCount: waves.length,
    peakParallelLanes,
    peakParallelOwners,
    maxWorkers: lanes.length > 0 ? Math.max(1, peakParallelOwners) : 0,
    waves
  };
}

function usesCoordinationDocumentationSidecar(plannerProfile, strategy) {
  return (
    plannerProfile?.planningHints?.documentationMode === "discovery-sidecar" &&
    strategy.taskClass === "coordination-kernel" &&
    strategy.needsDiscovery &&
    strategy.needsDocumentation
  );
}

function buildPlannerDependencies(lanes, plannerProfile, strategy) {
  const discoveryLaneId = lanes.find((lane) => lane.purpose === "discovery")?.lane ?? null;
  const implementationLaneId = lanes.find((lane) => lane.purpose === "implementation")?.lane ?? null;
  const documentationLaneId = lanes.find((lane) => lane.purpose === "documentation")?.lane ?? null;
  const coordinationDocumentationSidecar = usesCoordinationDocumentationSidecar(plannerProfile, strategy);

  return lanes.map((lane) => {
    if (lane.purpose === "implementation" && discoveryLaneId) {
      return {
        ...lane,
        dependsOn: [discoveryLaneId]
      };
    }

    if (lane.purpose === "documentation") {
      if (coordinationDocumentationSidecar && discoveryLaneId) {
        return {
          ...lane,
          dependsOn: [discoveryLaneId]
        };
      }

      if (implementationLaneId) {
        return {
          ...lane,
          dependsOn: [implementationLaneId]
        };
      }
    }

    if (lane.purpose === "verification") {
      const dependsOn = [];
      if (implementationLaneId) {
        dependsOn.push(implementationLaneId);
      }
      if (coordinationDocumentationSidecar && documentationLaneId) {
        dependsOn.push(documentationLaneId);
      }
      if (dependsOn.length > 0) {
        return {
          ...lane,
          dependsOn
        };
      }
    }

    return lane;
  });
}

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
