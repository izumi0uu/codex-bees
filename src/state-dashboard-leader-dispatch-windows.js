export function buildLaunchWindows(launches) {
  const windows = [];
  const windowsByKey = new Map();

  for (const launch of launches) {
    const key = launch.startupWindowKey ?? `${launch.swarmId ?? "unknown"}:${launch.wave ?? launch.position}`;
    if (!windowsByKey.has(key)) {
      windowsByKey.set(key, {
        key,
        position: windows.length + 1,
        swarmId: launch.swarmId ?? null,
        objective: launch.objective ?? null,
        wave: launch.wave ?? null,
        executionShape: launch.swarmExecutionShape ?? null,
        parallelizable: launch.waveParallelizable ?? false,
        waveStatus: launch.waveStatus ?? null,
        maxWorkers: launch.swarmMaxWorkers ?? null,
        stepCount: 0,
        workers: [],
        launches: []
      });
      windows.push(windowsByKey.get(key));
    }

    const current = windowsByKey.get(key);
    current.stepCount += 1;
    current.workers.push(launch.workerId);
    current.launches.push(launch);
  }

  return windows.map((window) => ({
    ...window,
    summary:
      window.wave != null
        ? `Wave ${window.wave} for ${window.swarmId ?? "unknown-swarm"} has ${window.stepCount} startup step${window.stepCount === 1 ? "" : "s"} ready.`
        : `Launch window ${window.position} has ${window.stepCount} startup step${window.stepCount === 1 ? "" : "s"} ready.`
  }));
}
