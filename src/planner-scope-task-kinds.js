export function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function isPublicStateBridgeTask(lower) {
  return (
    lower.includes("state bridge") ||
    lower.includes("public state") ||
    (lower.includes("state") && lower.includes("public") && lower.includes("bridge")) ||
    (lower.includes("state") && lower.includes("public") && lower.includes("facade")) ||
    (lower.includes("state") && lower.includes("export"))
  );
}

export function isInternalStateRuntimeTask(lower) {
  return (
    lower.includes("state runtime") ||
    lower.includes("runtime state") ||
    lower.includes("runtime facade") ||
    (lower.includes("internal") && lower.includes("state") && lower.includes("facade")) ||
    (lower.includes("internal") && lower.includes("runtime") && lower.includes("state"))
  );
}
