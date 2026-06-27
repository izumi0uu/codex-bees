import { getCommandCatalog } from "../command/core.js";

function levenshtein(left = "", right = "") {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  const rows = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let index = 0; index <= a.length; index += 1) {
    rows[index][0] = index;
  }
  for (let index = 0; index <= b.length; index += 1) {
    rows[0][index] = index;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return rows[a.length][b.length];
}

function compactCommand(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function tokenOverlap(left = "", right = "") {
  const leftTokens = new Set(left.toLowerCase().split(/[:\s-]+/).filter(Boolean));
  const rightTokens = new Set(right.toLowerCase().split(/[:\s-]+/).filter(Boolean));
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }
  return overlap;
}

function scoreSuggestion(input, candidate) {
  const trimmedInput = input.trim().toLowerCase();
  const trimmedCandidate = candidate.trim().toLowerCase();
  const compactInput = compactCommand(trimmedInput);
  const compactCandidate = compactCommand(trimmedCandidate);

  if (!trimmedInput || !trimmedCandidate) {
    return Number.NEGATIVE_INFINITY;
  }

  if (trimmedInput === trimmedCandidate) {
    return 10_000;
  }

  let score = 0;
  if (trimmedCandidate.startsWith(trimmedInput)) {
    score += 140;
  }
  if (trimmedCandidate.includes(trimmedInput)) {
    score += 80;
  }
  if (compactCandidate.startsWith(compactInput)) {
    score += 80;
  }
  if (compactCandidate.includes(compactInput)) {
    score += 50;
  }

  score += tokenOverlap(trimmedInput, trimmedCandidate) * 35;

  const distance = levenshtein(compactInput, compactCandidate);
  const maxLength = Math.max(compactInput.length, compactCandidate.length, 1);
  score += Math.max(0, 70 - distance * 12);
  score += Math.max(0, (maxLength - distance) * 4);

  return score;
}

function getCommandCandidates() {
  const byCanonicalCommand = new Map();

  for (const entry of getCommandCatalog()) {
    const current = byCanonicalCommand.get(entry.command) ?? {
      command: entry.command,
      variants: new Set()
    };
    current.variants.add(entry.command);
    for (const alias of entry.aliases ?? []) {
      current.variants.add(alias);
    }
    byCanonicalCommand.set(entry.command, current);
  }

  return [...byCanonicalCommand.values()].map((entry) => ({
    command: entry.command,
    variants: [...entry.variants]
  }));
}

export function getSuggestedCliCommands(input, { limit = 5 } = {}) {
  if (typeof input !== "string" || input.trim().length === 0) {
    return [];
  }

  const ranked = getCommandCandidates()
    .map((entry) => ({
      command: entry.command,
      score: Math.max(...entry.variants.map((variant) => scoreSuggestion(input, variant)))
    }))
    .filter((entry) => Number.isFinite(entry.score) && entry.score >= 45)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.command.localeCompare(right.command);
    });

  return ranked.slice(0, limit).map((entry) => entry.command);
}
