import { VALID_LANE_PURPOSES } from "./state-rules-statuses.js";

function collectSwarmCycleLanes(swarm) {
  const laneIds = new Set((swarm.lanes ?? []).map((lane) => lane.lane).filter(Boolean));
  const dependencyAdjacency = new Map(
    (swarm.lanes ?? []).map((lane) => [
      lane.lane,
      (lane.dependsOn ?? []).filter((ref) => ref && ref !== lane.lane && laneIds.has(ref))
    ])
  );
  const cycleLanes = new Set();
  const visited = new Set();
  const active = new Set();

  function visitLaneDependencies(laneId) {
    if (!laneId || visited.has(laneId)) {
      return;
    }
    visited.add(laneId);
    active.add(laneId);
    for (const dependency of dependencyAdjacency.get(laneId) ?? []) {
      if (active.has(dependency)) {
        cycleLanes.add(laneId);
        cycleLanes.add(dependency);
        continue;
      }
      visitLaneDependencies(dependency);
      if (cycleLanes.has(dependency)) {
        cycleLanes.add(laneId);
      }
    }
    active.delete(laneId);
  }

  for (const laneId of laneIds) {
    visitLaneDependencies(laneId);
  }

  return { cycleLanes, laneIds };
}

function collectSwarmOverlapIssues(swarm) {
  const overlapIssues = [];
  const seen = new Map();
  for (const lane of swarm.lanes) {
    for (const path of lane.scope ?? []) {
      const owners = seen.get(path) ?? [];
      for (const otherLane of owners) {
        overlapIssues.push({
          code: "scope_overlap",
          message: `Lanes ${otherLane} and ${lane.lane} overlap on ${path}`,
          lanes: [otherLane, lane.lane],
          path
        });
      }
      owners.push(lane.lane);
      seen.set(path, owners);
    }
  }
  return overlapIssues;
}

export function validateSwarmValue(swarm, roleCatalog) {
  const issues = [];
  const laneReports = [];
  const { cycleLanes, laneIds } = collectSwarmCycleLanes(swarm);

  if (!swarm.objective?.trim()) {
    issues.push({ code: "missing_objective", message: "Swarm objective is required" });
  }
  if (!Array.isArray(swarm.lanes) || swarm.lanes.length === 0) {
    issues.push({ code: "missing_lanes", message: "Swarm must contain at least one lane" });
  }

  for (const lane of swarm.lanes) {
    const laneIssues = [];
    if (!lane.owner?.trim()) {
      laneIssues.push({ code: "missing_owner", message: "Lane owner is required" });
    } else if (!roleCatalog.agents.includes(lane.owner)) {
      laneIssues.push({
        code: "unknown_owner",
        message: `Lane owner ${lane.owner} is not a shipped agent role`,
        allowed: roleCatalog.agents
      });
    }
    if (!lane.verifier?.trim()) {
      laneIssues.push({ code: "missing_verifier", message: "Lane verifier is required" });
    } else if (!roleCatalog.agents.includes(lane.verifier)) {
      laneIssues.push({
        code: "unknown_verifier",
        message: `Lane verifier ${lane.verifier} is not a shipped agent role`,
        allowed: roleCatalog.agents
      });
    }
    if (!Array.isArray(lane.scope) || lane.scope.length === 0) {
      laneIssues.push({ code: "missing_scope", message: "Lane scope is required" });
    }
    if (!Array.isArray(lane.acceptance) || lane.acceptance.length === 0) {
      laneIssues.push({ code: "missing_acceptance", message: "Lane acceptance checks are required" });
    }
    if (!Array.isArray(lane.verification) || lane.verification.length === 0) {
      laneIssues.push({ code: "missing_verification", message: "Lane verification steps are required" });
    }
    if (lane.purpose && !VALID_LANE_PURPOSES.has(lane.purpose)) {
      laneIssues.push({
        code: "invalid_lane_purpose",
        message: `Lane ${lane.lane} has unknown purpose ${lane.purpose}`,
        allowed: [...VALID_LANE_PURPOSES]
      });
    }
    const dependencyRefs = Array.isArray(lane.dependsOn) ? lane.dependsOn : [];
    for (const ref of dependencyRefs) {
      if (ref === lane.lane) {
        laneIssues.push({
          code: "self_dependency",
          message: `Lane ${lane.lane} cannot depend on itself`
        });
        continue;
      }
      if (!laneIds.has(ref)) {
        laneIssues.push({
          code: "unknown_dependency",
          message: `Lane ${lane.lane} depends on unknown lane ${ref}`
        });
      }
    }
    if (cycleLanes.has(lane.lane)) {
      laneIssues.push({
        code: "dependency_cycle",
        message: `Lane ${lane.lane} participates in a dependency cycle`
      });
    }

    laneReports.push({
      lane: lane.lane,
      ready: laneIssues.length === 0,
      issues: laneIssues
    });
  }

  const overlapIssues = collectSwarmOverlapIssues(swarm);

  return {
    swarm,
    ready: issues.length === 0 && laneReports.every((lane) => lane.ready) && overlapIssues.length === 0,
    issues,
    lanes: laneReports,
    overlaps: overlapIssues,
    catalog: roleCatalog
  };
}
