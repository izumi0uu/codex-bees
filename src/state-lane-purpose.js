export const DEFAULT_LANE_PURPOSE = "implementation";

const PURPOSE_META = {
  discovery: {
    label: "discovery",
    summary: "map scope, verify boundaries, and confirm ownership before edits",
    executionHint: "inspect target files, map constraints, and leave implementation-ready handoff context",
    followupHint: "prefer briefs, inspection, and annotation over direct edits until the scope is proven"
  },
  implementation: {
    label: "implementation",
    summary: "land the bounded product change inside the claimed files",
    executionHint: "edit only the planned scope, keep the diff reversible, and prepare handoff evidence",
    followupHint: "run the smallest targeted checks that prove the implementation before review handoff"
  },
  verification: {
    label: "verification",
    summary: "prove the bounded contract with fresh evidence",
    executionHint: "run targeted checks, build or smoke validation when applicable, and record the result",
    followupHint: "treat this lane as evidence gathering and avoid reopening implementation ownership unless acceptance fails"
  },
  documentation: {
    label: "documentation",
    summary: "align shipped docs and operator-facing examples with the bounded change",
    executionHint: "update README, examples, or help text only where the product surface changed",
    followupHint: "confirm docs stay product-facing and match the current runtime behavior"
  }
};

export function normalizeLanePurpose(purpose) {
  if (purpose === "discovery" || purpose === "implementation" || purpose === "verification" || purpose === "documentation") {
    return purpose;
  }
  return null;
}

export function getLanePurposeMeta(purpose) {
  const normalized = normalizeLanePurpose(purpose);
  return PURPOSE_META[normalized ?? DEFAULT_LANE_PURPOSE];
}

export function describeLanePurpose(purpose) {
  const normalized = normalizeLanePurpose(purpose);
  const meta = getLanePurposeMeta(purpose);
  return {
    purpose: normalized,
    label: meta.label,
    summary: meta.summary,
    executionHint: meta.executionHint,
    followupHint: meta.followupHint
  };
}

export function derivePurposeFromTaskLike(task) {
  return normalizeLanePurpose(task?.lanePurpose ?? task?.purpose ?? null);
}

export function buildPurposeGuidanceForTaskLike(task, fallbackPurpose = null) {
  const purpose = normalizeLanePurpose(derivePurposeFromTaskLike(task) ?? fallbackPurpose);
  const meta = describeLanePurpose(purpose);
  return {
    purpose,
    label: meta.label,
    summary: meta.summary,
    executionHint: meta.executionHint,
    followupHint: meta.followupHint
  };
}

export function buildPurposeSentence(taskLike, fallbackPurpose = null) {
  const guidance = buildPurposeGuidanceForTaskLike(taskLike, fallbackPurpose);
  if (!guidance.purpose) {
    return "This lane has no explicit planner purpose, so follow the queue state and task brief.";
  }
  return `This is ${guidance.label} work: ${guidance.summary}.`;
}
