const LANE_PURPOSE_ORDER = new Map([
  ["discovery", 0],
  ["implementation", 1],
  ["verification", 2],
  ["documentation", 3]
]);

export function lanePurposeRank(purpose) {
  return LANE_PURPOSE_ORDER.get(purpose ?? "") ?? 4;
}

export function compareLanePurposes(leftPurpose, rightPurpose) {
  return lanePurposeRank(leftPurpose) - lanePurposeRank(rightPurpose);
}

export function taskPurposeRank(task) {
  return lanePurposeRank(task?.lanePurpose ?? null);
}

export function assignmentPurposeRank(assignment) {
  return lanePurposeRank(assignment?.purpose ?? assignment?.lanePurpose ?? null);
}

export function pickPriorityEntry(entries = [], predicate = () => true) {
  let bestEntry = null;
  let bestRank = Number.POSITIVE_INFINITY;
  let bestIndex = Number.POSITIVE_INFINITY;

  entries.forEach((entry, index) => {
    if (!predicate(entry)) {
      return;
    }

    const rank = lanePurposeRank(entry?.purpose ?? entry?.lanePurpose ?? null);
    if (bestEntry === null || rank < bestRank || (rank === bestRank && index < bestIndex)) {
      bestEntry = entry;
      bestRank = rank;
      bestIndex = index;
    }
  });

  return bestEntry;
}
