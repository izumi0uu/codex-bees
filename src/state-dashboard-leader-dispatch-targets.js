import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

function normalizeWorkerPoolEntry(value) {
  const values = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(
      values
        .filter((entry) => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  );
}

function resolveWorkerPoolForRole(ownerId, input) {
  const explicitPool = normalizeWorkerPoolEntry(input.workerIds?.[ownerId]);
  if (explicitPool.length > 0) {
    return explicitPool;
  }

  if (input.workerId) {
    return [input.workerId];
  }

  return [`<${ownerId}-worker>`];
}

export function buildStartupWindowKey(assignment, fallbackKey) {
  return assignment?.swarmId && assignment?.wave != null
    ? `${assignment.swarmId}:wave-${assignment.wave}`
    : fallbackKey;
}

function resolveStartupWindowLimit(assignment) {
  const maxWorkers = Number(assignment?.swarmMaxWorkers);
  return Number.isInteger(maxWorkers) && maxWorkers > 0
    ? maxWorkers
    : Number.POSITIVE_INFINITY;
}

function buildDispatchCommands(ownerId, workerId, assignment) {
  const previewCommand = `node ./src/index.js task:assignment-preview --role ${ownerId} --worker ${workerId} --task ${assignment.taskId}`;
  const pickupCommand = `node ./src/index.js task:assignment-pickup --role ${ownerId} --worker ${workerId} --task ${assignment.taskId}`;

  return {
    previewCommand,
    pickupCommand,
    command: pickupCommand
  };
}

function buildWorkerTarget({
  owner,
  ownerId,
  assignment,
  workerId,
  workerIndex,
  workerPoolSize,
  startupWindowKey
}) {
  const commands = buildDispatchCommands(ownerId, workerId, assignment);

  return {
    owner,
    ownerId,
    workerId,
    workerIndex,
    workerPoolSize,
    taskId: assignment.taskId ?? null,
    swarmId: assignment.swarmId ?? null,
    objective: assignment.objective ?? null,
    lane: assignment.lane ?? null,
    purpose: assignment.purpose ?? null,
    purposeGuidance: assignment.purposeGuidance ?? buildPurposeGuidanceForTaskLike(assignment),
    wave: assignment.wave ?? null,
    waveStatus: assignment.waveStatus ?? null,
    waveParallelizable: assignment.waveParallelizable ?? null,
    swarmExecutionShape: assignment.swarmExecutionShape ?? null,
    swarmWaveCount: assignment.swarmWaveCount ?? null,
    swarmMaxWorkers: assignment.swarmMaxWorkers ?? null,
    startupWindowKey,
    assignment,
    ...commands,
    summary: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId}${assignment.wave ? ` wave ${assignment.wave}` : ""} to ${ownerId} via ${workerId}.`
  };
}

export function buildDispatchTargetsForGroups(input, groups = []) {
  const resolvedGroups = groups.map((group, groupIndex) => {
    const ownerId = group.owner?.id ?? group.owner?.name ?? "unknown";
    return {
      owner: group.owner,
      ownerId,
      count: group.count,
      assignments: group.assignments ?? [],
      workerPool: resolveWorkerPoolForRole(ownerId, input),
      targets: []
    };
  });

  const globalWindowUsage = new Map();
  const nextWorkerIndexByOwner = new Map();
  const nextAssignmentIndexByOwner = new Map();
  const orderedTargets = [];

  let progress = true;
  while (progress) {
    progress = false;

    for (const [groupIndex, group] of resolvedGroups.entries()) {
      const nextAssignmentIndex = nextAssignmentIndexByOwner.get(group.ownerId) ?? 0;
      const nextWorkerIndex = nextWorkerIndexByOwner.get(group.ownerId) ?? 0;
      const assignment = group.assignments[nextAssignmentIndex];

      if (!assignment || nextWorkerIndex >= group.workerPool.length) {
        continue;
      }

      const startupWindowKey = buildStartupWindowKey(
        assignment,
        `${group.ownerId}:assignment-${groupIndex + 1}-${nextAssignmentIndex + 1}`
      );
      const startupWindowLimit = resolveStartupWindowLimit(assignment);
      const usedWindowSlots = globalWindowUsage.get(startupWindowKey) ?? 0;
      if (usedWindowSlots >= startupWindowLimit) {
        continue;
      }

      const workerId = group.workerPool[nextWorkerIndex];
      group.targets.push(
        buildWorkerTarget({
          owner: group.owner,
          ownerId: group.ownerId,
          assignment,
          workerId,
          workerIndex: nextWorkerIndex + 1,
          workerPoolSize: group.workerPool.length,
          startupWindowKey
        })
      );
      orderedTargets.push(group.targets[group.targets.length - 1]);
      nextWorkerIndexByOwner.set(group.ownerId, nextWorkerIndex + 1);
      nextAssignmentIndexByOwner.set(group.ownerId, nextAssignmentIndex + 1);
      globalWindowUsage.set(startupWindowKey, usedWindowSlots + 1);
      progress = true;
    }
  }

  return {
    groups: resolvedGroups,
    targets: orderedTargets
  };
}
