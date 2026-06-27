function toFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function roundScore(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(toFiniteNumber(value) * factor) / factor;
}

export function buildWeightedScore(entries = [], { precision = 2 } = {}) {
  const scoreEntries = [];
  const scoreBreakdown = {};
  let totalScore = 0;

  for (const entry of entries) {
    if (!entry || typeof entry.key !== "string" || entry.key.trim().length === 0) {
      continue;
    }

    const active = entry.active ?? true;
    const baseValue = active ? toFiniteNumber(entry.value ?? entry.score ?? 0) : 0;
    const weight = toFiniteNumber(entry.weight, 1);
    const contribution = active ? baseValue * weight : 0;
    const roundedContribution = roundScore(contribution, precision);

    scoreBreakdown[entry.key] = roundedContribution;
    scoreEntries.push({
      key: entry.key,
      label: entry.label ?? entry.key,
      active: Boolean(active),
      value: roundScore(baseValue, precision),
      weight: roundScore(weight, precision),
      contribution: roundedContribution,
      ...(entry.detail !== undefined ? { detail: entry.detail } : {})
    });
    totalScore += contribution;
  }

  const matchedEntries = scoreEntries.filter((entry) => entry.active && entry.contribution > 0);

  return {
    score: roundScore(totalScore, precision),
    scoreBreakdown,
    scoreEntries,
    matchedSignals: matchedEntries.map((entry) => entry.key),
    matchedSignalCount: matchedEntries.length
  };
}
