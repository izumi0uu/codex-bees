export function laneDependsOnList(lane) {
  return Array.isArray(lane?.dependsOn) ? lane.dependsOn.filter(Boolean) : [];
}

function defaultWaveLaneView(lane) {
  return {
    lane: lane.lane,
    purpose: lane.purpose ?? null,
    owner: lane.owner ?? null,
    verifier: lane.verifier ?? null,
    dependsOn: laneDependsOnList(lane)
  };
}

export function buildDependencyWaves(lanes = [], buildWaveLaneView = defaultWaveLaneView) {
  const waveLanes = lanes.filter((lane) => lane?.lane);
  const pending = new Map(waveLanes.map((lane) => [lane.lane, new Set(laneDependsOnList(lane))]));
  const remaining = new Set(waveLanes.map((lane) => lane.lane));
  const waves = [];

  while (remaining.size > 0) {
    const ready = waveLanes.filter(
      (lane) => remaining.has(lane.lane) && (pending.get(lane.lane)?.size ?? 0) === 0
    );
    if (ready.length === 0) {
      const unresolved = waveLanes.filter((lane) => remaining.has(lane.lane));
      waves.push({
        wave: waves.length + 1,
        parallelizable: unresolved.length > 1,
        blocked: true,
        laneCount: unresolved.length,
        ownerCount: new Set(unresolved.map((lane) => lane.owner).filter(Boolean)).size,
        purposes: Array.from(new Set(unresolved.map((lane) => lane.purpose).filter(Boolean))),
        owners: Array.from(new Set(unresolved.map((lane) => lane.owner).filter(Boolean))),
        lanes: unresolved.map(buildWaveLaneView)
      });
      break;
    }

    const readyIds = new Set(ready.map((lane) => lane.lane));
    for (const laneId of readyIds) {
      remaining.delete(laneId);
    }
    for (const [laneId, dependencySet] of pending.entries()) {
      if (!remaining.has(laneId)) {
        continue;
      }
      for (const resolvedId of readyIds) {
        dependencySet.delete(resolvedId);
      }
    }

    waves.push({
      wave: waves.length + 1,
      parallelizable: ready.length > 1,
      blocked: false,
      laneCount: ready.length,
      ownerCount: new Set(ready.map((lane) => lane.owner).filter(Boolean)).size,
      purposes: Array.from(new Set(ready.map((lane) => lane.purpose).filter(Boolean))),
      owners: Array.from(new Set(ready.map((lane) => lane.owner).filter(Boolean))),
      lanes: ready.map(buildWaveLaneView)
    });
  }

  return waves;
}

export function deriveExecutionShapeFromWaves(executionShape, lanes, waves) {
  if (executionShape) {
    return executionShape;
  }
  if (lanes.length <= 1) {
    return "solo-lane";
  }
  const peakParallelLanes = Math.max(...waves.map((wave) => wave.laneCount ?? 0), 0);
  if (peakParallelLanes <= 1) {
    return "serial-handoff";
  }
  return "parallel-handoff";
}
