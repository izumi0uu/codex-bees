import { buildDependencyWaves, deriveExecutionShapeFromWaves, laneDependsOnList } from "./waves.js";

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
