import { buildDependencyWaves, deriveExecutionShapeFromWaves } from "../../orchestration-waves.js";
import { normalizeSwarmLane } from "../../state-normalize.js";

export function derivePersistedSwarmOrchestration(current = null, input = {}) {
  const rawLanes = input.lanes !== undefined ? input.lanes : current?.lanes ?? [];
  const lanes = Array.isArray(rawLanes)
    ? rawLanes.map((lane, index) => normalizeSwarmLane(lane, index)).filter((lane) => lane?.lane)
    : [];
  const rawWaves =
    input.waves !== undefined
      ? input.waves
      : input.lanes !== undefined
        ? null
        : current?.waves ?? null;
  const waves =
    Array.isArray(rawWaves) && rawWaves.length > 0
      ? rawWaves
      : lanes.length > 0
        ? buildDependencyWaves(lanes)
        : null;
  const rawExecutionShape =
    input.executionShape !== undefined
      ? input.executionShape
      : input.lanes !== undefined
        ? null
        : current?.executionShape ?? null;
  const executionShape =
    lanes.length > 0
      ? deriveExecutionShapeFromWaves(rawExecutionShape, lanes, waves ?? [])
      : rawExecutionShape ?? null;
  const rawWaveCount =
    input.waveCount !== undefined
      ? input.waveCount
      : input.lanes !== undefined
        ? null
        : current?.waveCount ?? null;
  const parsedWaveCount =
    Number.isInteger(Number(rawWaveCount)) && Number(rawWaveCount) > 0
      ? Number(rawWaveCount)
      : null;

  return {
    executionShape: executionShape ?? null,
    waveCount: Array.isArray(waves) && waves.length > 0 ? parsedWaveCount ?? waves.length : parsedWaveCount,
    waves: Array.isArray(waves) && waves.length > 0 ? waves : null
  };
}
