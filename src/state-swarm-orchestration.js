function laneDependsOnList(lane) {
  return Array.isArray(lane?.dependsOn) ? lane.dependsOn.filter(Boolean) : [];
}

function buildFallbackWaveLaneView(lane) {
  return {
    lane: lane.lane,
    purpose: lane.purpose ?? null,
    owner: lane.owner ?? null,
    verifier: lane.verifier ?? null,
    dependsOn: laneDependsOnList(lane)
  };
}

function buildFallbackWaves(lanes = []) {
  const pending = new Map(
    lanes.filter((lane) => lane?.lane).map((lane) => [lane.lane, new Set(laneDependsOnList(lane))])
  );
  const remaining = new Set(lanes.filter((lane) => lane?.lane).map((lane) => lane.lane));
  const waves = [];

  while (remaining.size > 0) {
    const ready = lanes.filter((lane) => remaining.has(lane.lane) && (pending.get(lane.lane)?.size ?? 0) === 0);
    if (ready.length === 0) {
      const unresolved = lanes.filter((lane) => remaining.has(lane.lane));
      waves.push({
        wave: waves.length + 1,
        parallelizable: unresolved.length > 1,
        blocked: true,
        laneCount: unresolved.length,
        ownerCount: new Set(unresolved.map((lane) => lane.owner).filter(Boolean)).size,
        purposes: Array.from(new Set(unresolved.map((lane) => lane.purpose).filter(Boolean))),
        owners: Array.from(new Set(unresolved.map((lane) => lane.owner).filter(Boolean))),
        lanes: unresolved.map(buildFallbackWaveLaneView)
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
      lanes: ready.map(buildFallbackWaveLaneView)
    });
  }

  return waves;
}

function deriveExecutionShape(executionShape, lanes, waves) {
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

function buildWaveLaneState(waveLane, laneSummary) {
  return {
    lane: waveLane.lane,
    purpose: waveLane.purpose ?? laneSummary?.purpose ?? null,
    owner: waveLane.owner ?? laneSummary?.owner ?? null,
    verifier: waveLane.verifier ?? laneSummary?.verifier ?? null,
    taskId: laneSummary?.taskId ?? null,
    queueStatus: laneSummary?.queueStatus ?? null,
    claimedBy: laneSummary?.claimedBy ?? null,
    status: laneSummary?.status ?? null,
    dependsOn: laneSummary?.dependsOn ?? waveLane.dependsOn ?? [],
    dependencyReady: laneSummary?.dependencyReady ?? (laneDependsOnList(waveLane).length === 0),
    ready: laneSummary?.ready ?? false,
    done: laneSummary?.done ?? false
  };
}

function deriveWaveStatus({ laneCount, doneCount, blockedCount, activeCount, readyCount }) {
  if (laneCount > 0 && doneCount === laneCount) {
    return "complete";
  }
  if (blockedCount > 0) {
    return "blocked";
  }
  if (activeCount > 0) {
    return "active";
  }
  if (readyCount > 0) {
    return "dispatchable";
  }
  return "waiting";
}

export function buildSwarmOrchestrationView(swarm, laneSummaries = []) {
  const lanes = Array.isArray(swarm?.lanes) ? swarm.lanes.filter((lane) => lane?.lane) : [];
  const rawWaves =
    Array.isArray(swarm?.waves) && swarm.waves.length > 0
      ? swarm.waves
      : buildFallbackWaves(lanes);

  const waves = rawWaves.map((wave, index) => {
    const waveLanes = Array.isArray(wave?.lanes) ? wave.lanes : [];
    const laneStates = waveLanes.map((waveLane) =>
      buildWaveLaneState(waveLane, laneSummaries.find((lane) => lane.lane === waveLane.lane) ?? null)
    );
    const laneCount = laneStates.length;
    const doneCount = laneStates.filter((lane) => lane.done).length;
    const readyCount = laneStates.filter((lane) => lane.ready).length;
    const claimedCount = laneStates.filter((lane) => lane.queueStatus === "claimed").length;
    const reviewCount = laneStates.filter((lane) => lane.queueStatus === "ready_for_review").length;
    const blockedCount = laneStates.filter((lane) => lane.queueStatus === "blocked").length;
    const activeCount = claimedCount + reviewCount;
    const ownerCount =
      Number.isInteger(Number(wave?.ownerCount)) && Number(wave.ownerCount) >= 0
        ? Number(wave.ownerCount)
        : new Set(laneStates.map((lane) => lane.owner).filter(Boolean)).size;

    return {
      wave: Number.isInteger(Number(wave?.wave)) && Number(wave.wave) > 0 ? Number(wave.wave) : index + 1,
      parallelizable: wave?.parallelizable === true || laneCount > 1,
      blocked: wave?.blocked === true || blockedCount > 0,
      laneCount,
      ownerCount,
      purposes:
        Array.isArray(wave?.purposes) && wave.purposes.length > 0
          ? wave.purposes
          : Array.from(new Set(laneStates.map((lane) => lane.purpose).filter(Boolean))),
      owners:
        Array.isArray(wave?.owners) && wave.owners.length > 0
          ? wave.owners
          : Array.from(new Set(laneStates.map((lane) => lane.owner).filter(Boolean))),
      doneCount,
      readyCount,
      claimedCount,
      reviewCount,
      blockedCount,
      status: deriveWaveStatus({ laneCount, doneCount, blockedCount, activeCount, readyCount }),
      lanes: laneStates
    };
  });

  const peakParallelLanes = Math.max(...waves.map((wave) => wave.laneCount), 0);
  const peakParallelOwners = Math.max(...waves.map((wave) => wave.ownerCount), 0);
  const nextWave = waves.find((wave) => wave.status !== "complete") ?? null;
  const activeWave = waves.find((wave) => wave.status === "active") ?? nextWave;

  return {
    executionShape: deriveExecutionShape(swarm?.executionShape ?? null, lanes, waves),
    waveCount:
      Number.isInteger(Number(swarm?.waveCount)) && Number(swarm.waveCount) >= 0
        ? Number(swarm.waveCount)
        : waves.length,
    maxWorkers:
      Number.isInteger(Number(swarm?.maxWorkers)) && Number(swarm.maxWorkers) > 0
        ? Number(swarm.maxWorkers)
        : Math.max(peakParallelOwners, peakParallelLanes > 0 ? 1 : 0),
    peakParallelLanes,
    peakParallelOwners,
    activeWave:
      activeWave
        ? {
            wave: activeWave.wave,
            status: activeWave.status,
            parallelizable: activeWave.parallelizable,
            laneCount: activeWave.laneCount,
            ownerCount: activeWave.ownerCount,
            readyCount: activeWave.readyCount
          }
        : null,
    nextWave:
      nextWave
        ? {
            wave: nextWave.wave,
            status: nextWave.status,
            parallelizable: nextWave.parallelizable,
            laneCount: nextWave.laneCount,
            ownerCount: nextWave.ownerCount,
            readyCount: nextWave.readyCount
          }
        : null,
    waves
  };
}

export function findLaneOrchestrationContext(orchestration, laneId) {
  if (!orchestration?.waves || !laneId) {
    return null;
  }

  for (const wave of orchestration.waves) {
    const laneIndex = (wave.lanes ?? []).findIndex((lane) => lane.lane === laneId);
    if (laneIndex >= 0) {
      return {
        wave: wave.wave,
        wavePosition: laneIndex + 1,
        waveStatus: wave.status,
        waveParallelizable: wave.parallelizable,
        waveLaneCount: wave.laneCount,
        waveOwnerCount: wave.ownerCount
      };
    }
  }

  return null;
}
